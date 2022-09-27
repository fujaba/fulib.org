FROM node:16-slim as builder
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
ARG SERVICE
RUN pnpm build $SERVICE

FROM node:16-slim
RUN npm install -g pnpm
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
ARG SERVICE
ENV SERVICE=$SERVICE
CMD node dist/apps/$SERVICE/main.js
