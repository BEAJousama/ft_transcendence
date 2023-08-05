FROM node:18

COPY ./package.json /package.json
RUN npm install
RUN apt-get update && apt-get install -y curl

WORKDIR /app

EXPOSE 3000
EXPOSE 5555

ENTRYPOINT ["bash", "-c", "/app/script.sh; npm run start:dev"]
