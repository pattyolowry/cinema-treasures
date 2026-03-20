# ---- Build stage ----
FROM node:latest AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm ci
COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:24.14.0-bookworm-slim
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build /usr/src/app/build ./build
USER node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "build/index.js"]