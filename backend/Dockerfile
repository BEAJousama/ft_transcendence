# Use the official Node.js image as the base
FROM node:20-alpine3.17

# Set the working directory inside the container
WORKDIR /app

# Install the dependencies
COPY package*.json ./

# Expose the port your backend application listens on (adjust if needed)
EXPOSE 3000

# Set the command to start your backend application

CMD ["sh", "entrypoint.sh"]
