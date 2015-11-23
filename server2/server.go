package server2

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"path/filepath"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/tomb.v2"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/gopkg.in/unrolled/render.v1"
	"github.com/kildevaeld/projects/projects"
)

type Query map[string]interface{}

var errStop = errors.New("errStop")

type Server struct {
	unixl  net.Listener
	tcpl   net.Listener
	tomb   tomb.Tomb
	mux    *mux.Router
	render *render.Render
	core   *projects.Core
}

func (self *Server) init() {
	self.mux = mux.NewRouter()
	self.render = render.New()

	self.mux.HandleFunc("/ping", self.servePing).Methods("GET")
	// Register project routes
	idMatch := "[a-zA-Z0-9]{24}" // ObjectId.hex
	projectId := fmt.Sprintf("{project_id:%s}", idMatch)
	self.mux.HandleFunc("/projects", self.createProject).Methods("POST")
	self.mux.HandleFunc("/projects", self.listProjects).Methods("GET")
	self.mux.HandleFunc("/projects/"+projectId, self.getProject).Methods("GET")
	self.mux.HandleFunc("/projects/"+projectId, self.updateProject).Methods("PUT")
	self.mux.HandleFunc("/projects/"+projectId, self.removeProject).Methods("DELETE")
	self.mux.HandleFunc(fmt.Sprintf("/projects/%s/info", projectId), self.infoProject).Methods("GET")
	// Resources
	//resourceId := fmt.Sprint("{resource_id:%s}", idMatch)
	self.mux.HandleFunc("/projects/{project_id}/resources", self.createResource).Methods("POST")
	self.mux.HandleFunc("/projects/{project_id}/resources", self.listResources).Methods("GET")
	self.mux.HandleFunc("/projects/{project_id}/resources/{resource_id}", self.getResource).Methods("GET")
	self.mux.HandleFunc("/projects/{project_id}/resources/{resource_id}", self.updateResource).Methods("PUT")
	self.mux.HandleFunc("/projects/{project_id}/resources/{resource_id}", self.removeResource).Methods("DELETE")
	self.mux.HandleFunc("/projects/{project_id}/resources/{resource_id}/attach", self.removeResource).Methods("POST")

}

func (self *Server) Listen() error {

	configPath, err := projects.ConfigDir()

	if err != nil {
		return err
	}
	var unixPath *net.UnixAddr
	var unixl *net.UnixListener
	unixPath, err = net.ResolveUnixAddr("unix", filepath.Join(configPath, "projects.socket"))
	if err != nil {
		return err
	}

	unixl, err = net.ListenUnix("unix", unixPath)
	if err != nil {
		return fmt.Errorf("cannot listen on unix socket: %v", err)
	}
	self.unixl = unixl

	self.tomb.Go(func() error { return http.Serve(self.unixl, self.mux) })
	return nil
}

func (self *Server) Close() error {
	self.tomb.Kill(errStop)
	self.unixl.Close()
	if self.tcpl != nil {
		self.tcpl.Close()
	}
	err := self.tomb.Wait()
	if err == errStop {
		return nil
	}
	return err
}

func (self *Server) respond(w http.ResponseWriter, v interface{}) error {
	b, e := json.Marshal(v)
	if e != nil {
		return e
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Write(b)
	return nil
}

func (self *Server) read(r *http.Request, v interface{}) error {
	defer r.Body.Close()

	body, err := ioutil.ReadAll(r.Body)

	if err != nil {
		return err
	}

	return json.Unmarshal(body, v)

}

func (self *Server) writeError(w http.ResponseWriter, err error, status int) {

	q := Query{
		"status":  status,
		"message": err.Error(),
	}

	b, _ := json.Marshal(&q)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	w.Write(b)
}

func (self *Server) servePing(w http.ResponseWriter, r *http.Request) {
	remoteAddr := r.RemoteAddr
	if remoteAddr == "@" {
		remoteAddr = "unix socket"
	}
	log.Printf("responding to ping from %s", remoteAddr)
	w.Write([]byte("pong"))
}

func NewServer(core *projects.Core) *Server {
	server := &Server{
		core: core,
	}
	server.init()
	return server
}
