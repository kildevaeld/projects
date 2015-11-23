package main

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/codegangsta/cli"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/kildevaeld/prompt"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/kildevaeld/prompt/form"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/google.golang.org/grpc"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/server2"
)

func wrapError(err error) {
	if err != nil {

		fmt.Fprintf(os.Stderr, "%v\n", grpc.ErrorDesc(err))
		os.Exit(1)
	}
}

func projectsCmds(config *Config) []cli.Command {
	return []cli.Command{
		cli.Command{
			Name:      "list",
			Aliases:   []string{"ls"},
			ArgsUsage: "[glob]",
			Action: func(ctx *cli.Context) {
				wrapError(listProjects(ctx, config.Client))
			},
		},
		cli.Command{
			Name: "new",
			Action: func(ctx *cli.Context) {
				wrapError(createProject(config, ctx.Args().First(), ctx.Bool("interactive")))
			},
			Flags: []cli.Flag{
				cli.BoolFlag{
					Name: "interactive, i",
				},
			},
		},
		cli.Command{
			Name: "rm",
			Action: func(ctx *cli.Context) {

			},
		},
		cli.Command{
			Name: "get",
			Action: func(ctx *cli.Context) {
				wrapError(getProject(config, ctx.Args().First()))
			},
			Before: func(ctx *cli.Context) error {
				if len(ctx.Args()) == 0 {
					return errors.New("usage: projects get <id>")
				}
				return nil
			},
		},
	}
}

func getProject(config *Config, id string) error {

	var project *database.Project
	var err error
	/*err = prompt.NewProcess("Fetching projects ...", func() error {
		project, err = config.Client.GetProject(id)
		return err
	})*/
	project, err = config.Client.GetProject(id)

	if err != nil {
		return err
	}

	fmt.Printf("Project %#v", project)

	return nil
}

func listProjects(ctx *cli.Context, client *server2.Client) error {

	var list []*database.Project
	var err error
	err = prompt.NewProcess("Fetching projects ...", func() error {
		list, err = client.ListProjects(nil)
		return err
	})

	if err != nil {
		return err
	}

	var o []string
	for _, r := range list {
		o = append(o, r.Name+fmt.Sprintf(" (%s)", r.Id.Hex()))
	}

	fmt.Printf("%s", strings.Join(o, "\n"))

	return nil
}

func createProject(config *Config, name string, interactive bool) (err error) {

	if name == "" {
		name = config.UI.Input("Please enter name:")
		if name == "" {
			return errors.New("no name")
		}
	}

	project := &database.Project{
		Name: name,
	}

	if interactive {
		config.UI.Save()
		config.UI.FormWithFields([]form.Field{
			&form.Input{
				Name: "Description",
			},
		}, project)
		config.UI.Restore()
	}

	err = config.UI.Process("Creating %s ...", name).Run(func() error {
		e := config.Client.CreateProject(project)
		//project = pp
		return e
	})

	if err == nil {
		config.UI.Printf("Project id: ")
		config.UI.Theme.Highlight("%s", project.Id)
	}

	return err
}
