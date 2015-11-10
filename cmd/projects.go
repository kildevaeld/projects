package main

import (
	"errors"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/codegangsta/cli"
	"github.com/kildevaeld/projects/messages"
	"github.com/kildevaeld/projects/server"
	"github.com/kildevaeld/prompt"
	"github.com/kildevaeld/prompt/form"
	"golang.org/x/net/context"
)

func wrapError(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n", err)
		os.Exit(1)
	}
}

func projectsCmds(config *Config) []cli.Command {
	return []cli.Command{
		cli.Command{
			Name:    "list",
			Aliases: []string{"ls"},
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
	}
}

func listProjects(ctx *cli.Context, client *server.Client) error {

	query := messages.ProjectQuery{}

	if q := ctx.Args().First(); q != "" {
		query.Name = q
	}

	var buffer []*messages.Project

	err := prompt.NewProcess("Fetching projects ...", func() error {
		list, err := client.Projects().List(context.Background(), &query, nil)

		if err != nil {
			return err
		}

		for {
			m, e := list.Recv()
			if e != nil {
				if e == io.EOF {
					break
				} else {
					return e
				}
			}
			buffer = append(buffer, m)
		}

		return nil
	})

	if err != nil {
		return err
	}

	var o []string
	for _, r := range buffer {
		o = append(o, r.Name+fmt.Sprintf(" (%s)", r.Id))
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

	project := &messages.Project{
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

	p := config.Client.Projects()

	err = config.UI.Process("Creating %s ...", name).Run(func() error {
		pp, e := p.Create(context.Background(), project)
		project = pp
		return e
	})

	if err == nil {
		config.UI.Printf("Project id: ")
		config.UI.Theme.Highlight("%s", project.Id)
	}

	return err
}
