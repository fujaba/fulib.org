FROM node:lts-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack pnpm install
COPY . .
ARG SERVICE
RUN corepack pnpm build $SERVICE

FROM node:lts-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN corepack pnpm install
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
ARG SERVICE
ENV SERVICE=$SERVICE
CMD node dist/apps/$SERVICE/main.js
