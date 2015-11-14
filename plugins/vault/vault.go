package main

import (
	"fmt"
	"os"

	"github.com/kildevaeld/projects/projects/plugins"
	"github.com/kildevaeld/projects/projects/types"
)

type Plugin struct {
}

func (self *Plugin) Commands() interface{} {
	return self
}

func (self *Plugin) Init() error {
	fmt.Printf("plugin is initialized\n")
	return nil
}

type ResourceType struct {
}

func (self *ResourceType) Create(b []byte, out *types.Message) error {
	*out = nil

	return nil
}

func (self *ResourceType) Remove() {}

func main() {

	p, e := plugins.Register(&Plugin{})
	if e != nil {
		return
	}

	e = p.RegisterResourceType("file", &ResourceType{})

	if e != nil {
		fmt.Printf("error %v", e)
		os.Exit(1)
	}

	p.Serve()

}
