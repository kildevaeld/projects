//go:generate stringer -type=ResourceType
package database

import "github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/mgo.v2/bson"

type Comment struct {
	Id       bson.ObjectId   `bson:"_id" json:"id"`
	UserId   string          `json:"name"`
	Groups   []bson.ObjectId `json:"groups"`
	Projects []bson.ObjectId `json:"projects"`
}
