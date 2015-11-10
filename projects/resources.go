package projects

import (
	"errors"
	"fmt"
	"strings"
	"sync"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/mgo.v2/bson"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/utils"
)

type ResourceCreateOptions struct {
	Project *database.Project
	Data    []byte
	Name    string
	Type    string
}

var resource_creators = make(map[string]ResourceCreator)

type ResourceCreator interface {
	Create([]byte) (map[string]interface{}, error)
	Remove(map[string]interface{}) error
}

type Resources struct {
	core     *Core
	creators map[string]ResourceCreator
	lock     sync.RWMutex
	max      int
	channels []chan<- *database.Resource
}

func (self *Resources) Create(options *ResourceCreateOptions) (*database.Resource, error) {
	self.lock.RLock()
	defer self.lock.RUnlock()

	resType, ok := resource_creators[strings.ToLower(options.Type)]

	if !ok {
		return nil, fmt.Errorf("could not find resource type: %s", options.Type)
	}

	m, err := resType.Create(options.Data)

	if err != nil {
		return nil, err
	}

	res := database.Resource{
		Id:        bson.NewObjectId(),
		Name:      options.Name,
		ProjectId: options.Project.Id,
		Type:      options.Type,
		Fields:    m,
	}

	err = self.core.Db.Create(database.ResourcesCol, &res)

	if err == nil {
		self.publish(&res)
	}

	return &res, err
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

func (self *Resources) Register(resourceType string, creator ResourceCreator) error {
	self.lock.Lock()
	defer self.lock.Unlock()

	if _, ok := resource_creators[resourceType]; ok {
		return fmt.Errorf("creator for resource %s already exists", resourceType)
	}

	resource_creators[resourceType] = creator

	return nil
}

func (self *Resources) Unregister(resourceType string) error {
	self.lock.Lock()
	defer self.lock.Unlock()

	if _, ok := resource_creators[resourceType]; !ok {
		return fmt.Errorf("resource type %s not registered", resourceType)
	}

	delete(resource_creators, resourceType)

	return nil
}

func (self *Resources) ListResourceTypes() []string {
	self.lock.RLock()
	defer self.lock.RUnlock()
	var keys []string
	for k, _ := range resource_creators {
		keys = append(keys, k)
	}
	return keys
}

func NewResources(core *Core, max int) *Resources {
	return &Resources{
		core:     core,
		max:      max,
		creators: make(map[string]ResourceCreator),
		channels: make([]chan<- *database.Resource, max),
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
	resource_creators["directory"] = &DirectoryResource{}
}
