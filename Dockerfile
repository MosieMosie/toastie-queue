# Build the static bundle, then run the little Node server that serves it and
# the API. The build stage is what lets this work on a Pi running an older
# distro Node: nothing but Docker is needed on the box, and Vite 7 gets the
# Node it wants inside the image.
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@11.5.2
# pnpm-workspace.yaml carries the allowBuilds approvals, so postinstalls actually run
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# The runtime is plain Node 24: server/ has zero dependencies (node:sqlite is
# built in), so no node_modules and no install step here.
FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server ./server
COPY shared ./shared
ENV TOSTI_DATA_DIR=/data
EXPOSE 3000
CMD ["node", "server/index.ts"]
