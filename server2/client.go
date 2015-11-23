package server2

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net"
	"net/http"
	"path/filepath"

	"github.com/kildevaeld/projects/projects"
)

type Client struct {
	client *http.Client
}

func (self *Client) Endpoint(path string) string {
	if path[0] == '/' {
		path = path[1:]
	}
	return "http://projects.socket/" + path
}

func (self *Client) Do(method, path string, data interface{}) (*http.Response, error) {
	var body *bytes.Buffer = bytes.NewBuffer(nil)

	if data != nil {
		b, e := json.Marshal(data)
		if e != nil {
			return nil, e
		}
		body = bytes.NewBuffer(b)
	}
	endpoint := self.Endpoint(path)
	req, err := http.NewRequest(method, endpoint, body)

	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")

	return self.client.Do(req)

}

func (self *Client) readBody(resp *http.Response, v interface{}) error {
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		return err
	}

	return json.Unmarshal(body, v)

}

func NewClient() (*Client, error) {

	c, e := projects.ConfigDir()

	if e != nil {
		return nil, e
	}

	path := filepath.Join(c, "projects.socket")

	trans := http.Transport{
		Dial: func(proto, addr string) (conn net.Conn, err error) {
			return net.Dial("unix", path)
		},
	}
	client := &http.Client{
		Transport: &trans,
	}
	return &Client{client}, nil
}
