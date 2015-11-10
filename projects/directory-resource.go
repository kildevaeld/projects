package projects

import "github.com/kildevaeld/projects/messages"

type DirectoryResourceConfig struct {
	Path    string
	Project *messages.Project
}

type DirectoryResource struct {
	Config *DirectoryResourceConfig
}
