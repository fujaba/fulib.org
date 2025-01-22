FROM node:lts-slim as builder
WORKDIR /frontend
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
ARG CONFIGURATION=production
ARG BUILD_VERSION=0.0.0
RUN pnpm run build --configuration $CONFIGURATION --define BUILD_VERSION=\"$BUILD_VERSION\"

FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /frontend/dist/fulib.org/browser/ /usr/share/nginx/html/
EXPOSE 80
