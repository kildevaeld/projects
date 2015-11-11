package pubsub

import (
	"errors"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/pebbe/zmq4"
)

// ZMQ4 client - just defines the pub and sub ZMQ4 sockets.
type PubsubClient struct {
	pub *zmq4.Socket
	sub *zmq4.Socket
}

func NewPubsubClient(config PubsubConfig) (*PubsubClient, error) {

	context, err := zmq4.NewContext()
	var pub *zmq4.Socket
	var sub *zmq4.Socket

	if err != nil {
		return nil, err
	}

	if sub, err = context.NewSocket(zmq4.SUB); err != nil {
		return nil, err
	}

	if pub, err = context.NewSocket(zmq4.PUSH); err != nil {
		return nil, err
	}

	if err = pub.Connect(config.PubAddress); err != nil {

		return nil, err
	}

	if err = sub.Connect(config.SubAddress); err != nil {
		return nil, err
	}

	return &PubsubClient{pub, sub}, nil

}

func (client *PubsubClient) Subscribe(channels ...interface{}) error {
	for _, channel := range channels {

		err := client.sub.SetSubscribe(channel.(string))
		if err != nil {
			return err
		}
	}
	return nil
}

func (client *PubsubClient) Unsubscribe(channels ...interface{}) error {
	for _, channel := range channels {
		err := client.sub.SetUnsubscribe(channel.(string))

		if err != nil {
			return err
		}
	}
	return nil
}

func (client *PubsubClient) Publish(channel string, message ...[]byte) error {
	if len(message) == 0 {
		return errors.New("must specify at least one arguments")
	}
	_, e := client.pub.SendMessage(channel, message)

	return e
}

func (client *PubsubClient) Receive() (*Message, error) {

	message, e := client.sub.RecvMessageBytes(0)

	if e != nil {
		return nil, e
	}
	if len(message) < 2 {
		return nil, errors.New("invalid message")
	}

	return &Message{Type: "message", Channel: string(message[0]), Data: message[1:]}, nil

}
