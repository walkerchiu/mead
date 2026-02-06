#!/bin/bash

# ==========================================
# Wind CLI - deps 命令
# 依賴管理工具
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh deps${NC} - 依賴管理工具\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  檢查過時套件、安全性審計、更新套件、清理未使用依賴"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh deps <subcommand> [workspace]"
  echo ""
  echo -e "${YELLOW}子命令:${NC}"
  echo -e "  ${CYAN}outdated${NC}          檢查過時套件"
  echo -e "  ${CYAN}audit${NC}             安全性審計"
  echo -e "  ${CYAN}update${NC}            更新套件"
  echo -e "  ${CYAN}unused${NC}            清理未使用依賴"
  echo ""
  echo -e "${YELLOW}Workspace:${NC}"
  echo -e "  ${CYAN}all${NC}               全部（預設）"
  echo -e "  ${CYAN}backend${NC}           後端"
  echo -e "  ${CYAN}frontend${NC}          前端"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh deps outdated             # 檢查所有過時套件"
  echo "  ./scripts/cli.sh deps audit backend        # 審計後端依賴"
  echo "  ./scripts/cli.sh deps update frontend      # 更新前端套件"
  echo "  ./scripts/cli.sh deps unused               # 掃描未使用依賴"
  echo ""
}

# 選擇 workspace (使用全局變量 SELECTED_WORKSPACE)
select_workspace() {
  echo -e ""
  echo -e "${YELLOW}選擇 Workspace:${NC}"
  echo -e "  ${CYAN}1${NC}) 全部（預設）"
  echo -e "  ${CYAN}2${NC}) Backend"
  echo -e "  ${CYAN}3${NC}) Frontend"
  echo -ne "${GREEN}請選擇 [1-3]:${NC} "
  read -r ws_choice

  case "$ws_choice" in
    1|"") SELECTED_WORKSPACE="all" ;;
    2) SELECTED_WORKSPACE="backend" ;;
    3) SELECTED_WORKSPACE="frontend" ;;
    *)
      echo -e "${RED}無效選擇，使用預設（全部）${NC}" >&2
      SELECTED_WORKSPACE="all"
      ;;
  esac
}

# 取得 pnpm filter 參數
get_filter() {
  local workspace="$1"
  case "$workspace" in
    backend) echo "--filter backend" ;;
    frontend) echo "--filter frontend" ;;
    *) echo "" ;;
  esac
}

# 取得 workspace 顯示名稱
get_ws_label() {
  local workspace="$1"
  case "$workspace" in
    backend) echo "Backend" ;;
    frontend) echo "Frontend" ;;
    *) echo "全部" ;;
  esac
}

# 檢查過時套件
deps_outdated() {
  local workspace="${1:-all}"
  local filter
  local label

  filter=$(get_filter "$workspace")
  label=$(get_ws_label "$workspace")

  print_header "檢查過時套件 ($label)"

  echo -e "${DIM}正在執行: pnpm $filter outdated${NC}"
  echo -e "${DIM}────────────────────────────────────────${NC}\n"
  echo -e "${CYAN}⏳ 正在檢查套件版本...${NC}\n"

  cd "$PROJECT_ROOT"

  # 顯示即時輸出 - 不重定向，讓用戶看到進度
  pnpm $filter outdated || true

  echo ""
  log_success "檢查完成"
  echo ""
}

# 安全性審計
deps_audit() {
  local workspace="${1:-all}"
  local filter
  local label

  filter=$(get_filter "$workspace")
  label=$(get_ws_label "$workspace")

  print_header "安全性審計 ($label)"

  echo -e "${DIM}正在執行: pnpm $filter audit${NC}"
  echo -e "${DIM}────────────────────────────────────────${NC}\n"
  echo -e "${CYAN}🔍 正在掃描安全漏洞...${NC}\n"

  cd "$PROJECT_ROOT"

  # 顯示即時輸出 - 不重定向，讓用戶看到進度
  pnpm $filter audit || true

  echo ""
  log_success "審計完成"
  echo ""
}

# 更新套件
deps_update() {
  local workspace="${1:-all}"
  local filter
  local label

  filter=$(get_filter "$workspace")
  label=$(get_ws_label "$workspace")

  print_header "更新套件 ($label)"

  echo -e "${YELLOW}⚠️  警告：${NC}這將更新套件到最新版本"
  echo -e "${DIM}正在執行: pnpm $filter update --latest${NC}"
  echo -e "${DIM}────────────────────────────────────────${NC}\n"
  echo -e "${CYAN}📦 正在下載並更新套件...${NC}"
  echo -e "${DIM}(可能需要數分鐘，請耐心等待)${NC}\n"

  cd "$PROJECT_ROOT"

  # 顯示即時輸出
  pnpm $filter update --latest

  echo ""
  log_success "套件更新完成"
  echo ""
}

# 清理未使用依賴
deps_unused() {
  print_header "掃描未使用依賴"

  if ! command -v npx >/dev/null 2>&1; then
    log_error "找不到 npx，請先安裝 Node.js"
    exit 1
  fi

  echo -e "${DIM}正在使用 depcheck 掃描未使用的依賴${NC}"
  echo -e "${DIM}────────────────────────────────────────${NC}\n"
  echo -e "${CYAN}🔎 準備掃描工具...${NC}"
  echo -e "${DIM}(首次執行可能需要下載 depcheck)${NC}\n"

  if [ -d "$PROJECT_ROOT/apps/backend" ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📁 Backend${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo -e "${CYAN}⏳ 正在分析 Backend 依賴...${NC}\n"
    cd "$PROJECT_ROOT/apps/backend"
    # 顯示即時輸出
    npx depcheck || true
    echo ""
  fi

  if [ -d "$PROJECT_ROOT/apps/frontend" ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📁 Frontend${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo -e "${CYAN}⏳ 正在分析 Frontend 依賴...${NC}\n"
    cd "$PROJECT_ROOT/apps/frontend"
    # 顯示即時輸出
    npx depcheck || true
    echo ""
  fi

  log_success "掃描完成"
  echo ""
}

# 互動式子選單
show_deps_menu() {
  echo -e ""
  echo -e "${YELLOW}依賴管理:${NC}"
  echo -e "  ${CYAN}1${NC}) 檢查過時套件"
  echo -e "  ${CYAN}2${NC}) 安全性審計"
  echo -e "  ${CYAN}3${NC}) 更新套件"
  echo -e "  ${CYAN}4${NC}) 清理未使用依賴"
  echo -ne "${GREEN}請選擇 [1-4]:${NC} "
  read -r deps_choice

  case "$deps_choice" in
    1)
      select_workspace
      deps_outdated "$SELECTED_WORKSPACE"
      ;;
    2)
      select_workspace
      deps_audit "$SELECTED_WORKSPACE"
      ;;
    3)
      select_workspace
      deps_update "$SELECTED_WORKSPACE"
      ;;
    4)
      deps_unused
      ;;
    *)
      echo -e "${RED}無效選擇${NC}"
      exit 1
      ;;
  esac
}

# 主入口
SUBCOMMAND="${1:-}"

case "$SUBCOMMAND" in
  outdated)
    deps_outdated "${2:-all}"
    ;;
  audit)
    deps_audit "${2:-all}"
    ;;
  update)
    deps_update "${2:-all}"
    ;;
  unused)
    deps_unused
    ;;
  -h|--help)
    show_command_help
    ;;
  "")
    show_deps_menu
    ;;
  *)
    log_error "未知的子命令: $SUBCOMMAND"
    show_command_help
    exit 1
    ;;
esac
