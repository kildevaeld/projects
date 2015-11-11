package projects

import (
	"fmt"
	"path/filepath"
	"time"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/kildevaeld/go-pubsub"
	"github.com/kildevaeld/projects/database"
	pub "github.com/kildevaeld/projects/pubsub"
)

const (
	ResourceAddEvent = "resource:add"
)

type CoreConfig struct {
	ConfigPath string
	Db         database.Datastore
}

type Core struct {
	Db        database.Datastore
	Resources *Resources

	config       CoreConfig
	Mediator     *pubsub.Pubsub
	PubSub       *pub.PubsubServer
	resourceChan chan *database.Resource
	kill         chan struct{}
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

	soc := filepath.Join(self.config.ConfigPath)
	fmt.Printf(soc)
	self.PubSub, err = pub.NewPubsubServer(pub.PubsubConfig{
		PubAddress: "ipc://" + filepath.Join(soc, "publish.socket"),
		SubAddress: "ipc://" + filepath.Join(soc, "subscribe.socket"),
	})

	self.kill = make(chan struct{})

	if err != nil {
		return err
	}

	err = self.PubSub.Start()
	if err != nil {
		return err
	}

	go func() {
		defer close(self.kill)
	loop:
		for {
			select {
			case res := <-self.resourceChan:
				self.Mediator.Publish(ResourceAddEvent, res)
			case <-self.kill:
				break loop
			}
		}

	}()

	return nil
}

func (self *Core) Close() error {
	self.kill <- struct{}{}
	if self.resourceChan != nil {
		close(self.resourceChan)
	}
	if self.PubSub != nil {
		err := self.PubSub.Close()
		time.Sleep(time.Second)
		return err
	}

	return nil
}

func NewCore(config CoreConfig) (*Core, error) {

	core := &Core{
		Db:     config.Db,
		config: config,
	}

	return core, core.init()

}
