FROM node:6.14.2
RUN apt-get update
RUN apt-get install -y zip 
RUN apt-get install -y subversion
WORKDIR /
COPY . /
RUN npm install
RUN npm run ts
RUN npm run downloaddata
RUN npm install http-server -g
RUN cat LICENSE
EXPOSE 8080
CMD ["http-server", "./src/www"]