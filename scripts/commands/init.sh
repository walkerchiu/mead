#!/bin/bash

# ==========================================
# MEAD CLI - init 命令
# 新開發者專案初始化
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh init${NC} - 初始化 MEAD 專案\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  為新開發者設置完整的開發環境，包括："
  echo "  - 檢查系統需求 (Node.js, pnpm, Docker)"
  echo "  - 設置環境變數"
  echo "  - 安裝依賴"
  echo "  - 啟動 Docker 服務"
  echo "  - 初始化資料庫"
  echo "  - 驗證所有服務"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh init [options]"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  --skip-docker    跳過 Docker 服務啟動"
  echo "  --skip-install   跳過依賴安裝"
  echo "  --skip-db        跳過資料庫初始化"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh init                    # 完整初始化"
  echo "  ./scripts/cli.sh init --skip-docker      # 跳過 Docker（已手動啟動）"
  echo "  ./scripts/cli.sh init --skip-install     # 跳過安裝（已安裝過）"
  echo ""
}

# 解析參數
SKIP_DOCKER=false
SKIP_INSTALL=false
SKIP_DB=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-docker)
      SKIP_DOCKER=true
      shift
      ;;
    --skip-install)
      SKIP_INSTALL=true
      shift
      ;;
    --skip-db)
      SKIP_DB=true
      shift
      ;;
    -h|--help)
      show_command_help
      exit 0
      ;;
    *)
      log_error "未知的選項: $1"
      show_command_help
      exit 1
      ;;
  esac
done

# 切換到專案根目錄
cd "$PROJECT_ROOT"

print_header "MEAD 專案初始化"

# ==========================================
# Step 1: 檢查系統需求
# ==========================================
log_step "1/6 檢查系統需求"

REQUIREMENTS_MET=true

# 檢查 Node.js
if check_version "node" "20.0.0" "Node.js"; then
  true
else
  REQUIREMENTS_MET=false
  log_error "請安裝 Node.js >= 20.0.0"
  echo "      下載: https://nodejs.org/"
fi

# 檢查 pnpm
if check_version "pnpm" "9.0.0" "pnpm"; then
  true
else
  REQUIREMENTS_MET=false
  log_error "請安裝 pnpm >= 9.0.0"
  echo "      執行: npm install -g pnpm"
fi

# 檢查 Docker
if check_command "docker" "Docker"; then
  # 檢查 Docker 是否運行
  if docker info &> /dev/null; then
    log_success "Docker daemon 正在運行"
  else
    log_warning "Docker daemon 未運行"
    if confirm "是否要啟動 Docker?"; then
      open -a Docker
      log_info "等待 Docker 啟動..."
      sleep 5
    fi
  fi
else
  REQUIREMENTS_MET=false
  log_error "請安裝 Docker Desktop"
  echo "      下載: https://www.docker.com/products/docker-desktop"
fi

# 檢查 Docker Compose
if check_command "docker-compose" "Docker Compose"; then
  true
else
  REQUIREMENTS_MET=false
fi

if [ "$REQUIREMENTS_MET" = false ]; then
  log_error "系統需求檢查失敗，請安裝缺少的工具後重試"
  exit 1
fi

log_success "系統需求檢查通過"

# ==========================================
# Step 2: 設置環境變數
# ==========================================
log_step "2/6 設置環境變數"

# .env.docker
if copy_template ".env.docker.example" ".env.docker" "Docker 環境變數"; then
  log_warning "請檢查並更新 .env.docker 中的密碼"
fi

# Backend .env
if copy_template "apps/backend/.env.example" "apps/backend/.env" "Backend 環境變數"; then
  log_warning "請檢查並更新 apps/backend/.env 中的密碼"
fi

# Frontend .env
if copy_template "apps/frontend/.env.example" "apps/frontend/.env" "Frontend 環境變數"; then
  true
fi

log_success "環境變數設置完成"

# ==========================================
# Step 3: 安裝依賴
# ==========================================
if [ "$SKIP_INSTALL" = false ]; then
  log_step "3/6 安裝依賴"

  log_info "執行 pnpm install..."
  if pnpm install; then
    log_success "依賴安裝完成"
  else
    log_error "依賴安裝失敗"
    exit 1
  fi
else
  log_step "3/6 跳過安裝依賴"
fi

# ==========================================
# Step 4: 啟動 Docker 服務
# ==========================================
if [ "$SKIP_DOCKER" = false ]; then
  log_step "4/6 啟動 Docker 服務"

  # 從 .env.docker 載入變數（供 envsubst 使用）
  if [[ -f "$PROJECT_ROOT/.env.docker" ]]; then
    set -a
    source "$PROJECT_ROOT/.env.docker"
    set +a
  fi

  # 生成 SeaweedFS S3 設定（從 template 替換環境變數）
  S3_TEMPLATE="$PROJECT_ROOT/infra/seaweedfs/s3.json.template"
  S3_CONFIG="$PROJECT_ROOT/infra/seaweedfs/s3.json"
  if [[ -f "$S3_TEMPLATE" ]]; then
    envsubst '${SEAWEEDFS_S3_USER} ${SEAWEEDFS_S3_PASSWORD}' < "$S3_TEMPLATE" > "$S3_CONFIG"
    log_success "SeaweedFS S3 設定已生成"
  else
    log_warning "找不到 SeaweedFS S3 設定範本，跳過"
  fi

  # 啟動核心服務
  log_info "啟動核心服務 (TimescaleDB, RabbitMQ, Dragonfly, Mailpit)..."

  if docker-compose --env-file .env.docker up -d; then
    log_success "核心服務已啟動"

    # 等待核心服務就緒
    log_info "等待核心服務就緒..."
    sleep 5

    # 檢查 PostgreSQL（透過 Docker 容器內的 pg_isready）
    PG_CONTAINER=$(get_container_name timescaledb)
    wait_for_service "docker exec $PG_CONTAINER pg_isready -U postgres" "PostgreSQL" 30 2

    # 檢查 RabbitMQ
    wait_for_service "curl -s http://localhost:15672 > /dev/null" "RabbitMQ" 30 2

    # 檢查 Dragonfly（透過 Docker 容器內的 redis-cli）
    REDIS_CONTAINER=$(get_container_name dragonfly)
    wait_for_service "docker exec $REDIS_CONTAINER redis-cli ping" "Dragonfly" 30 2

    # 檢查 Mailpit
    wait_for_service "curl -s http://localhost:8025/api/v1/info > /dev/null" "Mailpit" 30 2

    # 啟動儲存服務
    echo ""
    log_info "啟動儲存服務 (SeaweedFS)..."
    if docker-compose --env-file .env.docker --profile storage up -d seaweedfs-master seaweedfs-volume seaweedfs-filer seaweedfs-s3; then
      log_success "SeaweedFS 容器已啟動"
      log_info "等待 SeaweedFS 就緒..."
      sleep 5

      # 檢查 SeaweedFS Master
      if curl -sf http://localhost:9333/cluster/status > /dev/null 2>&1; then
        log_success "SeaweedFS Master 就緒"
      else
        log_warning "SeaweedFS Master 尚未完全就緒，請稍後檢查"
      fi
    else
      log_warning "SeaweedFS 啟動失敗（非關鍵性錯誤，可繼續）"
    fi

    echo ""
    log_success "所有 Docker 服務已啟動"

  else
    log_error "核心服務啟動失敗"
    exit 1
  fi
else
  log_step "4/6 跳過 Docker 服務啟動"
fi

# ==========================================
# Step 5: 初始化資料庫
# ==========================================
if [ "$SKIP_DB" = false ]; then
  log_step "5/6 初始化資料庫"

  # 產生 Prisma Client
  log_info "產生 Prisma Client..."
  if pnpm db:generate; then
    log_success "Prisma Client 已產生"
  else
    log_error "Prisma Client 產生失敗"
    exit 1
  fi

  # 初始化資料庫函式（uuid_generate_v7 等）
  log_info "初始化資料庫函式..."
  ENABLE_UUID_SQL="apps/backend/database/prisma/migrations/enable_uuid_v7.sql"
  if [ -f "$ENABLE_UUID_SQL" ]; then
    PG_CONTAINER=$(get_container_name timescaledb)
    docker exec -i "$PG_CONTAINER" psql -U postgres -d mead_db -v ON_ERROR_STOP=1 < "$ENABLE_UUID_SQL" &> /dev/null
    log_success "資料庫函式已初始化"
  else
    log_warning "找不到 enable_uuid_v7.sql，跳過"
  fi

  # 推送 schema
  log_info "推送資料庫 schema..."
  if pnpm db:push; then
    log_success "資料庫 schema 已推送"
  else
    log_error "資料庫 schema 推送失敗"
    exit 1
  fi

  # 讀取當前環境並設定 NPT_ENV
  CURRENT_ENV="local"
  if [[ -f "$PROJECT_ROOT/.current-env" ]]; then
    CURRENT_ENV=$(cat "$PROJECT_ROOT/.current-env")
  fi

  case "$CURRENT_ENV" in
    local|dev) NPT_ENV="development" ;;
    uat)       NPT_ENV="uat" ;;
    prod)      NPT_ENV="production" ;;
    *)         NPT_ENV="development" ;;
  esac

  export NPT_ENV
  log_info "Seed 環境: $NPT_ENV"

  # 執行 seed
  log_info "載入初始資料..."
  if (cd apps/backend && pnpm db:seed); then
    log_success "初始資料已載入"
  else
    log_error "初始資料載入失敗"
    exit 1
  fi
else
  log_step "5/6 跳過資料庫初始化"
fi

# ==========================================
# Step 6: 驗證安裝
# ==========================================
log_step "6/6 驗證安裝"

# 檢查所有 Docker 服務狀態（含核心服務與儲存服務）
check_all_services() {
  local all_healthy=true

  # 核心服務
  if docker ps --format '{{.Names}}' | grep -q "timescaledb"; then
    log_success "✓ PostgreSQL 運行中"
  else
    log_error "✗ PostgreSQL 未運行"
    all_healthy=false
  fi

  if docker ps --format '{{.Names}}' | grep -q "rabbitmq"; then
    log_success "✓ RabbitMQ 運行中"
  else
    log_error "✗ RabbitMQ 未運行"
    all_healthy=false
  fi

  if docker ps --format '{{.Names}}' | grep -q "dragonfly"; then
    log_success "✓ Dragonfly (Redis) 運行中"
  else
    log_error "✗ Dragonfly 未運行"
    all_healthy=false
  fi

  if docker ps --format '{{.Names}}' | grep -q "mailpit"; then
    log_success "✓ Mailpit 運行中"
  else
    log_error "✗ Mailpit 未運行"
    all_healthy=false
  fi

  # 儲存服務（SeaweedFS）
  if docker ps --format '{{.Names}}' | grep -q "seaweedfs"; then
    log_success "✓ SeaweedFS 運行中"
  else
    log_warning "△ SeaweedFS 未運行（非關鍵性，可執行 ./scripts/cli.sh storage start 啟動）"
  fi

  if [ "$all_healthy" = true ]; then
    return 0
  else
    return 1
  fi
}

log_info "執行服務健康檢查..."
echo ""
if check_all_services; then
  echo ""
  log_success "所有核心服務運行正常"
else
  echo ""
  log_warning "部分核心服務未正常運行，請檢查"
fi

# ==========================================
# 完成
# ==========================================
echo ""
print_header "🎉 初始化完成！"

echo -e "${GREEN}✓${NC} 專案已成功初始化！\n"
echo -e "${YELLOW}測試帳號：${NC}"
echo "  HQ:     hq@example.com    / Password123!"
echo "  Public: public@example.com / Password123!"
echo ""
echo -e "${YELLOW}服務端點：${NC}"
echo "  Frontend:       http://localhost:3000"
echo "  Backend API:    http://localhost:4000/graphql"
echo "  RabbitMQ UI:    http://localhost:15672 (hq/[.env.docker password])"
echo "  Prisma Studio:  pnpm db:studio"
echo ""
echo -e "${YELLOW}下一步：${NC}"
echo "  1. 啟動開發環境:"
echo -e "     ${CYAN}./scripts/cli.sh dev${NC}"
echo "     "
echo "     或分別啟動:"
echo -e "     ${CYAN}pnpm --filter @mead/frontend dev${NC}  # 終端 1"
echo -e "     ${CYAN}pnpm --filter @mead/backend dev${NC}   # 終端 2"
echo ""
echo "  2. 查看 Storybook:"
echo -e "     ${CYAN}pnpm storybook${NC}"
echo ""
echo "  3. 執行測試:"
echo -e "     ${CYAN}./scripts/cli.sh test${NC}"
echo ""
echo -e "${YELLOW}其他指令：${NC}"
echo "  SeaweedFS 管理 (本地 S3 儲存):"
echo -e "     ${CYAN}./scripts/cli.sh storage info${NC}     # 查看連接資訊"
echo -e "     ${CYAN}./scripts/cli.sh storage status${NC}   # 查看狀態"
echo -e "     ${CYAN}./scripts/cli.sh storage stop${NC}     # 如不需要可停止"
echo ""
echo -e "${YELLOW}有問題？${NC}"
echo -e "  執行診斷工具: ${CYAN}./scripts/cli.sh doctor${NC}"
echo -e "  查看文檔: ${CYAN}README.md${NC}"
echo ""
