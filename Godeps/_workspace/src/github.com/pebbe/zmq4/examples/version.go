//
//  Report 0MQ version.
//

package main

import (
	"fmt"
	zmq "github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/pebbe/zmq4"
)

func main() {
	major, minor, patch := zmq.Version()
	fmt.Printf("Current 0MQ version is %d.%d.%d\n", major, minor, patch)
}
