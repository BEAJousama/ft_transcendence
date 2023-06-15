#!/bin/bash

echo "Copying node_modules"
if [ -d "/app/node_modules" ]; then
  echo "node_modules already exists, skipping copy"
else
  cp -r /node_modules/ /app/node_modules/
fi

echo "Running server"
yarn start

