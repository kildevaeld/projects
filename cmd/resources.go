package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"golang.org/x/net/context"

	"github.com/codegangsta/cli"
	"github.com/kildevaeld/projects/messages"
)

func resourcesCmd(config *Config) cli.Command {
	return cli.Command{
		Name:    "resources",
		Aliases: []string{"res"},
		Action: func(ctx *cli.Context) {
			project := ctx.String("project")
			resource := ctx.Args().First()
			wrapError(createResource(config, project, resource))
		},
		Before: func(ctx *cli.Context) error {
			if len(ctx.Args()) == 0 {
				return errors.New("usage: mrp resource <resource>")
			}
			if ctx.String("project") == "" {
				return errors.New("no project")
			}
			return nil
		},
		Flags: []cli.Flag{
			cli.StringFlag{
				Name: "project, p",
			},
		},
		Subcommands: []cli.Command{
			cli.Command{
				Name:    "list",
				Aliases: []string{"ls"},
				Action: func(ctx *cli.Context) {
					l, e := config.Client.Resources().List(context.Background(), &messages.ResourceQuery{})
					fmt.Printf("%v %v", l, e)
				},
			},
		},
	}
}

func createResource(config *Config, pp string, resource string) error {

	pClient := config.Client.Projects()

	_, e := pClient.Get(context.Background(), &messages.ProjectQuery{
		Id: pp,
	})

	if e != nil {
		return e
	}

	if !filepath.IsAbs(resource) {
		abs, err := filepath.Abs(resource)
		if err != nil {
			return err
		}
		resource = abs
	}

	stat, err := os.Lstat(resource)

	if err != nil {
		return err
	}

	if stat.IsDir() {

	}

	return nil
}
