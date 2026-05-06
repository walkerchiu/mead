#!/bin/bash

# ==========================================
# NPT CLI - doctor 命令
# 環境診斷工具
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh doctor${NC} - 診斷開發環境\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  全面檢查並診斷開發環境的問題，包括："
  echo "  - 系統需求（Node.js, pnpm, Docker）"
  echo "  - 環境變數配置"
  echo "  - Docker 服務狀態"
  echo "  - 資料庫連線（PostgreSQL, Redis, RabbitMQ, Mailpit, SeaweedFS）"
  echo "  - Port 占用情況"
  echo "  - 依賴安裝狀態"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh doctor [options]"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  --fix        嘗試自動修復發現的問題"
  echo "  -y, --yes    修復時一律 Yes（跳過所有確認；適合 CI / 自動化）"
  echo "  -h, --help   顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh doctor                # 診斷環境"
  echo "  ./scripts/cli.sh doctor --fix          # 診斷並嘗試修復（互動確認）"
  echo "  ./scripts/cli.sh doctor --fix --yes    # 完整自動修復（無需互動）"
  echo ""
  echo -e "${YELLOW}非互動 / CI 環境:${NC}"
  echo "  當 stdin 非 TTY（如管線執行）時，confirm 會直接使用 default。"
  echo "  若需強制 Yes，請加 --yes 或設 AUTO_YES=1 環境變數。"
  echo ""
  echo -e "${YELLOW}與 status 命令的差異:${NC}"
  echo -e "  ${CYAN}status${NC}        - 快速查看服務運行狀態（運行中？CPU？記憶體？）"
  echo -e "  ${CYAN}status --health${NC} - 加上服務連線測試（HTTP/GraphQL 請求）"
  echo -e "  ${CYAN}doctor${NC}        - 全面診斷開發環境（系統、配置、依賴、連線）"
  echo -e "  ${CYAN}doctor --fix${NC}  - 診斷並自動修復問題"
  echo ""
}

# 解析參數
AUTO_FIX=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --fix)
      AUTO_FIX=true
      shift
      ;;
    -y|--yes)
      export AUTO_YES=1
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

print_header "NPT 環境診斷"

ISSUES_FOUND=0

# ==========================================
# 1. 系統需求檢查
# ==========================================
log_step "1/7 系統需求"

if ! check_version "node" "20.0.0" "Node.js"; then
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "Node.js 版本不符或未安裝"
  echo "      建議: 安裝 Node.js >= 20.0.0 from https://nodejs.org/"
fi

if ! check_version "pnpm" "9.0.0" "pnpm"; then
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "pnpm 版本不符或未安裝"
  echo "      建議: npm install -g pnpm"

  if [ "$AUTO_FIX" = true ]; then
    if confirm "是否要安裝 pnpm?"; then
      npm install -g pnpm
      log_success "pnpm 已安裝"
    fi
  fi
fi

if ! check_command "docker" "Docker"; then
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "Docker 未安裝"
  echo "      建議: 安裝 Docker Desktop from https://www.docker.com/"
else
  if ! docker info &> /dev/null; then
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    log_error "Docker daemon 未運行"
    echo "      建議: 啟動 Docker Desktop"

    if [ "$AUTO_FIX" = true ]; then
      if confirm "是否要啟動 Docker?"; then
        open -a Docker
        log_info "等待 Docker 啟動..."
        sleep 5
      fi
    fi
  else
    log_success "Docker daemon 正在運行"
  fi
fi

# ==========================================
# 2. 環境變數檢查
# ==========================================
log_step "2/7 環境變數"

if check_file ".env.docker" "Docker 環境變數"; then
  # 檢查密碼是否為預設值
  if grep -q "dev_postgres_pass_2024\|dev_rabbitmq_pass_2024" .env.docker 2>/dev/null; then
    log_warning "檢測到預設密碼，建議更換"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
else
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  echo "      建議: cp .env.docker.example .env.docker"

  if [ "$AUTO_FIX" = true ]; then
    if confirm "是否要建立 .env.docker?"; then
      cp .env.docker.example .env.docker
      log_success ".env.docker 已建立"
    fi
  fi
fi

if check_file "apps/backend/.env" "Backend 環境變數"; then
  true
else
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  echo "      建議: cp apps/backend/.env.example apps/backend/.env"

  if [ "$AUTO_FIX" = true ]; then
    if confirm "是否要建立 apps/backend/.env?"; then
      cp apps/backend/.env.example apps/backend/.env
      log_success "apps/backend/.env 已建立"
    fi
  fi
fi

if check_file "apps/frontend/.env" "Frontend 環境變數"; then
  true
else
  log_warning "Frontend 環境變數不存在（可選）"
  echo "      建議: cp apps/frontend/.env.example apps/frontend/.env"
fi

# ==========================================
# 3. Docker 服務狀態
# ==========================================
log_step "3/7 Docker 服務"

# 檢查容器是否運行
if docker ps --format '{{.Names}}' | grep -q "npt-"; then
  log_success "Docker 容器正在運行"

  # 列出運行中的容器
  echo ""
  echo "  運行中的服務:"
  docker ps --filter "name=npt-" --format "    - {{.Names}} ({{.Status}})"
  echo ""
else
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "沒有運行中的 NPT 容器"
  echo "      建議: docker-compose --env-file .env.docker up -d"

  if [ "$AUTO_FIX" = true ]; then
    if confirm "是否要啟動 Docker 服務?"; then
      docker-compose --env-file .env.docker up -d
      log_success "Docker 服務已啟動"
      sleep 5
    fi
  fi
fi

# ==========================================
# 4. 資料庫連線檢查
# ==========================================
log_step "4/7 資料庫連線"

PG_CONTAINER=$(get_container_name timescaledb)
if docker exec "$PG_CONTAINER" pg_isready -U postgres &> /dev/null; then
  log_success "PostgreSQL 可連線"
else
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "PostgreSQL 無法連線"
  echo "      建議: 檢查 Docker 容器是否運行"
fi

REDIS_CONTAINER=$(get_container_name dragonfly)
if docker exec "$REDIS_CONTAINER" redis-cli ping &> /dev/null; then
  log_success "Dragonfly (Redis) 可連線"
else
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "Dragonfly 無法連線"
  echo "      建議: 檢查 Docker 容器是否運行"
fi

# 檢查 RabbitMQ
if curl -s http://localhost:15672 > /dev/null 2>&1; then
  log_success "RabbitMQ Management UI 可存取"
else
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "RabbitMQ 無法存取"
  echo "      建議: 檢查 Docker 容器是否運行"
fi

# 檢查 Mailpit
if curl -s http://localhost:8025/api/v1/info > /dev/null 2>&1; then
  log_success "Mailpit Web UI 可存取"
else
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "Mailpit 無法存取"
  echo "      建議: 檢查 Docker 容器是否運行"
fi


# 檢查 SeaweedFS（如果有運行）
SEAWEEDFS_RUNNING=false
if docker ps --format '{{.Names}}' | grep -q 'seaweedfs' 2>/dev/null; then
  SEAWEEDFS_RUNNING=true

  # 檢查關鍵服務
  seaweedfs_healthy=true

  # 檢查 Master
  if curl -sf http://localhost:${SEAWEEDFS_MASTER_PORT:-9333}/cluster/status > /dev/null 2>&1; then
    log_success "SeaweedFS Master 可存取"
  else
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    log_error "SeaweedFS Master 無法存取"
    echo "      建議: ./scripts/cli.sh storage diagnose"
    seaweedfs_healthy=false
  fi

  # 檢查 Volume
  if curl -sf http://localhost:${SEAWEEDFS_VOLUME_PORT:-8080}/status > /dev/null 2>&1; then
    log_success "SeaweedFS Volume 可存取"
  else
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    log_error "SeaweedFS Volume 無法存取"
    echo "      建議: ./scripts/cli.sh storage diagnose"
    seaweedfs_healthy=false
  fi

  # 檢查 S3 端點（只看 LISTEN 過濾，避免被 client connection 誤觸）
  if lsof -ti:"${SEAWEEDFS_S3_PORT:-8333}" -sTCP:LISTEN >/dev/null 2>&1; then
    log_success "SeaweedFS S3 API 端口可連接"
    echo "      註: S3 API 需要 AWS 簽名認證"
  else
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    log_error "SeaweedFS S3 API 端口未監聽"
    echo "      建議: ./scripts/cli.sh storage restart"
    seaweedfs_healthy=false
  fi
else
  log_info "SeaweedFS 未啟用（選用服務）"
  echo "      啟動: ./scripts/cli.sh storage start"
fi
# ==========================================
# 5. Port 占用檢查
# ==========================================
log_step "5/7 Port 可用性"

# 按 Port 號碼順序檢查應用服務
check_port 3000 "Frontend (Next.js)"
check_port 4000 "Backend (NestJS)"
check_port 5555 "Prisma Studio"
check_port 6006 "Storybook"

# SeaweedFS Port（如果有運行，檢查端口是否正在監聽）
if docker ps --format '{{.Names}}' | grep -q 'seaweedfs' 2>/dev/null; then
  # 對於運行中的 SeaweedFS，端口被使用是正常的
  for port_info in "8080:SeaweedFS Volume" "8333:SeaweedFS S3" "8888:SeaweedFS Filer" "9333:SeaweedFS Master"; do
    port=$(echo "$port_info" | cut -d: -f1)
    name=$(echo "$port_info" | cut -d: -f2-)
    if lsof -Pi ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
      log_success "$name (port $port) 正在監聽"
    else
      log_warning "$name (port $port) 未監聽"
      echo "      建議: 檢查 SeaweedFS 服務狀態"
    fi
  done
fi

# ==========================================
# 6. 依賴檢查
# ==========================================
log_step "6/7 依賴安裝"

if check_directory "node_modules" "根目錄依賴"; then
  # 檢查是否需要更新
  if [ -f "pnpm-lock.yaml" ]; then
    if [ "pnpm-lock.yaml" -nt "node_modules" ]; then
      log_warning "依賴可能已過期"
      echo "      建議: pnpm install"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))

      if [ "$AUTO_FIX" = true ]; then
        if confirm "是否要更新依賴?"; then
          pnpm install
          log_success "依賴已更新"
        fi
      fi
    fi
  fi
else
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "依賴未安裝"
  echo "      建議: pnpm install"

  if [ "$AUTO_FIX" = true ]; then
    if confirm "是否要安裝依賴?"; then
      pnpm install
      log_success "依賴已安裝"
    fi
  fi
fi

if check_directory "apps/backend/node_modules" "Backend 依賴"; then
  true
else
  log_warning "Backend 依賴可能未正確安裝"
fi

if check_directory "apps/frontend/node_modules" "Frontend 依賴"; then
  true
else
  log_warning "Frontend 依賴可能未正確安裝"
fi

# ==========================================
# 7. Prisma 狀態檢查
# ==========================================
log_step "7/7 Prisma 狀態"

# 在 pnpm monorepo 中，Prisma Client 位於 .pnpm 目錄
PRISMA_CLIENT_PATH=$(find node_modules/.pnpm -type d -name ".prisma" 2>/dev/null | head -1)

if [ -n "$PRISMA_CLIENT_PATH" ] && [ -d "$PRISMA_CLIENT_PATH/client" ]; then
  log_success "Prisma Client 已產生"
  log_info "    位置: ${PRISMA_CLIENT_PATH#node_modules/}"
else
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
  log_error "Prisma Client 未產生"
  echo "      建議: pnpm db:generate"

  if [ "$AUTO_FIX" = true ]; then
    if confirm "是否要產生 Prisma Client?"; then
      pnpm db:generate
      log_success "Prisma Client 已產生"
    fi
  fi
fi

# ==========================================
# 總結
# ==========================================
echo ""
print_header "診斷結果"

if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✓ 沒有發現問題！開發環境狀態良好。${NC}\n"

  echo -e "${YELLOW}可以開始開發：${NC}"
  echo "  pnpm dev          # 啟動所有服務"
  echo "  pnpm frontend:dev # 只啟動前端"
  echo "  pnpm backend:dev  # 只啟動後端"
  echo ""

  # 如果 SeaweedFS 有運行，提示詳細診斷選項
  if [ "$SEAWEEDFS_RUNNING" = true ]; then
    echo -e "${YELLOW}SeaweedFS 進階診斷：${NC}"
    echo "  ./scripts/cli.sh storage diagnose  # 完整健康檢查"
    echo "  ./scripts/cli.sh storage info      # 查看連接資訊"
    echo ""
  fi
else
  echo -e "${YELLOW}⚠ 發現 $ISSUES_FOUND 個問題${NC}\n"

  echo -e "${YELLOW}建議的修復步驟：${NC}"
  echo "  1. 執行 ./scripts/cli.sh doctor --fix  # 自動修復"
  echo "  2. 或手動按照上述建議修復"
  echo "  3. 然後執行 ./scripts/cli.sh init      # 重新初始化"
  echo ""

  exit 1
fi
