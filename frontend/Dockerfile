# Use the official Node.js image as the base
FROM node:20-alpine3.17

# Set the working directory inside the container
WORKDIR /app

# Install the dependencies
COPY package*.json ./
# RUN sed -i  "s/e[0-9]*r[0-9]*p[0-9]*\.1337\.ma/$(hostname)/g" .env

# Expose the port your frontend application listens on (adjust if needed)
EXPOSE 5000

# Set the command to start your frontend application
CMD ["sh", "entrypoint.sh"]

