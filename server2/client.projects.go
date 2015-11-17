package server2

import (
	"errors"

	"github.com/kildevaeld/projects/database"
)

func (self *Client) CreateProject(project *database.Project) error {

	resp, err := self.Do("POST", "/projects", project)

	if err != nil {
		return err
	}

	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return errors.New(resp.Status)
	}

	return self.readBody(resp, project)
}

func (self *Client) ListProjects(q Query) ([]*database.Project, error) {

	resp, err := self.Do("GET", "/projects", q)

	if err != nil {
		return nil, err
	}

	var out []*database.Project
	err = self.readBody(resp, &out)

	return out, err
}

func (self *Client) Get(id string) (*database.Project, error) {

	resp, err := self.Do("GET", "/projects/"+id, nil)
	if err != nil {
		return nil, err
	}

	var out *database.Project
	err = self.readBody(resp, &out)

	return out, err

}
