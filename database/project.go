package database

import (
	"errors"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/fatih/structs"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/mitchellh/mapstructure"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/mgo.v2/bson"
	"github.com/kildevaeld/projects/messages"
)

type Project struct {
	Id          bson.ObjectId `bson:"_id" json:"id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	//Projects []Project     //`gorm:"foreignkey:project_id;associationforeignkey:related_project_id;many2many:related_projects;" json:"related"`
}

func (p *Project) ToMessage() *messages.Project {
	var out messages.Project
	m := structs.Map(p)
	m["id"] = p.Id.Hex()

	mapstructure.Decode(m, &out)

	return &out
}

func NewProjectFromMsg(p *messages.Project) (*Project, error) {
	m := structs.Map(p)

	if p.Id != "" && !bson.IsObjectIdHex(p.Id) {
		return nil, errors.New("invalid id format")
	}

	if p.Id != "" {
		m["id"] = bson.ObjectIdHex(p.Id)
	}

	var out Project
	err := mapstructure.Decode(m, &out)

	return &out, err
}
