package resources

import (
	"errors"
	"io/ioutil"

	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/projects/types"
	"github.com/kildevaeld/projects/utils"
)

type DirectoryResourceType struct {
}

func (self *DirectoryResourceType) Create(ctx types.Context, b []byte) (*types.Message, error) {

	path := string(b)

	if !utils.FileExists(path) || !utils.IsDir(path) {
		return nil, errors.New("path not a file or a directory")
	}

	msg := types.Message{
		"Path": path,
	}

	return &msg, nil
}

func (self *DirectoryResourceType) Remove(ctx types.Context, resource *database.Resource) error {

	return nil

}
func (self *DirectoryResourceType) Info(ctx types.Context, resource *database.Resource) (*types.Message, error) {

	msg := types.Message{}

	fields := resource.Fields

	if fields == nil {
		return nil, nil
	}

	path := fields["Path"].(string)
	var out []string
	var size int64
	files, err := ioutil.ReadDir(path)
	if err != nil {
		return nil, err
	}
	for _, file := range files {
		size += file.Size()
		out = append(out, file.Name())
	}

	msg["Size"] = size
	msg["Content"] = out

	return &msg, nil
}
