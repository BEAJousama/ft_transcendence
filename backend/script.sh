#! /bin/sh

cp -r /cache/node_modules/ /app/node_modules/
npx prisma migrate dev --name init
npx prisma generate
npx prisma db push --accept-data-loss
npx prisma studio -b none &
npm run start:dev
