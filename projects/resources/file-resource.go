package resources

import (
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/projects/types"
)

type FileResourceType struct {
}

func (self *FileResourceType) Create(ctx types.Context, b []byte) (*types.Message, error) {

	str := string(b)

	msg := types.Message{
		"Path": str,
	}

	return &msg, nil
}

func (self *FileResourceType) Remove(ctx types.Context, resource *database.Resource) error {

	return nil

}
func (self *FileResourceType) Info(ctx types.Context, resource *database.Resource) (*types.Message, error) {

	return nil, nil
}
