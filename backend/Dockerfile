FROM node:18

RUN mkdir /cache
WORKDIR /cache
COPY package.json ./
RUN npm install && mkdir /app
WORKDIR /app

EXPOSE 3000
EXPOSE 5555

ENTRYPOINT ["bash", "script.sh"]