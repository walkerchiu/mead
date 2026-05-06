#!/bin/bash

# ==========================================
# NPT CLI - logs 命令
# 查看服務日誌
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh logs${NC} - 查看服務日誌\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  即時查看各種服務的日誌輸出"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh logs <service> [options]"
  echo ""
  echo -e "${YELLOW}服務:${NC}"
  echo -e "  ${CYAN}frontend${NC}        前端日誌 (Next.js)"
  echo -e "  ${CYAN}backend${NC}         後端日誌 (NestJS)"
  echo -e "  ${CYAN}storybook${NC}       Storybook 日誌"
  echo -e "  ${CYAN}docker${NC}          所有 Docker 容器日誌"
  echo -e "  ${CYAN}postgres${NC}        PostgreSQL 日誌"
  echo -e "  ${CYAN}rabbitmq${NC}        RabbitMQ 日誌"
  echo -e "  ${CYAN}redis${NC}           Dragonfly/Redis 日誌"
  echo -e "  ${CYAN}mailpit${NC}         Mailpit 日誌"
  echo -e "  ${CYAN}seaweedfs${NC}       SeaweedFS 所有服務日誌"
  echo -e "  ${CYAN}seaweedfs-master${NC}  SeaweedFS Master 日誌"
  echo -e "  ${CYAN}seaweedfs-volume${NC}  SeaweedFS Volume 日誌"
  echo -e "  ${CYAN}seaweedfs-filer${NC}   SeaweedFS Filer 日誌"
  echo -e "  ${CYAN}seaweedfs-s3${NC}      SeaweedFS S3 日誌"
  echo -e "  ${CYAN}all${NC}             所有服務日誌"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  -f, --follow     持續追蹤日誌（即時更新）"
  echo "  -n <num>         顯示最後 N 行（預設: 100）"
  echo "  --since <time>   從指定時間開始（如: 5m, 1h, 2023-01-01）"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh logs backend              # 查看後端最後 100 行日誌"
  echo "  ./scripts/cli.sh logs frontend -f          # 即時追蹤前端日誌"
  echo "  ./scripts/cli.sh logs docker -n 50         # 查看所有 Docker 日誌最後 50 行"
  echo "  ./scripts/cli.sh logs postgres --since 5m  # 查看 PostgreSQL 最近 5 分鐘日誌"
  echo "  ./scripts/cli.sh logs all -f               # 即時追蹤所有服務"
  echo ""
  echo -e "${YELLOW}快捷鍵:${NC}"
  echo "  Ctrl+C           停止追蹤日誌"
  echo "  Shift+PageUp     向上捲動（終端機功能）"
  echo "  Shift+PageDown   向下捲動（終端機功能）"
  echo ""
}

# 解析參數
FOLLOW=false
LINES=100
SINCE=""
SERVICE="${1:-}"

if [[ -z "$SERVICE" ]]; then
  show_command_help
  exit 0
fi

shift

while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--follow)
      FOLLOW=true
      shift
      ;;
    -n|--lines)
      LINES="$2"
      shift 2
      ;;
    --since)
      SINCE="$2"
      shift 2
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

# 檢查服務是否運行
check_service_running() {
  local port="$1"
  local service_name="$2"

  if ! lsof -ti:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    log_warning "$service_name 未運行"
    echo -e "啟動服務: ${CYAN}./scripts/cli.sh dev --${service_name}-only${NC}"
    return 1
  fi
  return 0
}

# 查看應用日誌（從 stdout/stderr）
view_app_logs() {
  local service_name="$1"
  local port="$2"

  print_header "$service_name 日誌"

  if ! check_service_running "$port" "$service_name"; then
    exit 1
  fi

  PID=$(lsof -ti:"$port" -sTCP:LISTEN | head -1)

  log_info "服務 PID: $PID"
  log_info "按 Ctrl+C 停止"
  echo ""

  if [ "$FOLLOW" = true ]; then
    # 持續追蹤
    tail -f /proc/$PID/fd/1 /proc/$PID/fd/2 2>/dev/null || {
      log_warning "無法直接追蹤進程日誌"
      echo ""
      log_info "建議："
      echo "  1. 在開發終端查看即時日誌"
      echo -e "  2. 或使用 ${CYAN}docker-compose logs -f${NC} 查看 Docker 服務"
    }
  else
    log_warning "應用日誌通常在啟動終端顯示"
    echo -e "請查看執行 ${CYAN}./scripts/cli.sh dev${NC} 或 ${CYAN}pnpm dev${NC} 的終端"
    echo ""
    echo "或查看 Docker 服務日誌:"
    echo -e "  ${CYAN}./scripts/cli.sh logs docker${NC}"
  fi
}

# 查看 Docker 日誌
view_docker_logs() {
  local container_name="$1"
  local display_name="${2:-$container_name}"

  # 用 array 構造命令避免 shell injection（LINES / SINCE 來自 user --lines / --since 旗標）
  local cmd_args=(docker logs)
  [ "$FOLLOW" = true ] && cmd_args+=(-f)
  cmd_args+=(--tail "$LINES")
  [ -n "$SINCE" ] && cmd_args+=(--since "$SINCE")
  cmd_args+=("$container_name")

  print_header "$display_name 日誌"
  log_info "執行: ${cmd_args[*]}"
  echo ""

  "${cmd_args[@]}" || {
    log_error "容器 $container_name 未運行"
    echo -e "啟動服務: ${CYAN}docker-compose --env-file .env.docker up -d${NC}"
    exit 1
  }
}

# 查看所有 Docker 日誌
view_all_docker_logs() {
  print_header "所有 Docker 服務日誌"

  # 用 array 構造命令避免 shell injection
  local cmd_args=(docker-compose --env-file .env.docker logs)
  [ "$FOLLOW" = true ] && cmd_args+=(-f)
  cmd_args+=(--tail "$LINES")
  [ -n "$SINCE" ] && cmd_args+=(--since "$SINCE")

  log_info "執行: ${cmd_args[*]}"
  echo ""

  "${cmd_args[@]}" || {
    log_error "Docker 服務未運行"
    echo -e "啟動服務: ${CYAN}docker-compose --env-file .env.docker up -d${NC}"
    exit 1
  }
}

# 查看所有日誌
view_all_logs() {
  print_header "所有服務日誌"

  log_warning "這將顯示所有 Docker 服務的日誌"
  log_info "按 Ctrl+C 停止"
  echo ""

  view_all_docker_logs
}

# 路由服務
case "$SERVICE" in
  frontend|front|fe|next)
    view_app_logs "frontend" 3000
    ;;
  backend|back|be|api|nest)
    view_app_logs "backend" 4000
    ;;
  storybook|sb)
    view_app_logs "storybook" 6006
    ;;
  docker|containers)
    view_all_docker_logs
    ;;
  postgres|postgresql|db|timescale|timescaledb)
    view_docker_logs "$(get_container_name timescaledb)" "PostgreSQL/TimescaleDB"
    ;;
  rabbitmq|rabbit|mq|queue)
    view_docker_logs "$(get_container_name rabbitmq)" "RabbitMQ"
    ;;
  redis|dragonfly|cache)
    view_docker_logs "$(get_container_name dragonfly)" "Dragonfly (Redis)"
    ;;
  mailpit|mail|smtp)
    view_docker_logs "$(get_container_name mailpit)" "Mailpit"
    ;;
  seaweedfs-master)
    view_docker_logs "$(get_container_name seaweedfs-master)" "SeaweedFS Master"
    ;;
  seaweedfs-volume)
    view_docker_logs "$(get_container_name seaweedfs-volume)" "SeaweedFS Volume"
    ;;
  seaweedfs-filer)
    view_docker_logs "$(get_container_name seaweedfs-filer)" "SeaweedFS Filer"
    ;;
  seaweedfs-s3)
    view_docker_logs "$(get_container_name seaweedfs-s3)" "SeaweedFS S3"
    ;;
  seaweedfs|weed)
    print_header "SeaweedFS 所有服務日誌"

    # 用 array 構造命令避免 shell injection
    cmd_args=(docker-compose --env-file .env.docker logs)
    [ "$FOLLOW" = true ] && cmd_args+=(-f)
    cmd_args+=(--tail "$LINES")
    [ -n "$SINCE" ] && cmd_args+=(--since "$SINCE")
    cmd_args+=(seaweedfs-master seaweedfs-volume seaweedfs-filer seaweedfs-s3)

    log_info "執行: ${cmd_args[*]}"
    echo ""

    "${cmd_args[@]}" || {
      log_error "SeaweedFS 服務未運行"
      echo -e "啟動服務: ${CYAN}./scripts/cli.sh storage start${NC}"
      exit 1
    }
    ;;
  all|everything)
    view_all_logs
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
