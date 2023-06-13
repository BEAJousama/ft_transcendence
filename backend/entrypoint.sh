#!/bin/sh

#replace local host with hostname
# sed -i "s/e[0-9]*r[0-9]*p[0-9]*\.1337\.ma/$(hostname)/g" .env
# npm install

# run migrations
npx prisma migrate dev --name init

# generate prisma client
npx prisma generate

# create tables in db
npx prisma db push --accept-data-loss 

npx prisma studio -b none& #debug
# start server
npm run start:dev