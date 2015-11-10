package rpc

import (
	"io"
	"log"
	"net/rpc"

	"github.com/kildevaeld/projects/projects"
	"github.com/ugorji/go/codec"
)

var (
	DefaultHookEndpoint = "Hook"
	DefaultUIEndpoint   = "UI"
)

type Server struct {
	mux      *muxBroker
	streamId uint32
	server   *rpc.Server
	closeMux bool
}

// NewServer returns a new Packer RPC server.
func NewServer(conn io.ReadWriteCloser) *Server {
	mux, _ := newMuxBrokerServer(conn)
	result := newServerWithMux(mux, 0)
	result.closeMux = true
	go mux.Run()
	return result
}

func newServerWithMux(mux *muxBroker, streamId uint32) *Server {
	return &Server{
		mux:      mux,
		streamId: streamId,
		server:   rpc.NewServer(),
		closeMux: false,
	}
}

func (s *Server) RegisterHook(h projects.Hook) {
	s.server.RegisterName(DefaultHookEndpoint, &HookServer{
		hook: h,
		mux:  s.mux,
	})
}

func (s *Server) RegisterUI(ui projects.UI) {
	s.server.RegisterName(DefaultUIEndpoint, &UIServer{
		ui:  ui,
		mux: s.mux,
	})
}

func (s *Server) Close() error {
	if s.closeMux {
		log.Printf("[WARN] Shutting down mux conn in Server")
		return s.mux.Close()
	}

	return nil
}

// ServeConn serves a single connection over the RPC server. It is up
// to the caller to obtain a proper io.ReadWriteCloser.
func (s *Server) Serve() {
	// Accept a connection on stream ID 0, which is always used for
	// normal client to server connections.
	stream, err := s.mux.Accept(s.streamId)
	if err != nil {
		log.Printf("[ERR] Error retrieving stream for serving: %s", err)
		return
	}
	defer stream.Close()

	h := &codec.MsgpackHandle{
		RawToString: true,
		WriteExt:    true,
	}
	rpcCodec := codec.GoRpc.ServerCodec(stream, h)
	s.server.ServeCodec(rpcCodec)
}
