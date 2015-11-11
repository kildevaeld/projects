package pubsub

type Message struct {
	Type    string
	Channel string
	Data    [][]byte
}

// Client interface for both Redis and ZMQ4 pubsub clients.
type PubSubber interface {
	Subscribe(channels ...interface{}) (err error)
	Unsubscribe(channels ...interface{}) (err error)
	Publish(channel string, message string)
	Receive() (message Message)
}

type PubsubConfig struct {
	PubAddress string
	SubAddress string
	ServerMode bool
}
