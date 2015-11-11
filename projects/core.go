package projects

import (
	"fmt"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/kildevaeld/go-pubsub"
	"github.com/kildevaeld/projects/database"
)

const (
	ResourceAddEvent = "resource:add"
)

type CoreConfig struct {
	Db database.Datastore
}

type Core struct {
	Db        database.Datastore
	Resources *Resources

	Mediator *pubsub.Pubsub

	resourceChan chan *database.Resource
}

func (self *Core) init() error {

	self.Resources = NewResources(self, 10)
	self.Mediator = pubsub.New(100)

	self.resourceChan = make(chan *database.Resource)
	err := self.Resources.Subscribe(self.resourceChan)

	if err != nil {
		close(self.resourceChan)
		return err
	}

	go func() {

		for {
			select {
			case res := <-self.resourceChan:
				fmt.Printf("added resource %d\n", res.Name)
				self.Mediator.Publish(ResourceAddEvent, res)

			}
		}

	}()

	return nil
}

func (self *Core) Close() {
	if self.resourceChan != nil {
		close(self.resourceChan)
	}
}

func NewCore(config CoreConfig) (*Core, error) {

	core := &Core{
		Db: config.Db,
	}

	return core, core.init()

}
