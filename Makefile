
PREFIX := /usr/local
DAEMON_BIN := mrpd
CLIENT_BIN := mrp

DAEMON_FILES = $(wildcard *.go)

build: daemon client build-plugins

daemon: protobuf
	@echo building $(DAEMON_BIN)
	@go build -o bin/$(DAEMON_BIN) $(DAEMON_FILES)

client: protobuf
	@echo building $(CLIENT_BIN)
	@go build -o bin/$(CLIENT_BIN) ./cmd

protobuf:
	@echo building messages
	@$(MAKE) -C messages build
	godep save -r ./...

build-plugins:
	@$(MAKE) -C plugins build

clean:
	@rm -rf bin
	@$(MAKE) -C messages clean

install:
	install -m 0755 ./bin/$(CLIENT_BIN) $(PREFIX)/bin
	install -m 0755 ./bin/$(DAEMON_BIN) $(PREFIX)/bin
	@$(MAKE) -C plugins install

uninstall:
	rm -f $(PREFIX)/bin/$(CLIENT_BIN)
	rm -f $(PREFIX)/bin/$(DAEMON_BIN)
	@$(MAKE) -C plugins uninstall