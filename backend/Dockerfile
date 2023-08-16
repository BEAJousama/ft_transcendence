FROM node:18

COPY . /app
WORKDIR /app
RUN apt-get update && apt-get install -y curl
RUN npm install

EXPOSE 3000

ENTRYPOINT ["bash", "-c", "./script.sh && npm run start"]

