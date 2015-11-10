package database

import (
	"errors"

	"github.com/fatih/structs"
	"github.com/kildevaeld/projects/messages"
	"github.com/mitchellh/mapstructure"
	"gopkg.in/mgo.v2/bson"
)

type Project struct {
	Id   bson.ObjectId `bson:"_id",gorm:"primary_key"`
	Name string        `json:"name",sql:"not null;unique"`
	//Projects []Project     //`gorm:"foreignkey:project_id;associationforeignkey:related_project_id;many2many:related_projects;" json:"related"`
}

func (p *Project) ToMessage() *messages.Project {
	var out messages.Project
	m := structs.Map(p)
	m["Id"] = p.Id.Hex()

	mapstructure.Decode(m, &out)

	return &out
}

func NewProjectFromMsg(p *messages.Project) (*Project, error) {

	if !bson.IsObjectIdHex(p.Id) {
		return nil, errors.New("invalid id format")
	}

	m := structs.Map(p)

	m["Id"] = bson.ObjectIdHex(p.Id)
	var out Project
	err := mapstructure.Decode(m, &out)

	return &out, err
}
