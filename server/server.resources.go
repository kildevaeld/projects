package server

import (
	"fmt"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/golang.org/x/net/context"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/messages"
	"github.com/kildevaeld/projects/projects"
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

func (self *resourcesServer) Create(ctx context.Context, r *messages.ResourceCreate) (*messages.Resource, error) {

	var project database.Project
	fmt.Printf("MESSAGE %#v\n", r)
	err := self.core.Db.Get(database.ProjectsCol, r.ProjectId, &project)

	if err != nil {
		return nil, err
	}

	options := projects.ResourceCreateOptions{
		Name:    r.Name,
		Type:    r.Type,
		Project: &project,
		Data:    r.Data,
	}

	var resource *database.Resource
	resource, err = self.core.Resources.Create(&options)

	if err != nil {
		return nil, err
	}

	/*res, err := self.Resources.CreateResource(r.ProjectId, r)

	if err != nil {
		return nil, err
	}*/
	return resource.ToMessage(), nil
	//return res.ToMessage(), nil
}

func (self *resourcesServer) List(q *messages.ResourceQuery, stream messages.Resources_ListServer) error {
	var results []*database.Resource
	err := self.core.Db.List("Resources", &results)
	if err != nil {
		return err
	}

	for _, res := range results {
		stream.Send(res.ToMessage())
	}
	return nil
}

func (self *resourcesServer) ListTypes(ctx context.Context, q *messages.ResourceQuery) (*messages.ResourceType, error) {

	types := self.core.Resources.ListResourceTypes()

	return &messages.ResourceType{
		Types: types,
	}, nil

}
