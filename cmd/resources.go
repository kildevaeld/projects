package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"text/tabwriter"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/codegangsta/cli"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/golang.org/x/net/context"
	"github.com/kildevaeld/projects/messages"
)

func resourcesCmd(config *Config) cli.Command {
	return cli.Command{
		Name:    "resources",
		Aliases: []string{"res"},
		Action: func(ctx *cli.Context) {
			project := ctx.String("project")
			resource := ctx.Args().First()
			resType := ctx.String("type")
			name := ctx.String("name")
			wrapError(createResource(config, project, resource, name, resType))
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
			cli.StringFlag{
				Name: "type, t",
			},
			cli.StringFlag{
				Name: "name, n",
			},
		},
		Subcommands: []cli.Command{
			cli.Command{
				Name:    "list",
				Aliases: []string{"ls"},
				Action: func(ctx *cli.Context) {
					wrapError(listResources(config, ctx.GlobalString("project")))
				},
			},
			cli.Command{
				Name: "list-types",
				Action: func(ctx *cli.Context) {
					wrapError(listTypes(config))
				},
			},
		},
	}
}

func listTypes(config *Config) error {
	types, err := config.Client.Resources().ListTypes(context.Background(), &messages.ResourceQuery{})
	if err != nil {

		return err
	}

	for _, t := range types.Types {
		config.UI.Printf("%s\n", t)
	}

	return nil
}

func parseResourceField(res *messages.Resource) (map[string]interface{}, error) {
	var out map[string]interface{}
	err := json.Unmarshal(res.Fields, &out)
	return out, err
}

func listResources(config *Config, project_id string) error {
	stream, e := config.Client.Resources().List(context.Background(), &messages.ResourceQuery{})
	if e != nil {
		return e
	}
	writer := tabwriter.NewWriter(os.Stdout, 1, 16, 1, '\t', 0)
	h := config.UI.Theme.HighlightForeground
	f := config.UI.Theme.Foreground
	writer.Write([]byte(f.Color("Id\tName\tType\n")))
	for {
		res, err := stream.Recv()

		if err != nil {
			if err == io.EOF {
				break
			}
			return err
		}

		writer.Write([]byte(fmt.Sprintf("%s\t%s\n", h.Color(res.Name), h.Color(res.Type))))

		//config.UI.Printf("Name: %s, Type: %s\n", h.Color(res.Name), h.Color(res.Type))

	}
	writer.Flush()
	return nil
}

func createResource(config *Config, project_id string, resource string, name string, resType string) error {

	pClient := config.Client.Projects()

	_, e := pClient.Get(context.Background(), &messages.ProjectQuery{
		Id: project_id,
	})

	if e != nil {
		return e
	}

	data := []byte(resource)
	var createType string

	if resType != "" {
		createType = resType

		if name == "" {
			name = config.UI.Input("Please enter name of resource: ")
		}
		if name == "" {
			return errors.New("no name")
		}

	} else {

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
			createType = "directory"
		} else {
			createType = "file"
		}

		if name == "" {
			name = filepath.Base(resource)
		}

		data = []byte(resource)

	}

	create := messages.ResourceCreate{
		Name:      name,
		ProjectId: project_id,
		Data:      data,
		Type:      createType,
	}

	rClient := config.Client.Resources()

	res, err := rClient.Create(context.Background(), &create)

	if err != nil {
		return err
	}

	fmt.Printf("Resource %v", res)

	return nil
}
