package projects

import (
	"errors"
	"fmt"
	"log"
	"strings"
	"sync"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/mgo.v2/bson"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/projects/plugins"
	"github.com/kildevaeld/projects/projects/types"
	"github.com/kildevaeld/projects/utils"
)

type ResourceCreateOptions struct {
	Project *database.Project
	//Data    []byte
	//Name    string
	//Type    string
	Resource *database.Resource
}

var resource_creators = make(map[string]types.ResourceType)

type ResourceCreator interface {
	Create([]byte) (map[string]interface{}, error)
	Remove(map[string]interface{}) error
}

type resourceTypeCreator struct {
	host   *plugins.PluginHost
	plugin string
}

func (self *resourceTypeCreator) Create(b []byte, msg *types.Message) error {
	plugin, err := self.host.Plugin(self.plugin)
	*msg = nil
	if err != nil {
		return err
	}

	return plugin.Call(plugins.EndpointResourceType+".Create", b, msg)

	//return nil
}

func (self *resourceTypeCreator) Remove() {

}

type Resources struct {
	core             *Core
	resourceTypes    map[string]types.ResourceType
	resourceHandlers map[string]map[string]types.ResourceHandler
	lock             sync.RWMutex
	max              int
	channels         []chan<- *database.Resource
}

func (self *Resources) Create(options *ResourceCreateOptions) (*database.Resource, error) {
	self.lock.RLock()
	defer self.lock.RUnlock()

	resource := options.Resource

	resType, ok := self.resourceTypes[strings.ToLower(resource.Type)]

	if !ok {
		return nil, fmt.Errorf("could not find resource type: %s", resource.Type)
	}

	//var m types.Message
	_, err := resType.Create(struct{}{}, resource)

	if err != nil {
		return nil, err
	}

	resource.Id = bson.NewObjectId()
	resource.ProjectId = options.Project.Id

	/*res := database.Resource{
		Id:        bson.NewObjectId(),
		Name:      options.Name,
		ProjectId: options.Project.Id,
		Type:      options.Type,
		Fields:    *m,
	}*/

	err = self.core.Db.Create(database.ResourcesCol, resource)

	if err == nil {
		self.publish(resource)
	}

	return resource, err
}

func (self *Resources) Subscribe(ch chan<- *database.Resource) error {
	self.lock.Lock()
	defer self.lock.Unlock()

	if len(self.channels) >= self.max {
		return errors.New("max")
	}

	self.channels = append(self.channels, ch)

	return nil
}

func (self *Resources) Unsubscribe(ch chan<- *database.Resource) error {
	self.lock.Lock()
	defer self.lock.Unlock()

	found := false
	for i, c := range self.channels {
		if c == ch {
			self.channels = append(self.channels[:i], self.channels[i:]...)
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("channel not registered")
	}

	return nil
}

func (self *Resources) publish(resource *database.Resource) {
	self.lock.RLock()
	defer self.lock.RUnlock()

	for _, ch := range self.channels {
		select {
		case ch <- resource:
		default:
		}
	}
}

func (self *Resources) registerResourceType(msg types.Message, out *types.Message) error {
	fmt.Printf("%#v\n", msg)
	return nil
}

func (self *Resources) RegisterResourceType(resourceType string, creator types.ResourceType) error {
	self.lock.Lock()
	defer self.lock.Unlock()

	if _, ok := self.resourceTypes[resourceType]; ok {
		return fmt.Errorf("creator for resource %s already exists", resourceType)
	}
	log.Printf("registering resource type: %s", resourceType)
	self.resourceTypes[resourceType] = creator

	return nil
}

func (self *Resources) RegisterResourceHandler(resourceType, name string, handler types.ResourceHandler) error {
	self.lock.Lock()
	defer self.lock.Unlock()

	if resourceHandlers, ok := self.resourceHandlers[resourceType]; ok {
		if _, ok := resourceHandlers[name]; ok {
			return fmt.Errorf("resource handler with name: %s already registered", name)
		}
		log.Printf("registering resourcehandler %s for type: %s", name, resourceType)
		resourceHandlers[name] = handler

	}

	return fmt.Errorf("resource type, %s , does not exists", resourceType)
}

func (self *Resources) UnregisterResourceType(resourceType string) error {
	self.lock.Lock()
	defer self.lock.Unlock()

	if _, ok := self.resourceTypes[resourceType]; !ok {
		return fmt.Errorf("resource type %s not registered", resourceType)
	}

	delete(self.resourceTypes, resourceType)

	return nil
}

func (self *Resources) ListResourceTypes() []string {
	self.lock.RLock()
	defer self.lock.RUnlock()
	var keys []string
	for k, _ := range self.resourceTypes {
		keys = append(keys, k)
	}
	return keys
}

func (self *Resources) ListResourceHandlers(resourceType string) ([]string, error) {
	self.lock.RLock()
	defer self.lock.RUnlock()
	var out []string
	if resourceHandlers, ok := self.resourceHandlers[resourceType]; ok {
		for k, _ := range resourceHandlers {
			out = append(out, k)
		}
	} else {
		return nil, fmt.Errorf("resource type: %s is not registered", resourceType)
	}

	return out, nil
}

func (self *Resources) AttachHandler(ctx types.Context, resource *database.Resource, resourceHandler string) error {
	self.lock.RLock()
	defer self.lock.RUnlock()
	if resourceHandlers, ok := self.resourceHandlers[resource.Type]; ok {
		if handler, ok := resourceHandlers[resourceHandler]; ok {
			if !handler.CanHandle(resource) {
				return fmt.Errorf("resource handler: %s cannot handle resource", resourceHandler)
			}
			return handler.Attach(ctx, resource)
		}

		return fmt.Errorf("resource handler %s not registed", resourceHandler)
	} else {
		return fmt.Errorf("resource type: %s is not registered", resource.Type)
	}
}

func NewResources(core *Core, max int) *Resources {
	log.SetPrefix("[RESOURCES ] ")
	return &Resources{
		core:             core,
		max:              max,
		resourceTypes:    make(map[string]types.ResourceType),
		resourceHandlers: make(map[string]map[string]types.ResourceHandler),
		channels:         make([]chan<- *database.Resource, 0),
	}
}

type DirectoryResource struct {
}

func (self *DirectoryResource) Create(b []byte) (map[string]interface{}, error) {

	path := string(b)

	if !utils.FileExists(path) || !utils.IsDir(path) {
		return nil, errors.New("path not a file or a directory")
	}

	m := database.Query{
		"Path": path,
	}

	return m, nil
}

func (self *DirectoryResource) Remove(m map[string]interface{}) error {

	return nil
}

func init() {
	//resource_creators["directory"] = &DirectoryResource{}
}
