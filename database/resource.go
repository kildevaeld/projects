//go:generate stringer -type=ResourceType
package database

import (
	"encoding/json"
	"fmt"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/fatih/structs"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/mitchellh/mapstructure"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/mgo.v2/bson"
	"github.com/kildevaeld/projects/messages"
)

type ResourceType int

const (
	Directory ResourceType = iota
	File
	Url
)

type Resource struct {
	Id        bson.ObjectId          `bson:"_id" json:"id"`
	ProjectId bson.ObjectId          `bson:"project_id" json:"project_id"`
	Type      string                 `json:"type"`
	Name      string                 `json:"name"`
	Fields    map[string]interface{} `json:"fields"`
	Handlers  []bson.ObjectId        `json:"handlers"`
}

func (self *Resource) ToMessage() *messages.Resource {
	m := structs.Map(self)
	m["Id"] = self.Id.Hex()
	m["ProjectId"] = self.ProjectId.Hex()
	b, _ := json.Marshal(self.Fields)

	delete(m, "Fields")

	m["Fields"] = b
	//m["Type"] = self.Type.String()

	var out messages.Resource
	mapstructure.Decode(m, &out)

	return &out
}

func NewResourceFromMsg(resource *messages.Resource) (*Resource, error) {

	m := structs.Map(resource)

	fields := m["Fields"]
	fmt.Printf("fields %v", fields)

	delete(m, "Fields")

	var out Resource
	err := mapstructure.Decode(m, &out)

	if err != nil {
		return nil, err
	}
	return &out, nil

}
