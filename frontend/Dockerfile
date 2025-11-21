FROM node:lts-slim AS builder
WORKDIR /frontend
ENV COREPACK_DEFAULT_TO_LATEST=0
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    corepack pnpm install --frozen-lockfile
COPY . .
ARG CONFIGURATION=production
ARG BUILD_VERSION=0.0.0
RUN --mount=type=cache,target=/frontend/.angular/cache \
    corepack pnpm run build --configuration $CONFIGURATION --define BUILD_VERSION=\"$BUILD_VERSION\"

FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /frontend/dist/fulib.org/browser/ /usr/share/nginx/html/
EXPOSE 80
