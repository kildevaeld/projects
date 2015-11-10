package server

import (
	"encoding/json"

	"github.com/kildevaeld/projects/messages"
	"github.com/kildevaeld/projects/projects"
)

type eventsServer struct {
	core *projects.Core
}

func (self *eventsServer) GetEvents(q *messages.EventQuery, stream messages.Events_GetEventsServer) (err error) {
	ch := make(chan interface{})

	core.Mediator.PSubscribe("*", ch)

loop:
	for {
		select {
		case ev := <-ch:
			b, _ := json.Marshal(ev)
			e := messages.Event{
				Name: "",
				Data: b,
			}
			err = stream.Send(&b)
			if err != nil {
				break loop
			}
		case <-stream.Context().Done():
			break loop
		}
	}

	core.Mediator.PUnsubscribe("*", ch)
	close(ch)
	return err
}
