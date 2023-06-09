#!/bin/sh

#replace local host with hostname
sed -i '' "s/e[0-9]*r[0-9]*p[0-9]*\.1337\.ma/$(hostname)/g" .env

# run migrations
yarn prisma migrate dev --name init

# generate prisma client
yarn prisma generate

# create tables in db
yarn prisma db push --accept-data-loss 

yarn prisma studio -b none& #debug
# start server
yarn start:dev