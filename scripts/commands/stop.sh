#!/bin/bash

# ==========================================
# Wind CLI - stop 命令
# 停止服務
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh stop${NC} - 停止服務\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  停止特定服務或所有服務"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh stop <service> [options]"
  echo ""
  echo -e "${YELLOW}服務:${NC}"
  echo -e "  ${CYAN}frontend${NC}        停止前端 (Next.js)"
  echo -e "  ${CYAN}backend${NC}         停止後端 (NestJS)"
  echo -e "  ${CYAN}storybook${NC}       停止 Storybook"
  echo -e "  ${CYAN}prisma-studio${NC}   停止 Prisma Studio"
  echo -e "  ${CYAN}docker${NC}          停止 Docker 服務"
  echo -e "  ${CYAN}all${NC}             停止所有服務"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  --force          強制終止進程（使用 kill -9）"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh stop frontend        # 停止前端"
  echo "  ./scripts/cli.sh stop backend          # 停止後端"
  echo "  ./scripts/cli.sh stop storybook        # 停止 Storybook"
  echo "  ./scripts/cli.sh stop docker           # 停止 Docker 服務"
  echo "  ./scripts/cli.sh stop all              # 停止所有服務"
  echo "  ./scripts/cli.sh stop backend --force  # 強制停止後端"
  echo ""
}

# 解析參數
FORCE=false
SERVICE="${1:-}"

if [[ -z "$SERVICE" ]]; then
  show_command_help
  exit 0
fi

shift

while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE=true
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

# 終止進程
kill_process() {
  local port="$1"
  local service_name="$2"

  # 方法 1: 通過端口查找進程
  PIDS=$(lsof -ti:$port 2>/dev/null || true)

  # 方法 2: 通過進程名稱查找後台進程（處理殭屍進程）
  local EXTRA_PIDS=""
  case "$service_name" in
    "Backend")
      # 查找 nest.js 和 pnpm dev (在 backend 目錄)
      EXTRA_PIDS=$(ps aux | grep -E "(nest.js start|pnpm dev)" | grep "apps/backend" | grep -v grep | awk '{print $2}' || true)
      ;;
    "Frontend")
      # 查找 next dev 和 pnpm dev (在 frontend 目錄)
      EXTRA_PIDS=$(ps aux | grep -E "(next dev|pnpm dev)" | grep "apps/frontend" | grep -v grep | awk '{print $2}' || true)
      ;;
    "Storybook")
      # 查找 storybook 進程
      EXTRA_PIDS=$(ps aux | grep "storybook" | grep -v grep | awk '{print $2}' || true)
      ;;
  esac

  # 合併 PID 列表
  ALL_PIDS=$(echo -e "$PIDS\n$EXTRA_PIDS" | sort -u | grep -v '^$' || true)

  if [ -n "$ALL_PIDS" ]; then
    log_info "終止 $service_name (port $port, PIDs: $(echo $ALL_PIDS | tr '\n' ' '))"
    if [ "$FORCE" = true ]; then
      echo "$ALL_PIDS" | xargs kill -9 2>/dev/null || true
    else
      echo "$ALL_PIDS" | xargs kill 2>/dev/null || true
      sleep 2
      # 檢查是否還在運行
      for pid in $ALL_PIDS; do
        if ps -p $pid > /dev/null 2>&1; then
          log_warning "$service_name (PID $pid) 未正常終止，使用強制終止"
          kill -9 $pid 2>/dev/null || true
        fi
      done
    fi
    log_success "$service_name 已停止"
  else
    log_info "$service_name 未運行"
  fi
}

# 停止 Docker 服務
stop_docker() {
  print_header "停止 Docker 服務"

  log_info "停止 Docker 容器..."
  docker-compose --env-file .env.docker down

  log_success "Docker 服務已停止"
}

# 停止前端
stop_frontend() {
  print_header "停止前端服務"
  kill_process 3000 "Frontend"
}

# 停止後端
stop_backend() {
  print_header "停止後端服務"
  kill_process 4000 "Backend"
}

# 停止 Storybook
stop_storybook() {
  print_header "停止 Storybook"
  kill_process 6006 "Storybook"
}

# 停止 Prisma Studio
stop_prisma_studio() {
  print_header "停止 Prisma Studio"
  kill_process 5555 "Prisma Studio"
}

# 停止所有服務
stop_all() {
  print_header "停止所有服務"

  log_warning "這將停止前端、後端、Storybook、Prisma Studio 和 Docker 服務"
  if ! confirm "確定要繼續嗎?" "n"; then
    log_info "已取消"
    exit 0
  fi

  # 終止應用服務
  kill_process 3000 "Frontend"
  kill_process 4000 "Backend"
  kill_process 6006 "Storybook"
  kill_process 5555 "Prisma Studio"

  # 停止 Docker
  stop_docker

  echo ""
  log_success "所有服務已停止"
}

# 路由服務
case "$SERVICE" in
  frontend|front|fe)
    stop_frontend
    ;;
  backend|back|be|api)
    stop_backend
    ;;
  storybook|sb)
    stop_storybook
    ;;
  prisma-studio|studio|prisma)
    stop_prisma_studio
    ;;
  docker|db|services)
    stop_docker
    ;;
  all|everything)
    stop_all
    ;;
  -h|--help)
    show_command_help
    ;;
  *)
    log_error "未知的服務: $SERVICE"
    echo ""
    show_command_help
    exit 1
    ;;
esac
