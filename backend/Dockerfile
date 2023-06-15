FROM node:18

COPY package.json ./
RUN npm install
WORKDIR /app

EXPOSE 3000
EXPOSE 5555

ENTRYPOINT ["bash", "script.sh"]
