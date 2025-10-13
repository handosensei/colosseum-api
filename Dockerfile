FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install -g @nestjs/cli
RUN npm install
#COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
