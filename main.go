package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"os/signal"
	"runtime"
	"sync"
	"syscall"

	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/mitchellh/panicwrap"
	"github.com/kildevaeld/projects/Godeps/_workspace/src/github.com/mitchellh/prefixedio"
	"github.com/kildevaeld/projects/database"
	"github.com/kildevaeld/projects/projects"
	"github.com/kildevaeld/projects/server"
)

var ErrorPrefix = "error"
var OutputPrefix = "output"

func main() {
	os.Exit(wrappedMain())
}

func realMain() int {
	var wrapConfig panicwrap.WrapConfig

	if !panicwrap.Wrapped(&wrapConfig) {
		// Determine where logs should go in general (requested by the user)
		logWriter, err := logOutput()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Couldn't setup log output: %s", err)
			return 1
		}
		if logWriter == nil {
			logWriter = ioutil.Discard
		}

		// We always send logs to a temporary file that we use in case
		// there is a panic. Otherwise, we delete it.
		logTempFile, err := ioutil.TempFile("", "packer-log")
		if err != nil {
			fmt.Fprintf(os.Stderr, "Couldn't setup logging tempfile: %s", err)
			return 1
		}
		defer os.Remove(logTempFile.Name())
		defer logTempFile.Close()

		// Tell the logger to log to this file
		os.Setenv(EnvLog, "")
		os.Setenv(EnvLogFile, "")

		// Setup the prefixed readers that send data properly to
		// stdout/stderr.
		doneCh := make(chan struct{})
		outR, outW := io.Pipe()
		go copyOutput(outR, doneCh)

		// Create the configuration for panicwrap and wrap our executable
		wrapConfig.Handler = panicHandler(logTempFile)
		wrapConfig.Writer = io.MultiWriter(logTempFile, logWriter)
		wrapConfig.Stdout = outW
		exitStatus, err := panicwrap.Wrap(&wrapConfig)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Couldn't start projects: %s", err)
			return 1
		}

		// If >= 0, we're the parent, so just exit
		if exitStatus >= 0 {
			// Close the stdout writer so that our copy process can finish
			outW.Close()

			// Wait for the output copying to finish
			<-doneCh

			return exitStatus
		}

		// We're the child, so just close the tempfile we made in order to
		// save file handles since the tempfile is only used by the parent.
		logTempFile.Close()
	}

	return wrappedMain()
}

func wrappedMain() int {

	if os.Getenv("GOMAXPROCS") == "" {
		runtime.GOMAXPROCS(runtime.NumCPU())
	}

	log.SetOutput(os.Stderr)

	setupStdin()

	_, err := loadConfig()

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error loading configuration\n%s\n", err.Error())
		return 1
	}

	var configDir string
	configDir, err = projects.ConfigDir()

	if err != nil {
		return 1
	}

	db, err := database.NewMongoDatastore() //database.NewDatabase(filepath.Join(configDir, "database"))

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error initializing database\n%s\n", err.Error())
		return 1
	}

	core, e := projects.NewCore(projects.CoreConfig{
		Db:         db,
		ConfigPath: configDir,
	})

	if e != nil {
		fmt.Fprintf(os.Stderr, "Error while initializing core\n%s\n", e.Error())
		return 1
	}

	defer core.Close()

	server := server.NewServer(core)

	err = run_server(server)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error %v\n", err)
		return 1
	}

	return 0
}

func run_server(s *server.Server) error {
	//done := make(chan error, 1)
	//defer close(done)
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, os.Interrupt)
	signal.Notify(ch, syscall.SIGTERM)
	defer close(ch)

	err := s.Start()

	if err != nil {
		return err
	}

	<-ch

	return s.Stop()
}

func loadConfig() (*Config, error) {
	var config Config
	configfile, err := projects.ConfigFile()

	if err != nil {
		return nil, err
	}

	file, err := os.Open(configfile)

	if err != nil {
		if !os.IsNotExist(err) {
			return nil, err
		}

		return &config, nil
	}

	defer file.Close()

	err = decodeConfig(file, &config)

	configdir, _ := projects.ConfigDir()
	config.Path = configdir
	return &config, err
}

// copyOutput uses output prefixes to determine whether data on stdout
// should go to stdout or stderr. This is due to panicwrap using stderr
// as the log and error channel.
func copyOutput(r io.Reader, doneCh chan<- struct{}) {
	defer close(doneCh)

	pr, err := prefixedio.NewReader(r)
	if err != nil {
		panic(err)
	}

	stderrR, err := pr.Prefix(ErrorPrefix)
	if err != nil {
		panic(err)
	}
	stdoutR, err := pr.Prefix(OutputPrefix)
	if err != nil {
		panic(err)
	}
	defaultR, err := pr.Prefix("")
	if err != nil {
		panic(err)
	}

	var wg sync.WaitGroup
	wg.Add(3)
	go func() {
		defer wg.Done()
		io.Copy(os.Stderr, stderrR)
	}()
	go func() {
		defer wg.Done()
		io.Copy(os.Stdout, stdoutR)
	}()
	go func() {
		defer wg.Done()
		io.Copy(os.Stdout, defaultR)
	}()

	wg.Wait()
}
