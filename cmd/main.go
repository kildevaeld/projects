package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/codegangsta/cli"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/kildevaeld/prompt"
	"github.com/kildevaeld/projects/projects"
	"github.com/kildevaeld/projects/server"
	"github.com/kildevaeld/projects/utils"
)

func main() {
	os.Exit(realMain())
}

type Config struct {
	Client *server.Client
	UI     *prompt.CliUI
}

func realMain() int {

	log.SetOutput(ioutil.Discard)

	client, err := server.NewClient()
	if err != nil {
		fmt.Fprintf(os.Stdout, "Error happended when connecting to server:\n%v\n", err)
		return 1
	}

	// Get context
	//dConf, e := getContext(client)

	/*if e != nil {
		fmt.Fprintf(os.Stderr, "%v\n", e)
	}*/

	app := cli.NewApp()
	app.Name = "projects"
	app.Version = "0.0.1"
	app.Usage = "Something something"

	config := Config{
		Client: client,
		UI:     prompt.NewUI(),
	}

	app.Commands = initCommands(&config)

	err = app.Run(os.Args)

	if err != nil {
		fmt.Fprint(os.Stderr, "%v", err)
		return 1
	}

	return 0
}

func getContext(client *server.Client) (*projects.DirectoryResource, error) {

	cur, err := os.Getwd()

	if err != nil {
		return nil, err
	}

	p := filepath.Join(cur, ".projects")

	configDir, _ := projects.ConfigDir()

	if p == configDir {
		return nil, nil
	}

	if !utils.FileExists(p) {
		return nil, nil
	}

	pFile := filepath.Join(p, "projects.toml")

	if !utils.FileExists(pFile) {
		return nil, nil
	}

	/*file, err := os.Open(pFile)

	if err != nil {
		return nil, err
	}*/

	/*defer file.Close()

	var conf projects.DirectoryResourceConfig
	_, err = toml.DecodeReader(file, &conf)

	pp := client.Projects()
	q := messages.ProjectQuery{
		Id: conf.Project.Id,
	}

	ppp, _ := pp.Get(context.Background(), &q)

	conf.Project = ppp

	return &projects.DirectoryResource{
		Config: &conf,
	}, err*/
	return nil, nil

}

func initCommands(config *Config) (cmds []cli.Command) {
	cmds = append(cmds, projectsCmds(config)...)
	cmds = append(cmds, resourcesCmd(config), pluginsCmd(config), eventCmd(config))
	return cmds
}
