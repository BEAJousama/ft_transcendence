FROM node:18

COPY . /app
WORKDIR /app
RUN apt-get update && apt-get install -y curl
RUN npm install
RUN npm run build

EXPOSE 5000

ENTRYPOINT ["bash", "-c", "npm run start"]
