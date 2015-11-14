

BIN := vault
INSTALL_PREFIX := $(PLUGIN_DIR)/vault

build:
	@echo building vault
	@go build -o ./bin/$(BIN) .

clean:
	rm -fr vault

install:
	@mkdir -p $(INSTALL_PREFIX)
	@install -m 0755 ./bin/$(BIN) $(INSTALL_PREFIX)/$(bin)
	@install -m 755 ./plugin.toml $(INSTALL_PREFIX)/plugin.toml

uninstall:
	@rm -fr $(PLUGIN_DIR)/vault