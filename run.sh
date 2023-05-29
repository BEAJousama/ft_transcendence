#!/bin/bash
cd ./frontend
npm run start &
cd ../backend
npm run start:dev &
npx prisma studio &
