# syntax=docker/dockerfile:1
# 教育部藝術設計三大計畫入口網 — 前端（Next.js standalone）
# build context 為 monorepo 根目錄：
#   docker build -f apps/frontend/Dockerfile -t mead-frontend .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---- 安裝相依 + 建置 ----
FROM base AS builder
# 複製整個 workspace（monorepo 建置需要 lockfile、workspace 設定、共用 packages）
COPY . .
RUN pnpm install --frozen-lockfile --filter @mead/frontend...
RUN pnpm --filter @mead/frontend build

# ---- 執行階段（最小映像）----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# 以非 root 身分執行
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Next.js standalone 產出（含追蹤過的最小 node_modules）
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

USER nextjs
EXPOSE 3000
# standalone 於 monorepo 下的進入點
CMD ["node", "apps/frontend/server.js"]
