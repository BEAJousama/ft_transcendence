#!/bin/bash

if [ -d "/app/node_modules" ]; then
  echo "node_modules already exists, skipping copy"
else
  echo "Copying node_modules"
  cp -r /node_modules/ /app/node_modules/
fi

echo "initing database"
npx prisma migrate dev --name init
npx prisma generate
npx prisma db push --accept-data-loss
npx prisma studio -b none &
echo "running server"
npm run start:dev
