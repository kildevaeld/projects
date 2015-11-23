#!/bin/sh
GULP="$PWD/node_modules/.bin/gulp"
$GULP test test:integration
ret_code=$?
if [ 0 != "$ret_code" ]; then
	exit $ret_code
fi