package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/BurntSushi/toml"
	"github.com/kildevaeld/projects/projects"
	"github.com/kildevaeld/projects/utils"
)

type ServerConfig struct {
}

type Config struct {
	Server ServerConfig
	Path   string
}

func decodeConfig(reader io.Reader, c *Config) error {
	_, e := toml.DecodeReader(reader, c)
	return e

}

func (self *Config) Discover() error {

	pluginsdir, err := projects.PluginDir()

	if err != nil {
		return err
	}

	files, e := ioutil.ReadDir(pluginsdir)

	if e != nil {
		return e
	}

	for _, file := range files {

		if !file.IsDir() {
			continue
		}

		pDir := filepath.Join(pluginsdir, file.Name())
		pConfigDir := filepath.Join(pDir, "plugin.toml")

		if !utils.FileExists(pConfigDir) {
			continue
		}

		fmt.Printf(pConfigDir)

	}
	return nil
}

func init() {

	configDir, err := projects.ConfigDir()

	if err != nil {
		panic(err)
	}

	os.Setenv("PROJECTS_PATH", configDir)

	if !utils.FileExists(configDir) {

		err := os.MkdirAll(configDir, 0755)
		if err != nil {
			panic(err)
		}
	}

}
