# Use the official Node.js image as the base
FROM node

# Set the working directory inside the container
WORKDIR /app

# Install the dependencies
COPY package*.json ./
RUN yarn install

# Expose the port your frontend application listens on (adjust if needed)
EXPOSE 3000

# Set the command to start your frontend application
CMD ["yarn", "start"]
