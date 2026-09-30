FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .

WORKDIR /app/external/integration-vibe-card-game/vibe-card-game
RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

RUN pnpm run build

EXPOSE 3310
# Assuming 3310 is the gateway port for the vibe-card-game, or we run dev for now
CMD ["pnpm", "run", "dev"]
