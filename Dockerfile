# syntax=docker/dockerfile:1

FROM oven/bun:1.4.4-alpine AS builder
WORKDIR /app
# Install before copying source so the layer is cached until bun.lock changes.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Built without env: all vars are server-only (no NEXT_PUBLIC_), read from .env at runtime.
RUN bun --bun next build

# Separate stage so the final image holds only the standalone output, not source or node_modules.
FROM oven/bun:1.4.4-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/public ./public
USER bun
EXPOSE 3000
# All env (.env via compose) comes at runtime, never the image.
CMD ["bun", "server.js"]
