FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /opt/app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS development
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
CMD ["pnpm", "develop"]

FROM base AS build
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
COPY --from=build /opt/app/dist ./dist
COPY --from=build /opt/app/node_modules ./node_modules
COPY --from=build /opt/app/package.json ./
COPY --from=build /opt/app/config ./config
COPY --from=build /opt/app/public ./public
COPY --from=build /opt/app/database ./database
EXPOSE 1337
CMD ["pnpm", "start"]
