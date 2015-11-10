package database

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"

	"github.com/HouzuoGuo/tiedot/db"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/fatih/structs"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/mitchellh/mapstructure"
)

type Query map[string]interface{}

type Database struct {
	db *db.DB
}

func NewDatabase(path string) (*Database, error) {

	d, err := db.OpenDB(path)

	if err != nil {
		return nil, err
	}

	d.Create("Projects")
	d.Create("Resources")

	return &Database{
		db: d,
	}, nil
}

func getColName(item interface{}) string {
	var colName string
	for _, f := range structs.Fields(item) {
		colName = f.Tag("col")
		if colName != "" {
			break
		}
	}
	return colName
}

// Projects
func (self *Database) Create(colName string, item interface{}) error {
	/*s := structs.New(item)
	colName := ""
	for _, f := range s.Fields() {
		colName = f.Tag("col")
		if colName != "" {
			break
		}

	}

	if colName == "" {
		return errors.New("col name")
	}*/

	col := self.db.Use(colName)
	m := structs.Map(item)
	i, e := col.Insert(m)
	if e == nil {
		for _, field := range structs.Fields(item) {
			if field.Name() == "Id" || field.Name() == "ID" {
				field.Set(fmt.Sprintf("%d", i))
			}
		}
	}
	return e
}

func parse(id int, b []byte, i interface{}) error {
	var m map[string]interface{}

	err := json.Unmarshal(b, &m)
	if err != nil {
		return err
	}
	m["Id"] = fmt.Sprintf("%d", id)

	return mapstructure.Decode(m, i)
}

func (self *Database) List(colName string, result interface{}) error {
	resultv := reflect.ValueOf(result)
	if resultv.Kind() != reflect.Ptr || resultv.Elem().Kind() != reflect.Slice {
		panic("result argument must be a slice address")
	}
	slicev := resultv.Elem()
	//slicev = slicev.Slice(0, slicev.Cap())
	elemt := slicev.Type().Elem()

	col := self.db.Use(colName)
	i := 0

	var retError error
	col.ForEachDoc(func(id int, docContent []byte) (willMoveOn bool) {

		if slicev.Len() == i {
			elemp := reflect.New(elemt)
			if err := parse(id, docContent, elemp.Interface()); err != nil {
				retError = err
				return false
			}
			slicev = reflect.Append(slicev, elemp.Elem())
			//slicev = slicev.Slice(0, slicev.Cap())
		} else {
			return true
		}
		i++
		return true
	})
	resultv.Elem().Set(slicev.Slice(0, i))
	return nil
}

func (self *Database) Get(colName string, id string, result interface{}) error {
	col := self.db.Use(colName)

	i, e := strconv.Atoi(id)

	if e != nil {
		return e
	}

	item, err := col.Read(i)

	if err != nil || item == nil {
		return err
	}

	item["Id"] = fmt.Sprintf("%d", i)

	mapstructure.Decode(item, result)

	return nil
}

func (self *Database) Query(colName string, query Query, result interface{}) error {

	resultv := reflect.ValueOf(result)
	if resultv.Kind() != reflect.Ptr || resultv.Elem().Kind() != reflect.Slice {
		panic("result argument must be a slice address")
	}
	slicev := resultv.Elem()
	//slicev = slicev.Slice(0, slicev.Cap())
	elemt := slicev.Type().Elem()
	col := self.db.Use(colName)

	var out []Query

	for k, v := range query {
		q := Query{}
		q["eq"] = v
		q["in"] = []string{k}
		out = append(out, q)
	}

	queryResult := make(map[int]struct{}) // query result (document IDs) goes into map keys
	if err := db.EvalQuery(out, col, &queryResult); err != nil {
		return err
	}
	fmt.Printf("%v", queryResult)
	for id := range queryResult {
		elemp := reflect.New(elemt)
		if err := self.Get(colName, fmt.Sprintf("%d", id), elemp.Interface()); err != nil {
			return err
		}
		slicev = reflect.Append(slicev, elemp.Elem())
	}

	return nil

}
