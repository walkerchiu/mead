#!/bin/bash

# ==========================================
# Wind CLI - restart 命令
# 快速重啟服務
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh restart${NC} - 快速重啟服務\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  重啟特定服務或所有服務"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh restart <service> [options]"
  echo ""
  echo -e "${YELLOW}服務:${NC}"
  echo -e "  ${CYAN}frontend${NC}        重啟前端 (Next.js)"
  echo -e "  ${CYAN}backend${NC}         重啟後端 (NestJS)"
  echo -e "  ${CYAN}storybook${NC}       重啟 Storybook"
  echo -e "  ${CYAN}prisma-studio${NC}   重啟 Prisma Studio"
  echo -e "  ${CYAN}docker${NC}          重啟 Docker 服務"
  echo -e "  ${CYAN}all${NC}             重啟所有服務"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  --force          強制終止進程（使用 kill -9）"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh restart frontend        # 重啟前端"
  echo "  ./scripts/cli.sh restart backend         # 重啟後端"
  echo "  ./scripts/cli.sh restart storybook       # 重啟 Storybook"
  echo "  ./scripts/cli.sh restart docker          # 重啟 Docker 服務"
  echo "  ./scripts/cli.sh restart all             # 重啟所有服務"
  echo "  ./scripts/cli.sh restart backend --force # 強制重啟後端"
  echo ""
  echo -e "${YELLOW}快捷鍵提示:${NC}"
  echo "  在開發過程中："
  echo "  - 前端改動會自動熱重載（Next.js Fast Refresh）"
  echo "  - 後端改動會自動重啟（NestJS watch mode）"
  echo "  - 只有在服務卡住時才需要手動重啟"
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

  PIDS=$(lsof -ti:$port 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    log_info "終止 $service_name (port $port, PID: $PIDS)"
    if [ "$FORCE" = true ]; then
      echo "$PIDS" | xargs kill -9 2>/dev/null || true
    else
      echo "$PIDS" | xargs kill 2>/dev/null || true
      sleep 2
      # 檢查是否還在運行
      if lsof -ti:$port >/dev/null 2>&1; then
        log_warning "$service_name 未正常終止，使用強制終止"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
      fi
    fi
    log_success "$service_name 已終止"
  else
    log_info "$service_name 未運行"
  fi
}

# 重啟 Docker 服務
restart_docker() {
  print_header "重啟 Docker 服務"

  log_info "停止 Docker 容器..."
  docker-compose --env-file .env.docker down

  log_info "啟動 Docker 容器..."
  if docker-compose --env-file .env.docker up -d; then
    log_success "Docker 服務已重啟"

    # 等待服務就緒
    log_info "等待服務就緒..."
    sleep 5

    PG_CONTAINER=$(get_container_name timescaledb)
    REDIS_CONTAINER=$(get_container_name dragonfly)

    wait_for_service "docker exec $PG_CONTAINER pg_isready -U postgres" "PostgreSQL" 30 2
    wait_for_service "docker exec $REDIS_CONTAINER redis-cli ping" "Dragonfly" 30 2
    wait_for_service "curl -s http://localhost:15672 > /dev/null" "RabbitMQ" 30 2
    wait_for_service "curl -s http://localhost:8025/api/v1/info > /dev/null" "Mailpit" 30 2
  else
    log_error "Docker 服務重啟失敗"
    exit 1
  fi
}

# 重啟前端
restart_frontend() {
  print_header "重啟前端服務"

  kill_process 3000 "Frontend"

  log_info "啟動前端..."
  echo ""

  # 自動啟動前端
  exec "$SCRIPT_DIR/dev.sh" --frontend-only
}

# 重啟後端
restart_backend() {
  print_header "重啟後端服務"

  kill_process 4000 "Backend"

  log_info "啟動後端..."
  echo ""

  # 自動啟動後端
  exec "$SCRIPT_DIR/dev.sh" --backend-only
}

# 重啟 Storybook
restart_storybook() {
  print_header "重啟 Storybook"

  kill_process 6006 "Storybook"

  log_info "啟動 Storybook..."
  echo ""

  # 自動啟動 Storybook
  exec "$SCRIPT_DIR/dev.sh" --storybook-only
}

# 重啟 Prisma Studio
restart_prisma_studio() {
  print_header "重啟 Prisma Studio"

  kill_process 5555 "Prisma Studio"

  log_info "啟動 Prisma Studio..."
  echo ""

  # 自動啟動 Prisma Studio
  exec "$SCRIPT_DIR/db.sh" studio
}

# 重啟所有服務
restart_all() {
  print_header "重啟所有服務"

  log_warning "這將重啟前端、後端、Storybook、Prisma Studio 和 Docker 服務"
  if ! confirm "確定要繼續嗎?" "n"; then
    log_info "已取消"
    exit 0
  fi

  # 終止應用服務
  kill_process 3000 "Frontend"
  kill_process 4000 "Backend"
  kill_process 6006 "Storybook"
  kill_process 5555 "Prisma Studio"

  # 重啟 Docker
  restart_docker

  echo ""
  log_success "所有服務已終止並重啟 Docker"
  echo ""
  log_info "正在啟動開發服務..."
  echo ""

  # 自動啟動所有開發服務
  exec "$SCRIPT_DIR/dev.sh" --all
}

# 路由服務
case "$SERVICE" in
  frontend|front|fe)
    restart_frontend
    ;;
  backend|back|be|api)
    restart_backend
    ;;
  storybook|sb)
    restart_storybook
    ;;
  prisma-studio|studio|prisma)
    restart_prisma_studio
    ;;
  docker|db|services)
    restart_docker
    ;;
  all|everything)
    restart_all
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
