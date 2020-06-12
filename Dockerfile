FROM node:12.18.0-alpine3.12
ENV REGION us-east-1
WORKDIR /usr/src/app
COPY package.json .
COPY tsconfig.json .
RUN npm install
ADD . /usr/src/app
RUN npm run start
CMD ["npm", "start"]