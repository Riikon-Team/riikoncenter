FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_GITHUB_ORG
ENV NEXT_PUBLIC_GITHUB_ORG=$NEXT_PUBLIC_GITHUB_ORG

RUN pnpm --filter web run build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3003
CMD ["pnpm", "--filter", "web", "start"]
