#!/bin/bash
set -e

npx prisma generate

for attempt in $(seq 1 30); do
	if npx prisma db push --accept-data-loss; then
		exit 0
	fi

	echo "PostgreSQL is not ready; retrying Prisma initialization ($attempt/30)..."
	sleep 2
done

echo "PostgreSQL did not become available after 60 seconds."
exit 1
