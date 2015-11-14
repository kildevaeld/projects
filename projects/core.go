package projects

import (
	"log"
	"os"
	"path/filepath"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/kildevaeld/go-pubsub"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/projects/plugins"
	"github.com/kildevaeld/projects/projects/types"
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

	config   CoreConfig
	Mediator *pubsub.Pubsub
	//PubSub       *pub.PubsubServer
	resourceChan chan *database.Resource
	kill         chan struct{}

	plugins *plugins.PluginHost
}

func (self *Core) init() error {

	self.Resources = NewResources(self, 10)
	self.Mediator = pubsub.New(100)

	host, err := initPluginHost(self, self.config)

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

	/*soc := filepath.Join(self.config.ConfigPath)
	fmt.Printf(soc)
	self.PubSub, err = pub.NewPubsubServer(pub.PubsubConfig{
		PubAddress: "ipc://" + filepath.Join(soc, "publish.socket"),
		SubAddress: "ipc://" + filepath.Join(soc, "subscribe.socket"),
	})*/

	self.kill = make(chan struct{})

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

func initPluginHost(core *Core, config CoreConfig) (host *plugins.PluginHost, err error) {

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

	go func() {

		for {
			select {
			case plugin := <-host.PluginRegister:
				plugin.Rpc.RegisterFunc("sys", "RegisterResourceType", func(o types.Message, out *types.Message) error {
					*out = nil
					creator := resourceTypeCreator{host, o["PluginId"].(string)}
					return core.Resources.Register(o["Type"].(string), &creator)
				})
			}
		}

	}()

	err = host.InitAllPlugins()

	return
}

func (self *Core) Close() error {
	self.kill <- struct{}{}
	if self.resourceChan != nil {
		close(self.resourceChan)
	}
	/*if self.PubSub != nil {
		err := self.PubSub.Close()
		time.Sleep(time.Second)
		return err
	}*/

	return self.plugins.Close()

	//return nil
}

func NewCore(config CoreConfig) (*Core, error) {
	log.SetPrefix("[CORE] ")
	core := &Core{
		Db:     config.Db,
		config: config,
	}

	return core, core.init()

}
