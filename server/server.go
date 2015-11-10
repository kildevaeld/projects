package server

import (
	"errors"
	"net"
	"path/filepath"

	"gopkg.in/tomb.v2"

	"github.com/kildevaeld/projects/messages"
	"github.com/kildevaeld/projects/projects"
	"google.golang.org/grpc"
)

type Server struct {
	listener net.Listener
	server   *grpc.Server
	core     *projects.Core
	tomb     tomb.Tomb
}

var errStop = errors.New("errorstop")

func (s *Server) Start() error {
	c, _ := projects.ConfigDir()
	socketpath := filepath.Join(c, "projects.socket")

	addr, err := net.ResolveUnixAddr("unix", socketpath)

	if err != nil {
		return err
	}

	listener, e := net.ListenUnix("unix", addr)
	if e != nil {
		return e
	}

	var opts []grpc.ServerOption

	grpcServer := grpc.NewServer(opts...)
	messages.RegisterProjectsServer(grpcServer, &projectServer{s.core})
	messages.RegisterResourcesServer(grpcServer, &resourcesServer{s.core})

	//s.core.Log.Infof("project daemon started and listening on %s", socketpath)
	s.server = grpcServer
	s.listener = listener

	s.tomb.Go(func() error { return grpcServer.Serve(listener) })
	return nil
}

func (self *Server) Stop() error {
	self.tomb.Kill(errStop)

	if self.server != nil {
		self.server.Stop()
	}
	if self.listener != nil {
		self.listener.Close()
	}

	err := self.tomb.Wait()
	if err == errStop {
		return nil
	}
	return err
}

func NewServer(core *projects.Core) *Server {

	server := &Server{
		core: core,
	}

	return server
}
