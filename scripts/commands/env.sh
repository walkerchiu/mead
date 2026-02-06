#!/bin/bash

# ==========================================
# Starter CLI - env 命令
# 環境切換工具
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 支援的環境
ENVS=("local" "dev" "uat" "prod")
ENV_LABELS=("Local (本地環境)" "Dev (開發環境)" "UAT (測試環境)" "Production (生產環境)")
ENV_NODE_ENVS=("development" "development" "uat" "production")

# 環境範本對應
# Docker env files
ENV_DOCKER_TEMPLATES=(".env.docker.example" ".env.docker.dev.example" ".env.docker.uat.example" ".env.docker.production.example")
# Backend env files
ENV_BACKEND_TEMPLATES=(".env.example" ".env.dev.example" ".env.uat.example" ".env.production.example")
# Frontend env files
ENV_FRONTEND_TEMPLATES=(".env.example" ".env.dev.example" ".env.uat.example" ".env.production.example")

CURRENT_ENV_FILE="$PROJECT_ROOT/.current-env"

# 取得當前環境
get_current_env() {
  if [[ -f "$CURRENT_ENV_FILE" ]]; then
    cat "$CURRENT_ENV_FILE"
  else
    echo "local"
  fi
}

# 取得環境索引
get_env_index() {
  local env="$1"
  local i
  for i in "${!ENVS[@]}"; do
    if [[ "${ENVS[$i]}" == "$env" ]]; then
      echo "$i"
      return 0
    fi
  done
  return 1
}

# 驗證環境名稱
validate_env() {
  local env="$1"
  local i
  for i in "${ENVS[@]}"; do
    if [[ "$i" == "$env" ]]; then
      return 0
    fi
  done
  return 1
}

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh env${NC} - 環境切換工具\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  切換開發/測試/生產環境，管理環境變數檔案"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh env <subcommand> [options]"
  echo ""
  echo -e "${YELLOW}子命令:${NC}"
  echo -e "  ${CYAN}switch <env>${NC}      切換到指定環境（local/dev/uat/prod）"
  echo -e "  ${CYAN}current${NC}           顯示當前環境"
  echo -e "  ${CYAN}list${NC}              列出所有可用環境及狀態"
  echo -e "  ${CYAN}diff <env>${NC}        比較當前環境與目標環境的差異"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh env current        # 顯示當前環境"
  echo "  ./scripts/cli.sh env list           # 列出所有環境"
  echo "  ./scripts/cli.sh env switch local   # 切換到 local"
  echo "  ./scripts/cli.sh env switch uat     # 切換到 uat"
  echo "  ./scripts/cli.sh env diff prod      # 比較差異"
  echo ""
}

# 顯示當前環境
env_current() {
  local current
  current=$(get_current_env)
  local idx
  idx=$(get_env_index "$current") || idx=0
  local label="${ENV_LABELS[$idx]}"
  local node_env="${ENV_NODE_ENVS[$idx]}"

  echo -e ""
  echo -e "  ${CYAN}當前環境:${NC} ${GREEN}${current}${NC} — ${label}"
  echo -e "  ${CYAN}NODE_ENV:${NC} ${node_env}"
  echo -e ""
}

# 列出所有環境
env_list() {
  print_header "可用環境"

  local current
  current=$(get_current_env)

  printf "  ${CYAN}%-10s${NC} %-25s %-15s %s\n" "環境" "說明" "NODE_ENV" "狀態"
  echo -e "  ${DIM}──────────────────────────────────────────────────────────────${NC}"

  local i
  for i in "${!ENVS[@]}"; do
    local env="${ENVS[$i]}"
    local label="${ENV_LABELS[$i]}"
    local node_env="${ENV_NODE_ENVS[$i]}"
    local status

    if [[ "$env" == "$current" ]]; then
      status="${GREEN}● 使用中${NC}"
    else
      # 檢查範本檔案是否存在
      local docker_tpl="$PROJECT_ROOT/${ENV_DOCKER_TEMPLATES[$i]}"
      local backend_tpl="$PROJECT_ROOT/apps/backend/${ENV_BACKEND_TEMPLATES[$i]}"
      local frontend_tpl="$PROJECT_ROOT/apps/frontend/${ENV_FRONTEND_TEMPLATES[$i]}"

      if [[ -f "$docker_tpl" ]] && [[ -f "$backend_tpl" ]] && [[ -f "$frontend_tpl" ]]; then
        status="${DIM}○ 可用${NC}"
      else
        status="${YELLOW}△ 缺少範本${NC}"
      fi
    fi

    printf "  ${YELLOW}%-10s${NC} %-25s %-15s %b\n" "$env" "$label" "$node_env" "$status"
  done

  echo ""
}

# 比較環境差異
env_diff() {
  local target="${1:-}"

  if [[ -z "$target" ]]; then
    log_error "請指定要比較的目標環境"
    echo -e "  用法: ./scripts/cli.sh env diff <env>"
    echo -e "  可用環境: ${ENVS[*]}"
    exit 1
  fi

  if ! validate_env "$target"; then
    log_error "無效的環境: $target"
    echo -e "  可用環境: ${ENVS[*]}"
    exit 1
  fi

  local current
  current=$(get_current_env)

  if [[ "$current" == "$target" ]]; then
    log_info "目標環境與當前環境相同（$current）"
    return
  fi

  local current_idx target_idx
  current_idx=$(get_env_index "$current") || current_idx=0
  target_idx=$(get_env_index "$target")

  print_header "環境差異比較: ${current} → ${target}"

  printf "  ${CYAN}%-20s${NC} ${YELLOW}%-35s${NC} ${GREEN}%s${NC}\n" "項目" "當前 ($current)" "目標 ($target)"
  echo -e "  ${DIM}──────────────────────────────────────────────────────────────────────────${NC}"
  printf "  %-20s %-35s %s\n" "NODE_ENV" "${ENV_NODE_ENVS[$current_idx]}" "${ENV_NODE_ENVS[$target_idx]}"
  printf "  %-20s %-35s %s\n" "Docker 範本" "${ENV_DOCKER_TEMPLATES[$current_idx]}" "${ENV_DOCKER_TEMPLATES[$target_idx]}"
  printf "  %-20s %-35s %s\n" "Backend 範本" "${ENV_BACKEND_TEMPLATES[$current_idx]}" "${ENV_BACKEND_TEMPLATES[$target_idx]}"
  printf "  %-20s %-35s %s\n" "Frontend 範本" "${ENV_FRONTEND_TEMPLATES[$current_idx]}" "${ENV_FRONTEND_TEMPLATES[$target_idx]}"
  echo ""

  # 比較 Docker env 檔案差異
  local current_docker="$PROJECT_ROOT/${ENV_DOCKER_TEMPLATES[$current_idx]}"
  local target_docker="$PROJECT_ROOT/${ENV_DOCKER_TEMPLATES[$target_idx]}"

  _show_diff() {
    local label="$1" file_a="$2" file_b="$3"
    if [[ ! -f "$file_a" ]] || [[ ! -f "$file_b" ]]; then
      return
    fi
    echo -e "  ${CYAN}${label}:${NC}"
    local diff_output
    diff_output=$(diff -u "$file_a" "$file_b" 2>/dev/null) || true
    if [[ -z "$diff_output" ]]; then
      echo -e "    ${DIM}（無差異）${NC}"
    else
      echo "$diff_output" | tail -n +3 | while IFS= read -r line; do
        if [[ "$line" == +* ]]; then
          echo -e "    ${GREEN}${line}${NC}"
        elif [[ "$line" == -* ]]; then
          echo -e "    ${RED}${line}${NC}"
        elif [[ "$line" == @* ]]; then
          echo -e "    ${CYAN}${line}${NC}"
        else
          echo "    $line"
        fi
      done
    fi
    echo ""
  }

  _show_diff "Docker 環境差異" "$current_docker" "$target_docker"

  local current_backend="$PROJECT_ROOT/apps/backend/${ENV_BACKEND_TEMPLATES[$current_idx]}"
  local target_backend="$PROJECT_ROOT/apps/backend/${ENV_BACKEND_TEMPLATES[$target_idx]}"
  _show_diff "Backend 環境差異" "$current_backend" "$target_backend"

  local current_frontend="$PROJECT_ROOT/apps/frontend/${ENV_FRONTEND_TEMPLATES[$current_idx]}"
  local target_frontend="$PROJECT_ROOT/apps/frontend/${ENV_FRONTEND_TEMPLATES[$target_idx]}"
  _show_diff "Frontend 環境差異" "$current_frontend" "$target_frontend"
}

# 切換環境
env_switch() {
  local target="${1:-}"

  if [[ -z "$target" ]]; then
    log_error "請指定目標環境"
    echo -e "  用法: ./scripts/cli.sh env switch <env>"
    echo -e "  可用環境: ${ENVS[*]}"
    exit 1
  fi

  if ! validate_env "$target"; then
    log_error "無效的環境: $target"
    echo -e "  可用環境: ${ENVS[*]}"
    exit 1
  fi

  local current
  current=$(get_current_env)

  if [[ "$current" == "$target" ]]; then
    log_info "已經在 $target 環境中"
    return
  fi

  local target_idx
  target_idx=$(get_env_index "$target")
  local target_label="${ENV_LABELS[$target_idx]}"

  # 檢查範本檔案是否存在
  local docker_tpl="$PROJECT_ROOT/${ENV_DOCKER_TEMPLATES[$target_idx]}"
  local backend_tpl="$PROJECT_ROOT/apps/backend/${ENV_BACKEND_TEMPLATES[$target_idx]}"
  local frontend_tpl="$PROJECT_ROOT/apps/frontend/${ENV_FRONTEND_TEMPLATES[$target_idx]}"

  local missing=0
  if [[ ! -f "$docker_tpl" ]]; then
    log_error "缺少 Docker 範本: ${ENV_DOCKER_TEMPLATES[$target_idx]}"
    missing=1
  fi
  if [[ ! -f "$backend_tpl" ]]; then
    log_error "缺少 Backend 範本: apps/backend/${ENV_BACKEND_TEMPLATES[$target_idx]}"
    missing=1
  fi
  if [[ ! -f "$frontend_tpl" ]]; then
    log_error "缺少 Frontend 範本: apps/frontend/${ENV_FRONTEND_TEMPLATES[$target_idx]}"
    missing=1
  fi

  if [[ "$missing" -eq 1 ]]; then
    log_error "範本檔案不完整，無法切換"
    exit 1
  fi

  # 顯示切換資訊
  echo -e ""
  echo -e "  ${CYAN}當前環境:${NC} ${YELLOW}${current}${NC}"
  echo -e "  ${CYAN}目標環境:${NC} ${GREEN}${target}${NC} — ${target_label}"
  echo -e ""
  echo -e "  ${YELLOW}⚠ 警告:${NC}"
  echo -e "    • 切換後將自動重啟 Docker 服務"
  echo -e "    • Cache（Dragonfly）資料將被清除"
  echo -e "    • Queue（RabbitMQ）資料將被清除"
  echo -e ""

  if ! confirm "確認切換到 ${target} 環境？"; then
    log_info "已取消"
    return
  fi

  echo ""

  # 步驟 1: 備份當前 .env 檔案
  log_step "備份當前環境檔案"
  if [[ -f "$PROJECT_ROOT/.env.docker" ]]; then
    cp "$PROJECT_ROOT/.env.docker" "$PROJECT_ROOT/.env.docker.backup"
    log_success "已備份 .env.docker"
  fi
  if [[ -f "$PROJECT_ROOT/apps/backend/.env" ]]; then
    cp "$PROJECT_ROOT/apps/backend/.env" "$PROJECT_ROOT/apps/backend/.env.backup"
    log_success "已備份 apps/backend/.env"
  fi
  if [[ -f "$PROJECT_ROOT/apps/frontend/.env" ]]; then
    cp "$PROJECT_ROOT/apps/frontend/.env" "$PROJECT_ROOT/apps/frontend/.env.backup"
    log_success "已備份 apps/frontend/.env"
  fi

  # 步驟 2: 複製目標環境範本
  log_step "複製目標環境範本"
  cp "$docker_tpl" "$PROJECT_ROOT/.env.docker"
  log_success "已複製 ${ENV_DOCKER_TEMPLATES[$target_idx]} → .env.docker"

  cp "$backend_tpl" "$PROJECT_ROOT/apps/backend/.env"
  log_success "已複製 ${ENV_BACKEND_TEMPLATES[$target_idx]} → apps/backend/.env"

  cp "$frontend_tpl" "$PROJECT_ROOT/apps/frontend/.env"
  log_success "已複製 ${ENV_FRONTEND_TEMPLATES[$target_idx]} → apps/frontend/.env"

  # 步驟 3: 從 backend .env 提取 DATABASE_URL 寫入 packages/database/.env
  log_step "同步 Database 環境變數"
  local db_url
  db_url=$(grep '^DATABASE_URL=' "$PROJECT_ROOT/apps/backend/.env" 2>/dev/null | head -1 || true)
  if [[ -n "$db_url" ]]; then
    echo "$db_url" > "$PROJECT_ROOT/packages/database/.env"
    log_success "已同步 DATABASE_URL 到 packages/database/.env"
  else
    log_warning "未找到 DATABASE_URL，跳過 database 同步"
  fi

  # 步驟 4: 記錄當前環境
  echo "$target" > "$CURRENT_ENV_FILE"
  log_success "已記錄環境: $target"

  # 步驟 5: 停止 Docker 服務
  log_step "停止 Docker 服務"
  if docker compose --env-file "$PROJECT_ROOT/.env.docker" down 2>/dev/null; then
    log_success "Docker 服務已停止"
  else
    log_warning "Docker 服務停止失敗（可能未在運行）"
  fi

  # 步驟 6: 清除 Cache 和 Queue 資料
  log_step "清除 Cache 和 Queue 資料"

  local compose_project
  compose_project=$(basename "$PROJECT_ROOT" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')

  # 清除 Dragonfly volume
  if docker volume rm "${compose_project}_dragonfly-data" 2>/dev/null; then
    log_success "已清除 Dragonfly cache"
  else
    log_info "Dragonfly volume 不存在或已清除"
  fi

  # 清除 RabbitMQ volume
  if docker volume rm "${compose_project}_rabbitmq-data" 2>/dev/null; then
    log_success "已清除 RabbitMQ queue"
  else
    log_info "RabbitMQ volume 不存在或已清除"
  fi

  # 步驟 7: 啟動 Docker 服務
  log_step "啟動 Docker 服務"
  if docker compose --env-file "$PROJECT_ROOT/.env.docker" up -d 2>/dev/null; then
    log_success "Docker 服務已啟動"
  else
    log_error "Docker 服務啟動失敗"
    echo -e "  請手動執行: ${CYAN}docker compose --env-file .env.docker up -d${NC}"
    return 1
  fi

  # 步驟 8: 等待健康檢查
  log_step "等待服務健康檢查"
  wait_for_service "docker compose --env-file '$PROJECT_ROOT/.env.docker' ps --format json 2>/dev/null | grep -q healthy" "Docker 服務" 60 3 || true

  # 完成
  echo -e ""
  echo -e "${GREEN}━━━${NC} ${BOLD}環境切換完成: ${YELLOW}${current}${NC} → ${GREEN}${target}${NC}"
  echo -e ""
  echo -e "  ${CYAN}環境:${NC}     ${GREEN}${target}${NC} — ${target_label}"
  echo -e "  ${CYAN}NODE_ENV:${NC} ${ENV_NODE_ENVS[$target_idx]}"
  echo -e ""
  echo -e "  ${YELLOW}提示:${NC} 切換環境後，建議執行以下命令重新載入 seed 資料："
  echo -e "         ${CYAN}./scripts/cli.sh db seed${NC}"
  echo -e ""
  echo -e "  ${DIM}備份檔案已保存為 .backup 後綴${NC}"
  echo -e ""
}

# 互動式子選單
show_env_menu() {
  local current
  current=$(get_current_env)
  local idx
  idx=$(get_env_index "$current") || idx=0

  echo -e ""
  echo -e "  ${CYAN}當前環境:${NC} ${GREEN}${current}${NC} — ${ENV_LABELS[$idx]}"
  echo -e ""
  echo -e "${YELLOW}選擇要切換的環境:${NC}"

  local i
  for i in "${!ENVS[@]}"; do
    local env="${ENVS[$i]}"
    local label="${ENV_LABELS[$i]}"
    if [[ "$env" == "$current" ]]; then
      echo -e "  ${DIM}$((i + 1))) ${env} — ${label} (當前)${NC}"
    else
      echo -e "  ${CYAN}$((i + 1))${NC}) ${env} — ${label}"
    fi
  done

  echo -e "  ${CYAN}5${NC}) 比較環境差異"
  echo -e "  ${CYAN}6${NC}) 列出所有環境"
  echo -ne "${GREEN}請選擇 [1-6]:${NC} "
  read -r env_choice

  case "$env_choice" in
    1) env_switch "local" ;;
    2) env_switch "dev" ;;
    3) env_switch "uat" ;;
    4) env_switch "prod" ;;
    5)
      echo -ne "比較目標環境 (local/dev/uat/prod): "
      read -r diff_target
      env_diff "$diff_target"
      ;;
    6) env_list ;;
    *)
      echo -e "${RED}無效選擇${NC}"
      exit 1
      ;;
  esac
}

# 主入口
SUBCOMMAND="${1:-}"

case "$SUBCOMMAND" in
  switch)
    env_switch "${2:-}"
    ;;
  current)
    env_current
    ;;
  list)
    env_list
    ;;
  diff)
    env_diff "${2:-}"
    ;;
  -h|--help)
    show_command_help
    ;;
  "")
    show_env_menu
    ;;
  *)
    log_error "未知的子命令: $SUBCOMMAND"
    show_command_help
    exit 1
    ;;
esac
