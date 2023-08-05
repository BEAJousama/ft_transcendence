FROM node:18

COPY ./package.json /package.json
RUN npm install
RUN apt-get update && apt-get install -y curl

WORKDIR /app

EXPOSE 5000

ENTRYPOINT ["bash", "-c", "npm run dev"]
