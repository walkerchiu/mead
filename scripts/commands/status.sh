#!/bin/bash

# ==========================================
# NPT CLI - status 命令
# 查看所有服務狀態
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh status${NC} - 查看服務狀態\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  一目了然查看所有服務的運行狀態、資源使用情況"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh status [options]"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  --health         完整健康檢查（包含連線測試）"
  echo "  --json           JSON 格式輸出"
  echo "  --watch          持續監控模式（每 2 秒更新）"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh status              # 快速查看狀態"
  echo "  ./scripts/cli.sh status --health     # 完整健康檢查"
  echo "  ./scripts/cli.sh status --watch      # 持續監控"
  echo "  ./scripts/cli.sh status --json       # JSON 輸出供其他工具使用"
  echo ""
  echo -e "${YELLOW}顯示內容:${NC}"
  echo "  ✅ 運行中的服務 (綠色)"
  echo "  ⚠️  部分服務有問題 (黃色)"
  echo "  ❌ 停止的服務 (紅色)"
  echo "  📊 資源使用情況 (CPU、記憶體)"
  echo ""
  echo -e "${YELLOW}小技巧:${NC}"
  echo "  - 開發前先跑一次快速確認環境"
  echo -e "  - 需要深度檢查加 ${CYAN}--health${NC} 選項（測試服務連線）"
  echo -e "  - 全面診斷開發環境用 ${CYAN}./scripts/cli.sh doctor${NC}"
  echo -e "  - 服務異常時用 ${CYAN}./scripts/cli.sh doctor --fix${NC} 修復"
  echo -e "  - 想看詳細日誌用 ${CYAN}./scripts/cli.sh logs <service>${NC}"
  echo ""
}

# 檢查服務是否運行（通過 port）
check_service() {
  local name="$1"
  local port="$2"
  local url="${3:-}"

  if lsof -ti:$port >/dev/null 2>&1; then
    PID=$(lsof -ti:$port | head -1)

    # 獲取資源使用（macOS 和 Linux 兼容）
    if [[ "$OSTYPE" == "darwin"* ]]; then
      CPU=$(ps -p $PID -o %cpu= | tr -d ' ' || echo "0")
      MEM=$(ps -p $PID -o rss= | awk '{printf "%.0f", $1/1024}' || echo "0")
    else
      CPU=$(ps -p $PID -o %cpu= --no-headers | tr -d ' ' || echo "0")
      MEM=$(ps -p $PID -o rss= --no-headers | awk '{printf "%.0f", $1/1024}' || echo "0")
    fi

    # 如果提供了 URL，測試連線
    if [[ -n "$url" ]] && [[ "$HEALTH_CHECK" == "true" ]]; then
      local is_healthy=false

      # GraphQL 端點需要 POST 請求
      if [[ "$url" == *"/graphql"* ]]; then
        if curl -sf -X POST "$url" -H "Content-Type: application/json" -d '{"query":"{ __typename }"}' >/dev/null 2>&1; then
          is_healthy=true
        fi
      else
        # 其他端點使用 GET 請求
        if curl -sf "$url" >/dev/null 2>&1; then
          is_healthy=true
        fi
      fi

      if [[ "$is_healthy" == "true" ]]; then
        echo -e "  ${GREEN}✓${NC} ${name} ${DIM}(Port $port, PID $PID)${NC} ${GREEN}運行中${NC}"
      else
        echo -e "  ${YELLOW}⚠${NC} ${name} ${DIM}(Port $port, PID $PID)${NC} ${YELLOW}無法連線${NC}"
      fi
    else
      echo -e "  ${GREEN}✓${NC} ${name} ${DIM}(Port $port, PID $PID)${NC}"
    fi

    echo -e "      ${DIM}CPU: ${CPU}% | 記憶體: ${MEM}MB${NC}"
    return 0
  else
    echo -e "  ${RED}✗${NC} ${name} ${DIM}(Port $port)${NC} ${RED}未運行${NC}"
    local service_name_lower=$(echo "$name" | tr '[:upper:]' '[:lower:]')
    echo -e "      ${DIM}啟動: ${CYAN}./scripts/cli.sh dev${NC}"
    return 1
  fi
}

# 檢查 Docker 服務
check_docker_service() {
  local name="$1"
  local container="$2"
  local is_storage="${3:-false}"

  if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
    # 獲取容器狀態
    STATUS=$(docker inspect --format='{{.State.Status}}' "$container")

    # 先檢查是否有健康檢查配置
    HAS_HEALTHCHECK=$(docker inspect --format='{{if .State.Health}}true{{else}}false{{end}}' "$container")
    HEALTH="none"

    if [[ "$HAS_HEALTHCHECK" == "true" ]]; then
      HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$container")
    fi

    # 獲取資源使用
    STATS=$(docker stats --no-stream --format "{{.CPUPerc}},{{.MemUsage}}" "$container" 2>/dev/null || echo "0%,0B / 0B")
    CPU=$(echo "$STATS" | cut -d',' -f1)
    MEM=$(echo "$STATS" | cut -d',' -f2 | awk '{print $1}')

    if [[ "$STATUS" == "running" ]]; then
      if [[ "$HEALTH" == "healthy" ]] || [[ "$HEALTH" == "none" ]]; then
        echo -e "  ${GREEN}✓${NC} ${name} ${DIM}(容器: $container)${NC} ${GREEN}運行中${NC}"
      else
        echo -e "  ${YELLOW}⚠${NC} ${name} ${DIM}(容器: $container)${NC} ${YELLOW}狀態: $HEALTH${NC}"
      fi
      echo -e "      ${DIM}CPU: ${CPU} | 記憶體: ${MEM}${NC}"
      return 0
    else
      echo -e "  ${YELLOW}⚠${NC} ${name} ${DIM}(容器: $container)${NC} ${YELLOW}狀態: $STATUS${NC}"
      return 1
    fi
  else
    echo -e "  ${RED}✗${NC} ${name} ${DIM}(容器: $container)${NC} ${RED}未運行${NC}"
    if [[ "$is_storage" == "true" ]]; then
      echo -e "      ${DIM}啟動: ${CYAN}./scripts/cli.sh storage start${NC}"
    else
      echo -e "      ${DIM}啟動: ${CYAN}docker-compose up -d${NC}"
    fi
    return 1
  fi
}

# 顯示總結
show_summary() {
  local total=$1
  local running=$2

  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  if [[ $running -eq $total ]]; then
    echo -e "${GREEN}✓ 所有服務正常運行 ($running/$total)${NC}"
    echo ""
    echo -e "💡 開始開發: ${CYAN}./scripts/cli.sh dev${NC}"
  elif [[ $running -eq 0 ]]; then
    echo -e "${RED}✗ 所有服務都未運行 ($running/$total)${NC}"
    echo ""
    echo -e "💡 啟動服務: ${CYAN}./scripts/cli.sh init${NC} 或 ${CYAN}./scripts/cli.sh dev${NC}"
  else
    echo -e "${YELLOW}⚠ 部分服務運行中 ($running/$total)${NC}"
    echo ""
    echo -e "💡 診斷問題: ${CYAN}./scripts/cli.sh doctor${NC}"
  fi

  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 解析參數
HEALTH_CHECK=false
JSON_OUTPUT=false
WATCH_MODE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --health)
      HEALTH_CHECK=true
      shift
      ;;
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --watch)
      WATCH_MODE=true
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

# 監控模式
if [[ "$WATCH_MODE" == "true" ]]; then
  print_header "持續監控模式（按 Ctrl+C 停止）"

  while true; do
    clear
    echo -e "${GREEN}NPT 服務狀態監控${NC} - $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    # 執行檢查（不使用 print_header 避免清屏）
    TOTAL=0
    RUNNING=0

    echo -e "${YELLOW}📦 應用服務${NC}"
    check_service "Frontend" 3000 "http://localhost:3000" && ((RUNNING++)) || true
    ((TOTAL++))
    check_service "Backend" 4000 "http://localhost:4000/graphql" && ((RUNNING++)) || true
    ((TOTAL++))
    check_service "Storybook" 6006 "http://localhost:6006" && ((RUNNING++)) || true
    ((TOTAL++))
    check_service "Prisma Studio" 5555 "http://localhost:5555" && ((RUNNING++)) || true
    ((TOTAL++))
    echo ""

    echo -e "${YELLOW}🐳 Docker 服務${NC}"
    check_docker_service "PostgreSQL" "$(get_container_name timescaledb)" && ((RUNNING++)) || true
    ((TOTAL++))
    check_docker_service "RabbitMQ" "$(get_container_name rabbitmq)" && ((RUNNING++)) || true
    ((TOTAL++))
    check_docker_service "Dragonfly" "$(get_container_name dragonfly)" && ((RUNNING++)) || true
    ((TOTAL++))
    check_docker_service "Mailpit" "$(get_container_name mailpit)" && ((RUNNING++)) || true
    ((TOTAL++))
    check_docker_service "SeaweedFS Master" "$(get_container_name seaweedfs-master)" true && ((RUNNING++)) || true
    ((TOTAL++))
    check_docker_service "SeaweedFS Volume" "$(get_container_name seaweedfs-volume)" true && ((RUNNING++)) || true
    ((TOTAL++))
    check_docker_service "SeaweedFS Filer" "$(get_container_name seaweedfs-filer)" true && ((RUNNING++)) || true
    ((TOTAL++))
    check_docker_service "SeaweedFS S3" "$(get_container_name seaweedfs-s3)" true && ((RUNNING++)) || true
    ((TOTAL++))

    show_summary $TOTAL $RUNNING

    sleep 2
  done
  exit 0
fi

# 一般模式
cd "$PROJECT_ROOT"

if [[ "$HEALTH_CHECK" == "true" ]]; then
  print_header "服務健康檢查"
else
  print_header "服務狀態"
fi

TOTAL=0
RUNNING=0

echo -e "${YELLOW}📦 應用服務${NC}"
check_service "Frontend" 3000 "http://localhost:3000" && ((RUNNING++)) || true
((TOTAL++))
check_service "Backend" 4000 "http://localhost:4000/graphql" && ((RUNNING++)) || true
((TOTAL++))
check_service "Storybook" 6006 "http://localhost:6006" && ((RUNNING++)) || true
((TOTAL++))
check_service "Prisma Studio" 5555 "http://localhost:5555" && ((RUNNING++)) || true
((TOTAL++))
echo ""

echo -e "${YELLOW}🐳 Docker 服務${NC}"
check_docker_service "PostgreSQL" "$(get_container_name timescaledb)" && ((RUNNING++)) || true
((TOTAL++))
check_docker_service "RabbitMQ" "$(get_container_name rabbitmq)" && ((RUNNING++)) || true
((TOTAL++))
check_docker_service "Dragonfly" "$(get_container_name dragonfly)" && ((RUNNING++)) || true
((TOTAL++))
check_docker_service "Mailpit" "$(get_container_name mailpit)" && ((RUNNING++)) || true
((TOTAL++))
check_docker_service "SeaweedFS Master" "$(get_container_name seaweedfs-master)" true && ((RUNNING++)) || true
((TOTAL++))
check_docker_service "SeaweedFS Volume" "$(get_container_name seaweedfs-volume)" true && ((RUNNING++)) || true
((TOTAL++))
check_docker_service "SeaweedFS Filer" "$(get_container_name seaweedfs-filer)" true && ((RUNNING++)) || true
((TOTAL++))
check_docker_service "SeaweedFS S3" "$(get_container_name seaweedfs-s3)" true && ((RUNNING++)) || true
((TOTAL++))

show_summary $TOTAL $RUNNING

# 顯示 SeaweedFS 連接資訊（如果有運行）
if docker ps --format '{{.Names}}' | grep -q 'seaweedfs' 2>/dev/null; then
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}🔌 SeaweedFS 連接資訊${NC}"
  echo ""
  echo -e "  ${CYAN}S3 端點:${NC}      http://localhost:${SEAWEEDFS_S3_PORT:-8333}"
  echo -e "  ${CYAN}Access Key:${NC}   ${SEAWEEDFS_S3_USER:-admin}"
  echo -e "  ${CYAN}Secret Key:${NC}   ${SEAWEEDFS_S3_PASSWORD:-admin123}"
  echo ""
  echo -e "  ${CYAN}Master UI:${NC}    http://localhost:${SEAWEEDFS_MASTER_PORT:-9333}"
  echo -e "  ${CYAN}Filer UI:${NC}     http://localhost:${SEAWEEDFS_FILER_PORT:-8888}"
  echo ""
  echo -e "  ${DIM}詳細資訊: ${CYAN}./scripts/cli.sh storage info${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

# JSON 輸出模式
if [[ "$JSON_OUTPUT" == "true" ]]; then
  echo ""
  echo '{"total":'$TOTAL',"running":'$RUNNING',"status":"'$([ $RUNNING -eq $TOTAL ] && echo "healthy" || echo "degraded")'"}'
fi
