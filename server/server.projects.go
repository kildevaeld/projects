package server

import (
	"github.com/kildevaeld/projects/database"
	msg "github.com/kildevaeld/projects/messages"
	"github.com/kildevaeld/projects/projects"
	"golang.org/x/net/context"
)

type projectServer struct {
	core *projects.Core
}

func (self *projectServer) Get(ctx context.Context, q *msg.ProjectQuery) (*msg.Project, error) {
	var project database.Project
	err := self.core.Db.Get("Projects", q.Id, &project)

	if err != nil {
		return nil, err
	}

	return project.ToMessage(), err
}

func (self *projectServer) Create(ctx context.Context, p *msg.Project) (*msg.Project, error) {

	res, err := database.NewProjectFromMsg(p)

	if err != nil {
		return nil, err
	}

	err = self.core.Db.Create("Projects", res)

	return res.ToMessage(), err
}

func (self *projectServer) List(q *msg.ProjectQuery, s msg.Projects_ListServer) error {
	var ps []*database.Project
	//ps := make([]msg.Project, 200)
	var err error
	if q.Name != "" {
		query := database.Query{
			"Name": q.Name,
		}

		err = self.core.Db.Query("Projects", query, &ps)
	} else {
		err = self.core.Db.List("Projects", &ps)
	}

	if err != nil {
		return err
	}

	for _, p := range ps {
		s.Send(p.ToMessage())
	}

	return nil
}
