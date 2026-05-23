#!/bin/bash

# ==========================================
# MEAD CLI - storage 命令
# SeaweedFS 儲存服務管理
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 載入 .env.docker
if [[ -f "$PROJECT_ROOT/.env.docker" ]]; then
  set -a
  source "$PROJECT_ROOT/.env.docker"
  set +a
fi

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh storage${NC} - SeaweedFS 儲存服務管理\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  管理 SeaweedFS 分散式檔案儲存系統"
  echo "  提供本地 S3 相容 API 儲存解決方案"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh storage <command> [options]"
  echo ""
  echo -e "${YELLOW}命令:${NC}"
  echo "  start            啟動 SeaweedFS 服務"
  echo "  stop             停止 SeaweedFS 服務"
  echo "  restart          重啟 SeaweedFS 服務"
  echo "  status           查看服務狀態"
  echo "  logs [service]   查看日誌 (master/volume/filer/s3)"
  echo "  diagnose         診斷服務連接和健康狀態"
  echo "  info             顯示連接資訊和端口"
  echo "  reset            重置所有資料（危險！）"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  -f, --follow     持續輸出日誌（用於 logs 命令）"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh storage start         # 啟動 SeaweedFS"
  echo "  ./scripts/cli.sh storage status        # 查看狀態"
  echo "  ./scripts/cli.sh storage diagnose      # 健康檢查"
  echo "  ./scripts/cli.sh storage logs s3 -f    # 即時查看 S3 日誌"
  echo "  ./scripts/cli.sh storage info          # 查看連接資訊"
  echo ""
  echo -e "${YELLOW}SeaweedFS 架構:${NC}"
  echo "  Master  - 管理元資料和卷分配 (Port ${SEAWEEDFS_MASTER_PORT:-9333})"
  echo "  Volume  - 儲存實際檔案資料 (Port ${SEAWEEDFS_VOLUME_PORT:-8080})"
  echo "  Filer   - 提供檔案系統介面 (Port ${SEAWEEDFS_FILER_PORT:-8888})"
  echo "  S3      - S3 相容 API 端點 (Port ${SEAWEEDFS_S3_PORT:-8333})"
  echo ""
  echo -e "${YELLOW}小技巧:${NC}"
  echo "  - SeaweedFS 是選擇性服務，使用 Docker Compose profiles 管理"
  echo "  - 如果不需要本地 S3 儲存，可以不啟動此服務"
  echo "  - S3 端點: http://localhost:${SEAWEEDFS_S3_PORT:-8333}"
  if _is_insecure_s3_password; then
    echo -e "  - ${YELLOW}⚠ SEAWEEDFS_S3_PASSWORD 仍為預設／佔位值，請於 .env.docker 改為強密碼${NC}"
  else
    echo "  - 帳號設定：${SEAWEEDFS_S3_USER:-admin} / (密碼從 .env.docker 讀取)"
  fi
  echo ""
}

# 啟動 SeaweedFS
storage_start() {
  print_header "啟動 SeaweedFS 服務"

  cd "$PROJECT_ROOT"

  # 生成 SeaweedFS S3 設定（從 template 替換環境變數）
  local s3_template="$PROJECT_ROOT/infra/seaweedfs/s3.json.template"
  local s3_config="$PROJECT_ROOT/infra/seaweedfs/s3.json"
  if [[ -f "$s3_template" ]]; then
    envsubst '${SEAWEEDFS_S3_USER} ${SEAWEEDFS_S3_PASSWORD}' < "$s3_template" > "$s3_config"
    log_success "SeaweedFS S3 設定已生成"
  else
    log_error "找不到 SeaweedFS S3 設定範本: $s3_template"
    return 1
  fi

  log_step "啟動 SeaweedFS 容器 (使用 storage profile)..."
  if docker-compose --profile storage up -d seaweedfs-master seaweedfs-volume seaweedfs-filer seaweedfs-s3; then
    log_success "SeaweedFS 服務啟動中..."

    echo ""
    log_info "等待服務就緒..."
    sleep 3

    # 檢查服務狀態
    storage_status

    echo ""
    log_success "SeaweedFS 服務已啟動"
    echo ""
    echo -e "${YELLOW}S3 端點:${NC} http://localhost:${SEAWEEDFS_S3_PORT:-8333}"
    echo -e "${YELLOW}帳號:${NC} ${SEAWEEDFS_S3_USER:-admin}"
    if _is_insecure_s3_password; then
      echo -e "${YELLOW}密碼:${NC} ${RED}***INSECURE-DEFAULT***${NC} ${YELLOW}⚠ 仍為預設／佔位值，請在 .env.docker 改為強密碼後重啟${NC}"
    else
      echo -e "${YELLOW}密碼:${NC} ${SEAWEEDFS_S3_PASSWORD}"
    fi
  else
    log_error "SeaweedFS 啟動失敗"
    return 1
  fi
}

# 停止 SeaweedFS
storage_stop() {
  print_header "停止 SeaweedFS 服務"

  cd "$PROJECT_ROOT"

  log_step "停止 SeaweedFS 容器..."
  if docker-compose stop seaweedfs-s3 seaweedfs-filer seaweedfs-volume seaweedfs-master; then
    log_success "SeaweedFS 服務已停止"
  else
    log_error "SeaweedFS 停止失敗"
    return 1
  fi
}

# 重啟 SeaweedFS
storage_restart() {
  print_header "重啟 SeaweedFS 服務"

  storage_stop
  echo ""
  sleep 2
  storage_start
}

# 查看狀態
storage_status() {
  local services=("seaweedfs-master" "seaweedfs-volume" "seaweedfs-filer" "seaweedfs-s3")
  local names=("Master" "Volume" "Filer" "S3")
  local running=0
  local total=4

  for i in "${!services[@]}"; do
    local container=$(get_container_name "${services[$i]}")

    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
      local status=$(docker inspect --format='{{.State.Status}}' "$container")
      # 先檢查是否有健康檢查配置
      local has_healthcheck=$(docker inspect --format='{{if .State.Health}}true{{else}}false{{end}}' "$container")
      local health="none"

      if [[ "$has_healthcheck" == "true" ]]; then
        health=$(docker inspect --format='{{.State.Health.Status}}' "$container")
      fi

      if [[ "$status" == "running" ]]; then
        if [[ "$health" == "healthy" ]] || [[ "$health" == "none" ]]; then
          echo -e "  ${GREEN}✓${NC} ${names[$i]} ${DIM}($container)${NC} ${GREEN}運行中${NC}"
          ((running++))
        else
          echo -e "  ${YELLOW}⚠${NC} ${names[$i]} ${DIM}($container)${NC} ${YELLOW}Health: $health${NC}"
        fi
      else
        echo -e "  ${YELLOW}⚠${NC} ${names[$i]} ${DIM}($container)${NC} ${YELLOW}狀態: $status${NC}"
      fi
    else
      echo -e "  ${RED}✗${NC} ${names[$i]} ${DIM}($container)${NC} ${RED}未運行${NC}"
    fi
  done

  echo ""
  if [[ $running -eq $total ]]; then
    log_success "所有 SeaweedFS 服務正常運行 ($running/$total)"
  elif [[ $running -eq 0 ]]; then
    log_error "所有 SeaweedFS 服務未運行 ($running/$total)"
    echo -e "${DIM}啟動: ${CYAN}./scripts/cli.sh storage start${NC}"
  else
    log_warning "部分 SeaweedFS 服務運行中 ($running/$total)"
  fi
}

# 查看日誌
storage_logs() {
  local service="${1:-all}"
  local follow_flag="${2:-}"

  cd "$PROJECT_ROOT"

  local container=""
  case "$service" in
    master)
      container=$(get_container_name seaweedfs-master)
      ;;
    volume)
      container=$(get_container_name seaweedfs-volume)
      ;;
    filer)
      container=$(get_container_name seaweedfs-filer)
      ;;
    s3)
      container=$(get_container_name seaweedfs-s3)
      ;;
    all)
      print_header "SeaweedFS 所有服務日誌"
      if [[ "$follow_flag" == "-f" ]]; then
        docker-compose logs -f seaweedfs-master seaweedfs-volume seaweedfs-filer seaweedfs-s3
      else
        docker-compose logs --tail=100 seaweedfs-master seaweedfs-volume seaweedfs-filer seaweedfs-s3
      fi
      return 0
      ;;
    *)
      log_error "未知的服務: $service"
      echo "可用服務: master, volume, filer, s3, all"
      return 1
      ;;
  esac

  print_header "SeaweedFS $service 日誌"
  if [[ "$follow_flag" == "-f" ]]; then
    docker logs -f "$container"
  else
    docker logs --tail=100 "$container"
  fi
}

# 診斷服務
storage_diagnose() {
  print_header "SeaweedFS 服務診斷"

  local all_healthy=true

  # 檢查服務是否運行
  echo -e "${YELLOW}1. 檢查服務狀態${NC}"
  echo ""
  storage_status
  echo ""

  # 先確認自己 repo 的 SeaweedFS containers 全部在跑，否則跳過 port / HTTP 檢查。
  # 否則別 repo（例如 meadc）的 SeaweedFS 在 forward 同樣 port 會被當成自己的服務 ✓。
  local self_running=true
  for svc in seaweedfs-master seaweedfs-volume seaweedfs-filer seaweedfs-s3; do
    local cn
    cn=$(get_container_name "$svc")
    if ! docker ps --format '{{.Names}}' | grep -q "^${cn}$"; then
      self_running=false
      break
    fi
  done

  if [[ "$self_running" != true ]]; then
    echo ""
    log_error "本 repo 的 SeaweedFS containers 沒有全部運行，跳過 port / HTTP 檢查"
    log_info "若 port 上看到別 repo 的 forward，會被誤判為 ✓ — 已避免"
    echo ""
    echo -e "${YELLOW}建議操作:${NC}"
    echo -e "  1. 啟動服務: ${CYAN}./scripts/cli.sh storage start${NC}"
    echo -e "  2. 查看日誌: ${CYAN}./scripts/cli.sh storage logs all${NC}"
    return 1
  fi

  # 檢查端口
  echo -e "${YELLOW}2. 檢查端口連接${NC}"
  echo ""

  local ports=(
    "${SEAWEEDFS_MASTER_PORT:-9333}:Master HTTP"
    "${SEAWEEDFS_VOLUME_PORT:-8080}:Volume HTTP"
    "${SEAWEEDFS_FILER_PORT:-8888}:Filer HTTP"
    "${SEAWEEDFS_S3_PORT:-8333}:S3 API"
  )

  for port_info in "${ports[@]}"; do
    local port="${port_info%%:*}"
    local name="${port_info##*:}"

    if lsof -ti:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      log_success "$name (Port $port) 可連接"
    else
      log_error "$name (Port $port) 無法連接"
      all_healthy=false
    fi
  done

  echo ""

  # 檢查 HTTP 端點
  echo -e "${YELLOW}3. 檢查 HTTP 端點${NC}"
  echo ""

  # Master 狀態
  if curl -sf "http://localhost:${SEAWEEDFS_MASTER_PORT:-9333}/cluster/status" >/dev/null 2>&1; then
    log_success "Master API 可訪問"
  else
    log_error "Master API 無法訪問"
    all_healthy=false
  fi

  # Volume 狀態
  if curl -sf "http://localhost:${SEAWEEDFS_VOLUME_PORT:-8080}/status" >/dev/null 2>&1; then
    log_success "Volume API 可訪問"
  else
    log_error "Volume API 無法訪問"
    all_healthy=false
  fi

  # Filer 狀態
  if curl -sf "http://localhost:${SEAWEEDFS_FILER_PORT:-8888}/" >/dev/null 2>&1; then
    log_success "Filer API 可訪問"
  else
    log_error "Filer API 無法訪問"
    all_healthy=false
  fi

  # S3 端點（需要 AWS 簽名認證，跳過 HTTP 檢查）
  log_info "S3 API 需要認證（端口連接已確認）"

  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  if [[ "$all_healthy" == true ]]; then
    log_success "SeaweedFS 服務健康檢查通過 ✓"
  else
    log_error "SeaweedFS 服務健康檢查失敗 ✗"
    echo ""
    echo -e "${YELLOW}建議操作:${NC}"
    echo -e "  1. 查看日誌: ${CYAN}./scripts/cli.sh storage logs all${NC}"
    echo -e "  2. 重啟服務: ${CYAN}./scripts/cli.sh storage restart${NC}"
    echo -e "  3. 完整診斷: ${CYAN}./scripts/cli.sh doctor${NC}"
    return 1
  fi
}

# 顯示連接資訊
storage_info() {
  print_header "SeaweedFS 連接資訊"

  echo -e "${YELLOW}🔌 服務端點${NC}"
  echo ""
  echo -e "  ${CYAN}Master HTTP:${NC}  http://localhost:${SEAWEEDFS_MASTER_PORT:-9333}"
  echo -e "  ${CYAN}Master gRPC:${NC}  localhost:${SEAWEEDFS_MASTER_GRPC_PORT:-19333}"
  echo ""
  echo -e "  ${CYAN}Volume HTTP:${NC}  http://localhost:${SEAWEEDFS_VOLUME_PORT:-8080}"
  echo -e "  ${CYAN}Volume gRPC:${NC}  localhost:${SEAWEEDFS_VOLUME_GRPC_PORT:-18080}"
  echo ""
  echo -e "  ${CYAN}Filer HTTP:${NC}   http://localhost:${SEAWEEDFS_FILER_PORT:-8888}"
  echo -e "  ${CYAN}Filer gRPC:${NC}   localhost:${SEAWEEDFS_FILER_GRPC_PORT:-18888}"
  echo ""
  echo -e "  ${CYAN}S3 API:${NC}       http://localhost:${SEAWEEDFS_S3_PORT:-8333}"
  echo ""

  echo -e "${YELLOW}🔐 S3 認證資訊${NC}"
  echo ""
  echo -e "  ${CYAN}Access Key:${NC}  ${SEAWEEDFS_S3_USER:-admin}"
  if _is_insecure_s3_password; then
    echo -e "  ${CYAN}Secret Key:${NC}  ${RED}***INSECURE-DEFAULT***${NC} ${YELLOW}⚠ 仍為預設／佔位值，請改 .env.docker SEAWEEDFS_S3_PASSWORD${NC}"
  else
    echo -e "  ${CYAN}Secret Key:${NC}  ${SEAWEEDFS_S3_PASSWORD}"
  fi
  echo -e "  ${CYAN}Region:${NC}      us-east-1 (預設)"
  echo ""

  echo -e "${YELLOW}📊 管理介面${NC}"
  echo ""
  echo -e "  ${CYAN}Master UI:${NC}   http://localhost:${SEAWEEDFS_MASTER_PORT:-9333}"
  echo -e "  ${CYAN}Filer UI:${NC}    http://localhost:${SEAWEEDFS_FILER_PORT:-8888}"
  echo ""

  echo -e "${YELLOW}💡 使用範例 (AWS CLI)${NC}"
  echo ""
  echo -e "  ${DIM}# 配置 AWS CLI${NC}"
  echo -e "  aws configure set aws_access_key_id ${SEAWEEDFS_S3_USER:-admin}"
  if _is_insecure_s3_password; then
    echo -e "  aws configure set aws_secret_access_key ${RED}<請先設 SEAWEEDFS_S3_PASSWORD>${NC}"
  else
    echo -e "  aws configure set aws_secret_access_key ${SEAWEEDFS_S3_PASSWORD}"
  fi
  echo ""
  echo -e "  ${DIM}# 列出 buckets${NC}"
  echo -e "  aws --endpoint-url http://localhost:${SEAWEEDFS_S3_PORT:-8333} s3 ls"
  echo ""
  echo -e "  ${DIM}# 創建 bucket${NC}"
  echo -e "  aws --endpoint-url http://localhost:${SEAWEEDFS_S3_PORT:-8333} s3 mb s3://my-bucket"
  echo ""
}

# 重置資料
storage_reset() {
  print_header "重置 SeaweedFS 資料"

  log_warning "此操作將刪除所有 SeaweedFS 儲存的資料！"
  echo ""

  if ! confirm "確定要重置 SeaweedFS 資料？" "n"; then
    log_info "已取消"
    return 0
  fi

  echo ""
  log_step "停止 SeaweedFS 服務..."
  storage_stop

  echo ""
  log_step "刪除 SeaweedFS 資料卷..."
  cd "$PROJECT_ROOT"

  docker volume rm -f \
    mead_seaweedfs-master-data \
    mead_seaweedfs-volume-data \
    mead_seaweedfs-filer-data \
    2>/dev/null || true

  log_success "SeaweedFS 資料已清除"

  echo ""
  if confirm "是否重新啟動 SeaweedFS？" "y"; then
    echo ""
    storage_start
  fi
}

# 主程式
if [[ $# -eq 0 ]]; then
  show_command_help
  exit 0
fi

COMMAND="$1"
shift

case "$COMMAND" in
  start)
    storage_start "$@"
    ;;
  stop)
    storage_stop "$@"
    ;;
  restart)
    storage_restart "$@"
    ;;
  status)
    print_header "SeaweedFS 服務狀態"
    echo ""
    storage_status "$@"
    ;;
  logs)
    storage_logs "$@"
    ;;
  diagnose)
    storage_diagnose "$@"
    ;;
  info)
    storage_info "$@"
    ;;
  reset)
    storage_reset "$@"
    ;;
  -h|--help)
    show_command_help
    ;;
  *)
    log_error "未知的命令: $COMMAND"
    echo ""
    show_command_help
    exit 1
    ;;
esac
