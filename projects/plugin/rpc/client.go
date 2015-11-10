package rpc

import (
	"io"
	"log"
	"net/rpc"

	"github.com/kildevaeld/projects/projects"
	"github.com/ugorji/go/codec"
)

// Client is the client end that communicates with a Packer RPC server.
// Establishing a connection is up to the user, the Client can just
// communicate over any ReadWriteCloser.
type Client struct {
	mux      *muxBroker
	client   *rpc.Client
	closeMux bool
}

func NewClient(rwc io.ReadWriteCloser) (*Client, error) {
	mux, err := newMuxBrokerClient(rwc)
	if err != nil {
		return nil, err
	}
	go mux.Run()

	result, err := newClientWithMux(mux, 0)
	if err != nil {
		mux.Close()
		return nil, err
	}

	result.closeMux = true
	return result, err
}

func newClientWithMux(mux *muxBroker, streamId uint32) (*Client, error) {
	clientConn, err := mux.Dial(streamId)
	if err != nil {
		return nil, err
	}

	h := &codec.MsgpackHandle{
		RawToString: true,
		WriteExt:    true,
	}

	clientCodec := codec.GoRpc.ClientCodec(clientConn, h)

	return &Client{
		mux:      mux,
		client:   rpc.NewClientWithCodec(clientCodec),
		closeMux: false,
	}, nil
}

func (c *Client) Hook() projects.Hook {
	return &hook{
		client: c.client,
		mux:    c.mux,
	}
}

func (c *Client) UI() projects.UI {
	return &_ui{
		client: c.client,
		mux:    c.mux,
	}
}

func (c *Client) Close() error {
	if err := c.client.Close(); err != nil {
		return err
	}

	if c.closeMux {
		log.Printf("[WARN] Client is closing mux")
		return c.mux.Close()
	}

	return nil
}
