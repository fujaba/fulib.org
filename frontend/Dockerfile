FROM node:lts-slim AS builder
WORKDIR /frontend
COPY package.json pnpm-lock.yaml ./
RUN corepack pnpm install
COPY . .
ARG CONFIGURATION=production
ARG BUILD_VERSION=0.0.0
RUN corepack pnpm run build --configuration $CONFIGURATION --define BUILD_VERSION=\"$BUILD_VERSION\"

FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /frontend/dist/fulib.org/browser/ /usr/share/nginx/html/
EXPOSE 80
