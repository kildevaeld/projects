package server

import (
	"encoding/json"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/kildevaeld/go-pubsub"
	"github.com/kildevaeld/projects/messages"
	"github.com/kildevaeld/projects/projects"
)

type eventsServer struct {
	core *projects.Core
}

func (self *eventsServer) GetEvents(q *messages.EventQuery, stream messages.Events_GetEventsServer) (err error) {
	ch := make(chan pubsub.Event)

	self.core.Mediator.PSubscribe("*", ch)

loop:
	for {
		select {
		case ev := <-ch:
			b, _ := json.Marshal(ev.Message)
			e := messages.Event{
				Name: ev.Name,
				Data: b,
			}
			err = stream.Send(&e)
			if err != nil {
				break loop
			}
		case <-stream.Context().Done():
			break loop
		}
	}

	self.core.Mediator.PUnsubscribe("*", ch)
	close(ch)
	return err
}
