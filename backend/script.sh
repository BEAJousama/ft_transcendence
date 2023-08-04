#!/bin/bash

echo "Initing database and running migrations"
npx prisma migrate dev --name init
npx prisma generate
npx prisma db push --accept-data-loss
npx prisma studio -b none &
