package server2

import (
	"fmt"
	"net/http"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/projects"
)

func getProject(db database.Datastore, r *http.Request) (*database.Project, error) {
	vars := mux.Vars(r)
	projectId := vars["project_id"]

	if projectId == "" {
		return nil, fmt.Errorf("no project_id specified")
	}

	var project database.Project
	err := db.Get(database.ProjectsCol, projectId, &project)
	if err != nil {
		return nil, fmt.Errorf("could not find project: %s, error: %v", projectId, err)
	} else if !project.Id.Valid() {
		return nil, fmt.Errorf("project with id: %s, not found", projectId)
	}

	return &project, nil
}

func (self *Server) createResource(w http.ResponseWriter, r *http.Request) {
	/*vars := mux.Vars(r)
	projectId := vars["project_id"]

	if projectId == "" {
		self.writeError(w, errors.New("no project"), http.StatusBadRequest)
		return
	}

	var project database.Project
	err := self.core.Db.Get(database.ProjectsCol, projectId, &project)
	if err != nil {
		self.writeError(w, fmt.Errorf("could not find project: %s, error: %v", projectId, err), http.StatusBadRequest)
		return
	} else if !project.Id.Valid() {
		self.writeError(w, fmt.Errorf("project with id: %s, not found", projectId), http.StatusNoContent)
		return
	}*/

	project, err := getProject(self.core.Db, r)

	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}

	var resource database.Resource
	err = self.read(r, &resource)
	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}

	options := projects.ResourceCreateOptions{
		Project:  project,
		Resource: &resource,
	}

	_, err = self.core.Resources.Create(&options)

	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}

	self.respond(w, &resource)

}

func (self *Server) listResources(w http.ResponseWriter, r *http.Request) {

	project, err := getProject(self.core.Db, r)

	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}

	q := database.Query{
		"project_id": project.Id,
	}

	var result []*database.Resource
	err = self.core.Db.Query(database.ResourcesCol, q, &result)
	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}

	self.respond(w, &result)

}

func (self *Server) getResource(w http.ResponseWriter, r *http.Request) {
	project, err := getProject(self.core.Db, r)

	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}

	vars := mux.Vars(r)
	resource_id := vars["resource_id"]

	var resource *database.Resource
	err = self.core.Db.Get(database.ResourcesCol, resource_id, &resource)

	if err != nil {

		self.writeError(w, err, http.StatusBadRequest)
		return
	}

	if project.Id.Hex() != resource.ProjectId.Hex() {
		self.writeError(w, fmt.Errorf("project %s does not have a resource with id: %s", project.Id.Hex(), resource_id), http.StatusBadRequest)
		return
	}

	self.respond(w, &resource)

}

func (self *Server) removeResource(w http.ResponseWriter, r *http.Request) {
	_, err := getProject(self.core.Db, r)

	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}
}

func (self *Server) updateResource(w http.ResponseWriter, r *http.Request) {
	_, err := getProject(self.core.Db, r)

	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}
}
