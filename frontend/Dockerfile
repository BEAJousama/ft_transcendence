FROM node:18

RUN mkdir /cache
WORKDIR /cache
COPY package.json ./
RUN npm install && mkdir /app
WORKDIR /app

EXPOSE 5000

ENTRYPOINT ["bash", "script.sh"]