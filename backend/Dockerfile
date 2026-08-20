# Multi-stage Dockerfile for NestJS Backend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/ && \
    npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/ && \
    npm install --only=production

COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
