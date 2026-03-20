FROM node:24.14.0-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN npm ci --only=production
  
USER node

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "index.js"]