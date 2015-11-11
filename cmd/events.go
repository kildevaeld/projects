package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/signal"
	"syscall"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/codegangsta/cli"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/golang.org/x/net/context"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/messages"
)

func eventCmd(config *Config) cli.Command {

	return cli.Command{
		Name: "events",
		Action: func(ctx *cli.Context) {
			wrapError(eventCommand(config))
		},
	}

}

func eventCommand(config *Config) error {

	client := config.Client.Events()

	ctx, cancel := context.WithCancel(context.Background())

	stream, err := client.GetEvents(ctx, &messages.EventQuery{})

	if err != nil {
		return err
	}

	ch := make(chan os.Signal, 1)
	signal.Notify(ch, os.Interrupt)
	signal.Notify(ch, syscall.SIGTERM)
	defer close(ch)
	done := make(chan bool, 1)
	defer close(done)

	go func() {
		for {

			ev, e := stream.Recv()

			if e != nil {
				if e != io.EOF {
					err = e
				}
				break

			}

			var fields map[string]interface{}

			if err := json.Unmarshal(ev.Data, &fields); err != nil {
				continue
			}

			m := database.Query{
				"Name":    ev.Name,
				"Message": fields,
			}

			b, e := json.Marshal(&m)
			if e != nil {
				continue
			}
			buf := bytes.NewBuffer(nil)

			json.Indent(buf, b, "", "  ")

			fmt.Printf("event: %s\n%v\n", ev.Name, string(buf.Bytes()))

		}
		done <- true

	}()

loop:
	for {
		select {
		case <-ch:
			cancel()
			break loop
		case <-done:
			break loop
		}

	}

	return err
}
