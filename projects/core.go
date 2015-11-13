package projects

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/kildevaeld/go-pubsub"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/projects/plugins"
	pub "github.com/kildevaeld/projects/pubsub"
	"github.com/kildevaeld/projects/utils"
)

const (
	ResourceAddEvent = "resource:add"
)

type CoreConfig struct {
	ConfigPath  string
	PluginPaths []string
	Db          database.Datastore
}

type Core struct {
	Db        database.Datastore
	Resources *Resources

	config       CoreConfig
	Mediator     *pubsub.Pubsub
	PubSub       *pub.PubsubServer
	resourceChan chan *database.Resource
	kill         chan struct{}

	plugins *plugins.PluginHost
}

func (self *Core) init() error {

	self.Resources = NewResources(self, 10)
	self.Mediator = pubsub.New(100)

	host, err := initPluginHost(self.config)

	if err != nil {
		return err
	}

	self.plugins = host

	self.resourceChan = make(chan *database.Resource)
	err = self.Resources.Subscribe(self.resourceChan)

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

func initPluginHost(config CoreConfig) (host *plugins.PluginHost, err error) {

	defaultPluginPath := filepath.Join(config.ConfigPath, "plugins")

	if !utils.IsDir(defaultPluginPath) {
		err = os.MkdirAll(defaultPluginPath, 0755)
	}

	if err != nil {
		return
	}

	paths := append([]string{defaultPluginPath}, config.PluginPaths...)

	if host, err = plugins.NewPluginHost(plugins.HostConfig{
		Paths:      paths,
		Publisher:  "tcp://127.0.0.1:4000",
		Subscriber: "tcp://127.0.0.1:4001",
	}); err != nil {
		return
	}

	err = host.InitAllPlugins()

	return
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
