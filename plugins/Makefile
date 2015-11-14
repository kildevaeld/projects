
export PLUGIN_DIR=/Users/rasmus/.projects/plugins
ROOT_DIRECTORY=.

DIRECTORY = $(shell find . -maxdepth 1 -type d)

.PHONY: build

build:
	@for dir in $(DIRECTORY); do \
		if [ "$$dir" = "." ]; then \
			continue; \
		fi; \
		$(MAKE) -C $$dir build; \
	done

clean:
	@for dir in $(DIRECTORY); do \
		if [ "$$dir" = "." ]; then \
			continue; \
		fi; \
		$(MAKE) -C $$dir clean; \
	done

install:
	@mkdir -p $(PLUGIN_DIR)
	@for dir in $(DIRECTORY); do \
		if [ "$$dir" = "." ]; then \
			continue; \
		fi; \
		$(MAKE) -C $$dir install; \
	done


uninstall:
	@mkdir -p $(PLUGIN_DIR)
	@for dir in $(DIRECTORY); do \
		if [ "$$dir" = "." ]; then \
			continue; \
		fi; \
		$(MAKE) -C $$dir uninstall; \
	done
