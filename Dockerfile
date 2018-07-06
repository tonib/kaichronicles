FROM node:6.14.2-slim
RUN apt-get update && apt-get install -y zip && apt-get install -y subversion
WORKDIR /srv/kai
COPY . .
EXPOSE 8080
RUN npm install && npm run ts && npm run downloaddata
RUN npm install http-server -g && cat LICENSE
CMD ["http-server", "./src/www"]