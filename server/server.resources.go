package server

import (
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/messages"
	"github.com/kildevaeld/projects/projects"
	"golang.org/x/net/context"
)

type resourcesServer struct {
	core *projects.Core
}

func (self *resourcesServer) Get(ctx context.Context, q *messages.ResourceQuery) (*messages.Resource, error) {

	var out database.Resource

	err := self.core.Db.Get("Resources", q.Id, &out)

	if err != nil {
		return nil, err
	}

	return out.ToMessage(), nil
}

func (self *resourcesServer) Create(ctx context.Context, r *messages.Resource) (*messages.Resource, error) {

	res, err := database.NewResourceFromMsg(r)

	if err != nil {
		return nil, err
	}

	err = self.core.Db.Create("Resources", res)

	return res.ToMessage(), nil
}

func (self *resourcesServer) List(q *messages.ResourceQuery, stream messages.Resources_ListServer) error {
	var results []*database.Resource
	err := self.core.Db.List("Resources", results)
	if err != nil {
		return err
	}

	for _, res := range results {
		stream.Send(res.ToMessage())
	}
	return nil
}
