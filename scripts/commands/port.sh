#!/bin/bash

# ==========================================
# NPT CLI - port 命令
# Port 管理工具
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 服務使用的 Port（平行陣列，相容 bash 3.x）
# 按 Port 號碼由小到大排序
PROJECT_PORTS=(1025 3000 4000 5432 5555 5672 6006 6379 8025 8080 8333 8888 9333 15672 18080 18888 19333)
PORT_NAMES=("Mailpit (SMTP)" "Frontend (Next.js)" "Backend (NestJS)" "PostgreSQL/TimescaleDB" "Prisma Studio" "RabbitMQ (AMQP)" "Storybook" "Dragonfly (Redis)" "Mailpit (Web UI)" "SeaweedFS Volume" "SeaweedFS S3" "SeaweedFS Filer" "SeaweedFS Master" "RabbitMQ Management" "SeaweedFS Volume gRPC" "SeaweedFS Filer gRPC" "SeaweedFS Master gRPC")

# 根據索引取得服務名稱
get_service_name() {
  local port="$1"
  local i
  for i in "${!PROJECT_PORTS[@]}"; do
    if [ "${PROJECT_PORTS[$i]}" = "$port" ]; then
      echo "${PORT_NAMES[$i]}"
      return
    fi
  done
  echo "Unknown"
}

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh port${NC} - Port 管理工具\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  查看、釋放服務的 Port，掃描 Port 衝突"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh port <subcommand> [options]"
  echo ""
  echo -e "${YELLOW}子命令:${NC}"
  echo -e "  ${CYAN}status${NC}            查看所有服務的 Port 狀態"
  echo -e "  ${CYAN}free <port>${NC}       釋放指定 Port"
  echo -e "  ${CYAN}free-all${NC}          釋放所有服務的 Port"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh port status       # 查看所有 Port 狀態"
  echo "  ./scripts/cli.sh port free 3000    # 釋放 Port 3000"
  echo "  ./scripts/cli.sh port free-all     # 釋放所有服務的 Port"
  echo ""
}

# 取得 Port 資訊
get_port_info() {
  local port="$1"
  lsof -i:"$port" -sTCP:LISTEN -P -n 2>/dev/null | tail -n +2 || true
}

# 查看所有的 Port 狀態
port_status() {
  print_header "服務 Port 狀態"

  printf "  ${CYAN}%-7s${NC} %-25s %-10s %-8s %s\n" "Port" "服務" "狀態" "PID" "程序"
  echo -e "  ${DIM}──────────────────────────────────────────────────────────────${NC}"

  local total_ports=${#PROJECT_PORTS[@]}
  local occupied=0
  local available=0
  local conflicts=()

  for port in "${PROJECT_PORTS[@]}"; do
    local service
    service=$(get_service_name "$port")
    local info
    info=$(get_port_info "$port")

    if [ -n "$info" ]; then
      local pid
      pid=$(echo "$info" | awk '{print $2}' | head -1)
      local cmd
      cmd=$(echo "$info" | awk '{print $1}' | head -1)
      printf "  ${YELLOW}%-7s${NC} %-25s ${RED}%-10s${NC} %-8s %s\n" "$port" "$service" "佔用中" "$pid" "$cmd"
      occupied=$((occupied + 1))
      conflicts+=("$port|$service|$cmd|$pid")
    else
      printf "  ${YELLOW}%-7s${NC} %-25s ${GREEN}%-10s${NC} %-8s %s\n" "$port" "$service" "可用" "-" "-"
      available=$((available + 1))
    fi
  done

  echo ""
  echo -e "${YELLOW}統計：${NC}"
  echo -e "  總 Port 數：${CYAN}$total_ports${NC}"
  echo -e "  佔用中：${RED}$occupied${NC}"
  echo -e "  可用：${GREEN}$available${NC}"
  echo ""

  if [ "$occupied" -gt 0 ]; then
    log_warning "發現 $occupied 個 Port 被佔用："
    for conflict in "${conflicts[@]}"; do
      IFS='|' read -r port service cmd pid <<< "$conflict"
      echo -e "  ${RED}•${NC} Port ${YELLOW}$port${NC} ($service) 被 ${CYAN}$cmd${NC} (PID: $pid) 佔用"
    done
    echo ""
    echo -e "${YELLOW}💡 解決方案：${NC}"
    echo -e "  使用 ${CYAN}./scripts/cli.sh port free <port>${NC} 釋放指定 Port"
    echo -e "  使用 ${CYAN}./scripts/cli.sh port free-all${NC} 釋放所有 Port"
  else
    log_success "所有服務 Port 皆可用，沒有衝突"
  fi
  echo ""
}

# 釋放指定 Port
port_free() {
  local port="$1"

  if [ -z "$port" ]; then
    log_error "請指定 Port 號碼"
    echo -e "  用法: ./scripts/cli.sh port free <port>"
    exit 1
  fi

  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)

  if [ -z "$pids" ]; then
    log_info "Port $port 目前沒有被佔用"
    return
  fi

  local cmd
  cmd=$(lsof -i:"$port" -sTCP:LISTEN -P -n 2>/dev/null | tail -n +2 | awk '{print $1}' | head -1)
  log_info "終止 Port $port 的進程 (PID: $pids, 程序: ${cmd:-unknown})"

  echo "$pids" | xargs kill 2>/dev/null || true
  sleep 1

  if lsof -ti:"$port" >/dev/null 2>&1; then
    log_warning "進程未正常終止，使用強制終止"
    lsof -ti:"$port" 2>/dev/null | xargs kill -9 2>/dev/null || true
  fi

  log_success "Port $port 已釋放"
}

# 釋放所有服務 Port
port_free_all() {
  print_header "釋放所有服務 Port"

  local freed=0

  for port in "${PROJECT_PORTS[@]}"; do
    local pids
    pids=$(lsof -ti:"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      local service
    service=$(get_service_name "$port")
      log_info "終止 $service (Port $port, PID: $pids)"
      echo "$pids" | xargs kill 2>/dev/null || true
      freed=$((freed + 1))
    fi
  done

  if [ "$freed" -eq 0 ]; then
    log_info "沒有需要釋放的 Port"
    return
  fi

  sleep 1

  # 檢查是否還有未終止的進程
  for port in "${PROJECT_PORTS[@]}"; do
    if lsof -ti:"$port" >/dev/null 2>&1; then
      log_warning "Port $port 未正常終止，強制終止"
      lsof -ti:"$port" 2>/dev/null | xargs kill -9 2>/dev/null || true
    fi
  done

  echo ""
  log_success "已釋放 $freed 個 Port"
}

# 互動式子選單
show_port_menu() {
  echo -e ""
  echo -e "${YELLOW}Port 管理:${NC}"
  echo -e "  ${CYAN}1${NC}) 查看所有 Port 狀態"
  echo -e "  ${CYAN}2${NC}) 釋放指定 Port"
  echo -e "  ${CYAN}3${NC}) 釋放所有服務 Port"
  echo -ne "${GREEN}請選擇 [1-3]:${NC} "
  read -r port_choice

  case "$port_choice" in
    1) port_status ;;
    2)
      echo -ne "請輸入 Port 號碼: "
      read -r port_num
      port_free "$port_num"
      ;;
    3) port_free_all ;;
    *)
      echo -e "${RED}無效選擇${NC}"
      exit 1
      ;;
  esac
}

# 主入口
SUBCOMMAND="${1:-}"

case "$SUBCOMMAND" in
  status)
    port_status
    ;;
  free)
    port_free "${2:-}"
    ;;
  free-all)
    port_free_all
    ;;
  -h|--help)
    show_command_help
    ;;
  "")
    show_port_menu
    ;;
  *)
    log_error "未知的子命令: $SUBCOMMAND"
    show_command_help
    exit 1
    ;;
esac
