FROM node:lts-slim AS builder
WORKDIR /app
ENV COREPACK_DEFAULT_TO_LATEST=0
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    corepack pnpm install --frozen-lockfile
COPY . .
ARG SERVICE
RUN corepack pnpm build $SERVICE

FROM node:lts-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    corepack pnpm install --frozen-lockfile
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE $PORT
ARG SERVICE
ENV SERVICE=$SERVICE
CMD node dist/apps/$SERVICE/main.js
