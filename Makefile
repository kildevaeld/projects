
PREFIX := /usr/local
DAEMON_BIN := mrpd
CLIENT_BIN := mrp

DAEMON_FILES = $(wildcard *.go)

build: build-daemon build-client

build-daemon: build-messages
	@echo building $(DAEMON_BIN)
	@go build -o bin/$(DAEMON_BIN) $(DAEMON_FILES)

build-client: build-messages
	@echo building $(CLIENT_BIN)
	@go build -o bin/$(CLIENT_BIN) ./cmd

build-messages:
	@$(MAKE) -C messages build

clean:
	@rm -rf bin
	@$(MAKE) -C messages clean

install:
	install -m 0755 ./bin/$(CLIENT_BIN) $(PREFIX)/bin
	install -m 0755 ./bin/$(DAEMON_BIN) $(PREFIX)/bin

uninstall:
	rm -f $(PREFIX)/bin/$(CLIENT_BIN)
	rm -f $(PREFIX)/bin/$(DAEMON_BIN)