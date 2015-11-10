package rpc

import (
	"log"
	"net/rpc"

	"github.com/kildevaeld/projects/projects"
)

// An implementation of packer.Hook where the hook is actually executed
// over an RPC connection.
type hook struct {
	client *rpc.Client
	mux    *muxBroker
}

// HookServer wraps a packer.Hook implementation and makes it exportable
// as part of a Golang RPC server.
type HookServer struct {
	hook projects.Hook
	mux  *muxBroker
}

type HookRunArgs struct {
	Name     string
	Data     interface{}
	StreamId uint32
}

func (h *hook) Run(name string, ui projects.UI, data interface{}) error {
	nextId := h.mux.NextId()
	server := newServerWithMux(h.mux, nextId)
	//server.RegisterCommunicator(comm)
	server.RegisterUI(ui)
	go server.Serve()
	//nextId := h.mux.NextId()
	args := HookRunArgs{
		Name:     name,
		Data:     data,
		StreamId: nextId,
	}

	return h.client.Call("Hook.Run", &args, new(interface{}))
}

func (h *hook) Cancel() {
	err := h.client.Call("Hook.Cancel", new(interface{}), new(interface{}))
	if err != nil {
		log.Printf("Hook.Cancel error: %s", err)
	}
}

func (h *HookServer) Run(args *HookRunArgs, reply *interface{}) error {
	client, err := newClientWithMux(h.mux, args.StreamId)
	if err != nil {
		return NewBasicError(err)
	}
	defer client.Close()

	if err := h.hook.Run(args.Name, client.UI() /*client.Communicator()*/, args.Data); err != nil {
		return NewBasicError(err)
	}

	*reply = nil
	return nil
}

func (h *HookServer) Cancel(args *interface{}, reply *interface{}) error {
	h.hook.Cancel()
	return nil
}
