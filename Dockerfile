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
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

RUN apk add --no-cache dumb-init

COPY ./ ./

EXPOSE 8080

CMD ["/bin/sh", "./start.sh"]
