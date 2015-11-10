package projects

import (
	"os"
	"path/filepath"

	"github.com/kildevaeld/projects/utils"
)

// ConfigFile returns the default path to the configuration file. On
// Unix-like systems this is the ".packerconfig" file in the home directory.
// On Windows, this is the "packer.config" file in the application data
// directory.
func ConfigFile() (string, error) {
	return configFile()
}

// ConfigDir returns the configuration directory for Packer.
func ConfigDir() (string, error) {
	return configDir()
}

// ConfigTmpDir returns the configuration tmp directory for Packer
func ConfigTmpDir() (string, error) {
	if tmpdir := os.Getenv("PROJECTS_TMP_DIR"); tmpdir != "" {
		return filepath.Abs(tmpdir)
	}
	configdir, err := configDir()
	if err != nil {
		return "", err
	}
	td := filepath.Join(configdir, "tmp")
	_, err = os.Stat(td)
	if os.IsNotExist(err) {
		if err = os.MkdirAll(td, 0755); err != nil {
			return "", err
		}
	} else if err != nil {
		return "", err
	}
	return td, nil
}

func PluginDir() (string, error) {

	configdir, err := configDir()

	if err != nil {
		return "", err
	}
	pd := filepath.Join(configdir, "plugins")

	if !utils.FileExists(pd) {
		if err = os.MkdirAll(pd, 0755); err != nil {
			return "", err
		}
	}
	return pd, nil
}
