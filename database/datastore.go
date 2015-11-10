package database

import (
	"errors"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/mgo.v2"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/mgo.v2/bson"
)

type Query map[string]interface{}

const (
	ResourcesCol = "Resources"
	ProjectsCol  = "Projects"
)

type Datastore interface {
	Create(colName string, item interface{}) error
	List(colName string, result interface{}) error
	Get(colName string, id string, result interface{}) error
	Query(colName string, query Query, result interface{}) error
	Remove(colName string, id string) error
}

type MongoDatastore struct {
	session *mgo.Session
}

func (self *MongoDatastore) Database() *mgo.Database {
	return self.session.DB("projects")
}

func (self *MongoDatastore) Create(colName string, item interface{}) error {

	c := self.Database().C(colName)
	return c.Insert(item)
}

func (self *MongoDatastore) List(colName string, result interface{}) error {
	col := self.Database().C(colName)
	return col.Find(nil).All(result)
}

func (self *MongoDatastore) Get(colName string, id string, result interface{}) error {
	if !bson.IsObjectIdHex(id) {
		return errors.New("invalid id format")
	}

	idObject := bson.ObjectIdHex(id)

	return self.Database().C(colName).FindId(idObject).One(result)
}

func (self *MongoDatastore) Query(colName string, query Query, result interface{}) error {
	return self.Database().C(colName).Find(query).All(result)
}

func (self *MongoDatastore) Remove(colName string, id string) error {
	return self.Database().C(colName).RemoveId(id)
}

func (self *MongoDatastore) Close() {
	self.session.Close()
}

func NewMongoDatastore() (*MongoDatastore, error) {

	session, err := mgo.Dial("127.0.0.1")
	if err != nil {
		return nil, err
	}
	session.SetMode(mgo.Monotonic, true)

	if err = session.Ping(); err != nil {
		return nil, err
	}

	return &MongoDatastore{session}, nil

}
