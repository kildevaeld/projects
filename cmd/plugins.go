package main

import "github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/codegangsta/cli"

func pluginsCmd(config *Config) cli.Command {
	return cli.Command{
		Name:    "plugin",
		Aliases: []string{"pl"},
	}
}
