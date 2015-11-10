package projects

import "github.com/kildevaeld/projects/database"

type CoreConfig struct {
	Db database.Datastore
}

type Core struct {
	Db database.Datastore
}

func (c *Core) Start() {}
