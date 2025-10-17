FROM node:22-alpine
RUN apk add --no-cache procps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm install -g @nestjs/cli
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]
EXPOSE 3000

