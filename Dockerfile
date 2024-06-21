FROM node:18-alpine

RUN apk add --no-cache \
  autoconf \
  automake \
  libtool \
  make \
  tiff \
  jpeg \
  zlib \
  zlib-dev \
  pkgconf \
  nasm file \
  gcc \
  musl-dev \
  libc6-compat \
  vips
WORKDIR /usr/src/app
RUN npm install -g pnpm
COPY ./ ./
RUN pnpm install --frozen-lockfile

RUN apk add --no-cache dumb-init

RUN npx bazed run //service
RUN npx bazed run //ui:build

EXPOSE 8080

CMD ["/bin/sh", "./start.sh"]
