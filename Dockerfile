# syntax=docker/dockerfile:1

# Admin frontend (TanStack Start SSR) for Coolify.
# Builds with the nitro node-server preset and runs the bundled Node server.

# ---- Build stage ----
FROM oven/bun:1 AS build
WORKDIR /app

# Vite inlines VITE_* at build time, so these must be build args.
# Set them in Coolify (Build Variables):
#   VITE_API_BASE_URL=https://<production-backend>
#   VITE_PUBLIC_APP_DEEPLINK_BASE=https://<app-deeplink-base>   (optional)
ARG VITE_API_BASE_URL
ARG VITE_PUBLIC_APP_DEEPLINK_BASE
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_PUBLIC_APP_DEEPLINK_BASE=${VITE_PUBLIC_APP_DEEPLINK_BASE}

# Install deps against the committed lockfile for reproducible builds.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the SSR Node server (.output/server/index.mjs + .output/public).
COPY . .
ENV NITRO_PRESET=node-server
RUN bun run build

# ---- Runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Nitro node-server honors PORT/HOST; Coolify maps this.
ENV PORT=3000
ENV HOST=0.0.0.0

# The node-server output is self-contained (deps bundled) — no node_modules needed.
COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
