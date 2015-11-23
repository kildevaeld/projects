package server2

import (
	"net/http"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/mgo.v2/bson"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/projects/types"
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

	self.render.JSON(w, http.StatusOK, &out)
	//self.respond(w, &out)
}

func (self *Server) getProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["project_id"]

	var project database.Project
	err := self.core.Db.Get(database.ProjectsCol, id, &project)

	if err != nil {
		self.writeError(w, err, 300)
		return
	}

	self.respond(w, &project)

}

func (self *Server) removeProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["project_id"]

	err := self.core.Db.Remove(database.ProjectsCol, id)

	if err != nil {
		self.writeError(w, err, 500)
	}

	self.render.JSON(w, http.StatusOK, &Query{
		"code":    200,
		"message": "ok",
	})

}

func (self *Server) updateProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["project_id"]
	var project database.Project
	err := self.read(r, &project)

	if err != nil {
		self.writeError(w, err, http.StatusBadRequest)
		return
	}

	err = self.core.Db.Update(database.ProjectsCol, id, project)

	if err != nil {
		self.writeError(w, err, http.StatusInternalServerError)
	}

	self.respond(w, &project)

}

func (self *Server) infoProject(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["project_id"]

	query := database.Query{
		"project_id": bson.ObjectIdHex(id),
	}

	count, err := self.core.Db.Count(database.ResourcesCol, query)

	if err != nil {
		self.writeError(w, err, http.StatusInternalServerError)
		return
	}

	out := types.Message{
		"resources": count,
	}

	self.respond(w, &out)

}
