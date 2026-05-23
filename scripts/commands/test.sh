#!/bin/bash

# ==========================================
# MEAD CLI - test 命令
# 執行測試
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh test${NC} - 執行測試\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  執行專案測試套件（包含 TypeScript 型別檢查）"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh test [options]"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  --backend        僅執行後端測試（含 type-check）"
  echo "  --frontend       僅執行前端測試（含 type-check）"
  echo "  --i18n           僅執行 i18n 翻譯完整性測試"
  echo "  --watch          監視模式（跳過 type-check）"
  echo "  --coverage       產生覆蓋率報告"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}測試流程:${NC}"
  echo "  1. TypeScript 型別檢查（tsc --noEmit）"
  echo "  2. 單元測試（Jest / Vitest）"
  echo "  3. 如果型別檢查失敗，將不會執行單元測試"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh test                 # 執行所有測試"
  echo "  ./scripts/cli.sh test --backend       # 僅後端測試"
  echo "  ./scripts/cli.sh test --i18n          # 僅 i18n 測試"
  echo "  ./scripts/cli.sh test --watch         # 監視模式"
  echo "  ./scripts/cli.sh test --coverage      # 產生覆蓋率報告"
  echo ""
}

# 解析參數
BACKEND_ONLY=false
FRONTEND_ONLY=false
I18N_ONLY=false
WATCH=false
COVERAGE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --backend)
      BACKEND_ONLY=true
      shift
      ;;
    --frontend)
      FRONTEND_ONLY=true
      shift
      ;;
    --i18n)
      I18N_ONLY=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    --coverage)
      COVERAGE=true
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

print_header "執行測試"

# 執行測試
if [ "$I18N_ONLY" = true ]; then
  log_info "執行 i18n 翻譯完整性測試..."
  echo ""

  log_info "▶ 後端 i18n 測試"
  pnpm --filter @mead/backend test:i18n

  echo ""
  log_info "▶ 前端 i18n 測試"
  pnpm --filter @mead/frontend test:i18n

elif [ "$BACKEND_ONLY" = true ]; then
  log_info "執行後端測試..."
  echo ""

  # TypeScript 型別檢查
  log_info "▶ 1/2 TypeScript 型別檢查"
  if pnpm --filter @mead/backend type-check; then
    log_success "型別檢查通過"
  else
    log_error "型別檢查失敗"
    exit 1
  fi

  echo ""
  log_info "▶ 2/2 單元測試"
  if [ "$WATCH" = true ]; then
    pnpm --filter @mead/backend test:watch
  elif [ "$COVERAGE" = true ]; then
    pnpm --filter @mead/backend test:cov
  else
    pnpm --filter @mead/backend test
  fi

elif [ "$FRONTEND_ONLY" = true ]; then
  log_info "執行前端測試..."
  echo ""

  # TypeScript 型別檢查
  log_info "▶ 1/2 TypeScript 型別檢查"
  if pnpm --filter @mead/frontend type-check; then
    log_success "型別檢查通過"
  else
    log_error "型別檢查失敗"
    exit 1
  fi

  echo ""
  log_info "▶ 2/2 單元測試"
  if [ "$WATCH" = true ]; then
    pnpm --filter @mead/frontend test -- --watch
  elif [ "$COVERAGE" = true ]; then
    pnpm --filter @mead/frontend test -- --coverage
  else
    pnpm --filter @mead/frontend test
  fi

else
  log_info "執行所有測試..."
  echo ""

  # TypeScript 型別檢查
  log_info "▶ 1/3 TypeScript 型別檢查"

  TYPE_CHECK_FAILED=false

  log_info "  • 後端型別檢查"
  if pnpm --filter @mead/backend type-check; then
    log_success "  後端型別檢查通過"
  else
    log_error "  後端型別檢查失敗"
    TYPE_CHECK_FAILED=true
  fi

  log_info "  • 前端型別檢查"
  if pnpm --filter @mead/frontend type-check; then
    log_success "  前端型別檢查通過"
  else
    log_error "  前端型別檢查失敗"
    TYPE_CHECK_FAILED=true
  fi

  if [ "$TYPE_CHECK_FAILED" = true ]; then
    log_error "型別檢查失敗，停止執行測試"
    exit 1
  fi

  echo ""
  log_info "▶ 2/3 後端測試"
  pnpm --filter @mead/backend test

  echo ""
  log_info "▶ 3/3 前端測試"
  pnpm --filter @mead/frontend test
fi

log_success "所有測試通過"
