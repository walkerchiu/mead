# syntax=docker/dockerfile:1
# 教育部藝術設計三大計畫入口網 — 後端（NestJS + Prisma）
# build context 為 monorepo 根目錄：
#   docker build -f apps/backend/Dockerfile -t mead-backend .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---- 安裝相依 + 建置 ----
FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile --filter @mead/backend...
# 產生 Prisma client（schema 由多檔合併 → db:merge-schemas && prisma generate）
RUN pnpm --filter @mead/backend db:generate
RUN pnpm --filter @mead/backend build

# ---- 執行階段 ----
# 直接沿用 builder 的完整 /app（保留 pnpm 的 node_modules symlink 結構，
# 避免跨 stage 複製 symlink 失效；單一自架部署下可靠性優先於映像大小）。
FROM builder AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["node", "dist/main"]
