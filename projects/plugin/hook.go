package plugin

import (
	"log"

	"github.com/kildevaeld/projects/projects"
)

type cmdHook struct {
	hook   projects.Hook
	client *Client
}

func (c *cmdHook) Run(name string, ui projects.UI, data interface{}) error {
	defer func() {
		r := recover()
		c.checkExit(r, nil)
	}()

	return c.hook.Run(name, ui /*ui, comm,*/, data)
}

func (c *cmdHook) Cancel() {
	defer func() {
		r := recover()
		c.checkExit(r, nil)
	}()

	c.hook.Cancel()
}

func (c *cmdHook) checkExit(p interface{}, cb func()) {
	if c.client.Exited() && cb != nil {
		cb()
	} else if p != nil && !Killed {
		log.Panic(p)
	}
}
