FROM node:18

COPY . /app
WORKDIR /app
RUN apt-get update && apt-get install -y curl
RUN npm install

EXPOSE 5000

ENTRYPOINT ["bash", "-c", "npm run build && npm run start"]
