#!/bin/bash

echo "Initing database and running migrations"
npx prisma migrate --name init
npx prisma generate
npx prisma db push --accept-data-loss
