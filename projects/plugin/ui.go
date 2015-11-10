package plugin

import (
	"log"

	"github.com/kildevaeld/projects/projects"
)

type cmdUI struct {
	ui     projects.UI
	client *Client
}

func (c *cmdUI) Printf(msg string, args ...interface{}) {
	defer func() {
		r := recover()
		c.checkExit(r, nil)
	}()

	c.ui.Printf(msg, args...)
}

func (c *cmdUI) checkExit(p interface{}, cb func()) {
	if c.client.Exited() && cb != nil {
		cb()
	} else if p != nil && !Killed {
		log.Panic(p)
	}
}
