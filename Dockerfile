FROM node:14

WORKDIR /usr/src/app

COPY . .
RUN npm install
RUN npm run build
# Eventualmente esto tiene que ser RUN npm ci


# Puerto del microservicio
EXPOSE 3000

CMD [ "node", "build/index.js" ]

