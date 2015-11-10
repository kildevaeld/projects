package server

import (
	"errors"
	"net"
	"path/filepath"
	"time"

	"github.com/kildevaeld/projects/messages"
	"github.com/kildevaeld/projects/projects"
	"google.golang.org/grpc"
)

type Client struct {
	conn *grpc.ClientConn
}

func (self *Client) Projects() messages.ProjectsClient {
	return messages.NewProjectsClient(self.conn)
}

func (self *Client) Resources() messages.ResourcesClient {
	return messages.NewResourcesClient(self.conn)
}

func NewClient() (*Client, error) {
	var opts []grpc.DialOption
	opts = append(opts, grpc.WithDialer(func(addr string, timeout time.Duration) (net.Conn, error) {
		return net.DialTimeout("unix", addr, timeout)
	}), grpc.WithInsecure())
	//addr, _ := net.ResolveUnixAddr("unix", "socket.unix")

	c, _ := projects.ConfigDir()

	path := filepath.Join(c, "projects.socket")

	conn, err := grpc.Dial(path, opts...)
	if err != nil {
		//grpclog.Fatalf("fail to dial: %v", err)
		return nil, err
	}

	err = waitForConnection(conn)

	return &Client{conn}, err
}

func waitForConnection(conn *grpc.ClientConn) error {
	state := conn.State()
	var err error

	if state != grpc.Ready {
		for {

			if !conn.WaitForStateChange(1*time.Second, conn.State()) {
				err = errors.New("connection")
			}

			state := conn.State()

			if state == grpc.Connecting || state == grpc.Idle {
				continue
			} else if state == grpc.TransientFailure {
				err = errors.New("fail")
			}

			break

		}
	}

	return err
}
