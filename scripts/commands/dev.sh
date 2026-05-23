#!/bin/bash

# ==========================================
# MEAD CLI - dev 命令
# 啟動開發環境
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 確保 Ctrl+C 能終止所有子 process（包含孫 process）
trap 'trap - INT TERM; kill 0' INT TERM

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh dev${NC} - 啟動開發環境\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  啟動開發伺服器"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh dev [options]"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  --frontend-only       僅啟動前端"
  echo "  --backend-only        僅啟動後端"
  echo "  --storybook-only      僅啟動 Storybook"
  echo "  --all                 啟動全部（Frontend + Backend + Storybook）"
  echo "  --frontend-storybook  啟動前端 + Storybook"
  echo "  -h, --help            顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh dev --all                  # 啟動全部（含 Storybook）"
  echo "  ./scripts/cli.sh dev                       # 啟動 Frontend + Backend"
  echo "  ./scripts/cli.sh dev --frontend-only       # 僅前端"
  echo "  ./scripts/cli.sh dev --backend-only        # 僅後端"
  echo "  ./scripts/cli.sh dev --storybook-only      # 僅 Storybook"
  echo "  ./scripts/cli.sh dev --frontend-storybook  # 前端 + Storybook"
  echo ""
}

# 解析參數
ALL=false
FRONTEND_ONLY=false
BACKEND_ONLY=false
STORYBOOK_ONLY=false
FRONTEND_STORYBOOK=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --all)
      ALL=true
      shift
      ;;
    --frontend-only)
      FRONTEND_ONLY=true
      shift
      ;;
    --backend-only)
      BACKEND_ONLY=true
      shift
      ;;
    --storybook-only)
      STORYBOOK_ONLY=true
      shift
      ;;
    --frontend-storybook)
      FRONTEND_STORYBOOK=true
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

print_header "啟動開發環境"

if [ "$ALL" = true ]; then
  log_info "啟動全部服務（Frontend + Backend + Storybook）..."
  pnpm --filter @mead/frontend dev & pnpm --filter @mead/backend dev & pnpm storybook & wait
elif [ "$STORYBOOK_ONLY" = true ]; then
  log_info "啟動 Storybook..."
  pnpm storybook
elif [ "$FRONTEND_STORYBOOK" = true ]; then
  log_info "啟動前端 + Storybook..."
  pnpm --filter @mead/frontend dev & pnpm storybook & wait
elif [ "$FRONTEND_ONLY" = true ]; then
  log_info "啟動前端..."
  pnpm --filter @mead/frontend dev
elif [ "$BACKEND_ONLY" = true ]; then
  log_info "啟動後端..."
  pnpm --filter @mead/backend dev
else
  log_info "啟動前端 + 後端..."
  pnpm --filter @mead/frontend dev & pnpm --filter @mead/backend dev & wait
fi
