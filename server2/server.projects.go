package server2

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/mgo.v2/bson"
	"github.com/kildevaeld/projects/database"
)

func (self *Server) createProject(w http.ResponseWriter, r *http.Request) {
	var project database.Project

	err := self.read(r, &project)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}
	project.Id = bson.NewObjectId()
	err = self.core.Db.Create(database.ProjectsCol, &project)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	}

	self.respond(w, &project)

}

func (self *Server) listProjects(w http.ResponseWriter, r *http.Request) {
	var out []*database.Project
	err := self.core.Db.List(database.ProjectsCol, &out)
	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}
	self.respond(w, &out)
}

func (self *Server) getProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["prokect_id"]

	var project database.Project
	err := self.core.Db.Get(database.ProjectsCol, id, &project)

	if err != nil {
		self.writeError(w, err, 300)
		return
	}

	self.respond(w, &project)

}

func (self *Server) removeProject(w http.ResponseWriter, r *http.Request) {

}

func (self *Server) updateProject(w http.ResponseWriter, r *http.Request) {

}
