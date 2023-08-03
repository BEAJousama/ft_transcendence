FROM node:18

COPY ./package.json /package.json
RUN npm install

WORKDIR /app

EXPOSE 5000

# ENTRYPOINT ["bash", "script.sh"]
ENTRYPOINT ["bash", "npm run dev"]
