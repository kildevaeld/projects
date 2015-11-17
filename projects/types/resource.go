package types

import (
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/fatih/structs"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/mitchellh/mapstructure"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/ugorji/go/codec"
	"github.com/kildevaeld/projects/database"
)

type Message map[string]interface{}

func (self Message) To(args interface{}) error {
	return mapstructure.Decode(self, args)
}

func ToMessage(args interface{}) Message {
	return structs.Map(args)
}

func (self Message) Encode() []byte {
	var b []byte
	e := codec.NewEncoderBytes(&b, &codec.MsgpackHandle{
		RawToString: true,
	})

	e.Encode(&self)
	return b
}

type Context interface {
}

// Plugin types

type ResourceType interface {
	Create(Context, []byte) (*Message, error)
	Remove(Context, *database.Resource) error
	Info(Context, *database.Resource) (*Message, error)
}

type ResourceHandler interface {
	CanHandle(*database.Resource) bool
	Attach(Context, *database.Resource) error
	Unattach(Context, *database.Resource) error
}
