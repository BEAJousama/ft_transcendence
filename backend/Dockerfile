FROM node:18

COPY . /app
WORKDIR /app
RUN apt-get update && apt-get install -y curl
RUN npm install
RUN chmod +x /app/script.sh
RUN /app/script.sh

EXPOSE 3000

ENTRYPOINT ["bash", "-c", "npm run start"]
