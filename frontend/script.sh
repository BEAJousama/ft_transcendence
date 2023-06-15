#!/bin/bash

echo "Waiting for server to start..."

while true; do
	if curl -sSfL "$REACT_APP_BACK_END_URL""api" >/dev/null; then
		echo "Server started. Installing dependencies"
		npm install
		break
	else
		echo "Server not started yet. Retrying in 5 second..."
		sleep 5
	fi
done

echo "Starting app"

npm run start

