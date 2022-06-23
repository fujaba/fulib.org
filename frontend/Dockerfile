FROM node:16-alpine as builder
WORKDIR /frontend
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
ARG CONFIGURATION=production
RUN pnpm run build --configuration $CONFIGURATION

FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /frontend/dist/fulib.org/ /usr/share/nginx/html/
EXPOSE 80
