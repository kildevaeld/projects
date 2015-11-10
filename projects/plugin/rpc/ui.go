package rpc

import (
	"net/rpc"

	"github.com/kildevaeld/projects/projects"
)

// An implementation of packer.Hook where the hook is actually executed
// over an RPC connection.
type _ui struct {
	client *rpc.Client
	mux    *muxBroker
}

// HookServer wraps a packer.Hook implementation and makes it exportable
// as part of a Golang RPC server.
type UIServer struct {
	ui  projects.UI
	mux *muxBroker
}

type UIPrintArgs struct {
	Msg  string
	Args []interface{}
}

func (h *_ui) Printf(msg string, args ...interface{}) {

	a := UIPrintArgs{
		Msg:  msg,
		Args: args,
	}

	h.client.Call("UI.Printf", &a, new(interface{}))
}

func (h *UIServer) Printf(args *UIPrintArgs, reply *interface{}) error {
	h.ui.Printf(args.Msg, args.Args...)
	*reply = nil
	return nil
}
