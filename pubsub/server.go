package pubsub

import (
	"errors"
	"fmt"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/hashicorp/go-multierror"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/pebbe/zmq4"
)

type PubsubServer struct {
	config PubsubConfig
	pub    *zmq4.Socket
	sub    *zmq4.Socket
	events chan *Message
}

var errStop = errors.New("errStop")

func NewPubsubServer(config PubsubConfig) (*PubsubServer, error) {

	/*context, err := zmq4.NewContext()
	var pub *zmq4.Socket
	var sub *zmq4.Socket

	if err != nil {
		return nil, err
	}

	if sub, err = context.NewSocket(zmq4.PULL); err != nil {
		return nil, err
	}

	if pub, err = context.NewSocket(zmq4.PUB); err != nil {
		return nil, err
	}

	if err = pub.Bind(config.PubAddress); err != nil {
		return nil, err
	}

	if err = sub.Bind(config.SubAddress); err != nil {
		return nil, err
	}*/

	return &PubsubServer{
		config: config,
	}, nil

}

func (self *PubsubServer) Start() error {
	config := self.config
	context, err := zmq4.NewContext()
	var pub *zmq4.Socket
	var sub *zmq4.Socket

	var result error

	if err != nil {
		return err
	}

	close := func() {
		if pub != nil {
			pub.Unbind(self.config.PubAddress)
			pub.Close()
		}
		if sub != nil {
			sub.Unbind(self.config.SubAddress)
			sub.Close()
		}
	}

	if sub, err = context.NewSocket(zmq4.PULL); err != nil {
		result = multierror.Append(result, err)
	}

	if pub, err = context.NewSocket(zmq4.PUB); err != nil {
		result = multierror.Append(result, err)
	}

	if err = pub.Bind(config.PubAddress); err != nil {
		result = multierror.Append(result, err)
	}
	if err = sub.Bind(config.SubAddress); err != nil {
		result = multierror.Append(result, err)
	}

	if result != nil {
		close()
		return result
	}

	self.sub = sub
	self.pub = pub

	go func() error {
		var err error

		for {

			msg, err := self.Receive()

			if err != nil {
				fmt.Printf("error %v\n", err)
			}

			if self.events != nil {
				self.events <- msg
			}

			go self.Send(msg.Channel, msg.Data...)

		}

		return err
	}()

	return nil

}

func (self *PubsubServer) Close() error {
	if self.pub != nil {
		self.pub.Unbind(self.config.PubAddress)
		self.pub.Close()
	}
	if self.sub != nil {
		self.sub.Unbind(self.config.SubAddress)
		self.sub.Close()
	}
	if self.events != nil {
		close(self.events)
	}

	return nil
}

func (self *PubsubServer) Events() <-chan *Message {
	if self.events == nil {
		self.events = make(chan *Message, 1)
	}
	return self.events
}

func (self *PubsubServer) Receive() (*Message, error) {
	m, e := self.sub.RecvMessageBytes(0)

	if e != nil {
		return nil, e
	}
	if len(m) < 2 {
		return nil, errors.New("invalid message")
	}

	return &Message{
		Type:    "message",
		Channel: string(m[0]),
		Data:    m[1:],
	}, nil
}

func (self *PubsubServer) Send(channel string, msg ...[]byte) (int, error) {
	if len(msg) == 0 {
		return 0, errors.New("must specify at least one arguments")
	}
	return self.pub.SendMessage(channel, msg)
}
