package types

import (
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/fatih/structs"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/mitchellh/mapstructure"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/ugorji/go/codec"
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

type ResourceType interface {
	Create([]byte, *Message) error
	Remove()
}
