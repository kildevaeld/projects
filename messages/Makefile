
PROTO_FILES=$(wildcard *.proto)
OUTPUT_FILES=$(patsubst %.proto,%.pb.go,$(wildcard *.proto))

.PHONY: build

build:
	@echo generating protobuf.
	@protoc --go_out=plugins=grpc:. $(PROTO_FILES)

clean:
	@echo cleaning protobuf.
	@rm -f $(OUTPUT_FILES)