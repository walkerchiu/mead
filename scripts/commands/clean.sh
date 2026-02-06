#!/bin/bash

# ==========================================
# Wind CLI - clean 命令
# 清理快取和建置產物
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh clean${NC} - 清理快取和建置產物\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  清理專案的快取和建置產物，釋放磁碟空間"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh clean [options]"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  --dry-run        預覽將執行的操作（不實際刪除）"
  echo "  --deep           深度清理（包含 node_modules）"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh clean               # 標準清理"
  echo "  ./scripts/cli.sh clean --dry-run     # 預覽清理操作"
  echo "  ./scripts/cli.sh clean --deep        # 深度清理（包含依賴）"
  echo ""
}

# 解析參數
DRY_RUN=false
DEEP_CLEAN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --deep)
      DEEP_CLEAN=true
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

if [ "$DRY_RUN" = true ]; then
  print_header "清理預覽（Dry Run）"
else
  print_header "清理專案"
fi

# ==========================================
# 1. 終止進程
# ==========================================
log_step "1/5 終止開發伺服器"

PORTS=(3000 4000 6006)
PROCESSES_KILLED=0

for PORT in "${PORTS[@]}"; do
  PIDS=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    log_info "發現 port $PORT 被使用 (PID: $PIDS)"
    if [ "$DRY_RUN" = false ]; then
      echo "$PIDS" | xargs kill -9 2>/dev/null || true
      log_success "已終止 port $PORT 的進程"
      PROCESSES_KILLED=$((PROCESSES_KILLED + 1))
    else
      log_info "[DRY RUN] 將終止 PID: $PIDS"
    fi
  fi
done

if [ $PROCESSES_KILLED -eq 0 ] && [ "$DRY_RUN" = false ]; then
  log_info "沒有運行中的開發伺服器"
fi

# ==========================================
# 2. 清理 Turbo 快取
# ==========================================
log_step "2/5 清理 Turbo 快取"

TURBO_CACHE_DIR="$HOME/.turbo"
if [ -d "$TURBO_CACHE_DIR" ]; then
  CACHE_SIZE=$(du -sh "$TURBO_CACHE_DIR" 2>/dev/null | cut -f1)
  log_info "Turbo 快取: $CACHE_SIZE"
  if [ "$DRY_RUN" = false ]; then
    rm -rf "$TURBO_CACHE_DIR"
    log_success "已清理 Turbo 快取"
  else
    log_info "[DRY RUN] 將刪除: $TURBO_CACHE_DIR"
  fi
else
  log_info "Turbo 快取不存在"
fi

# ==========================================
# 3. 清理專案快取和建置產物
# ==========================================
log_step "3/5 清理專案快取"

declare -a CLEANUP_PATHS=(
  ".turbo"
  "node_modules/.cache"
  "apps/backend/dist"
  "apps/backend/.turbo"
  "apps/frontend/.next"
  "apps/frontend/.turbo"
  "apps/frontend/out"
  "apps/frontend/.storybook/cache"
  "apps/frontend/storybook-static"
  "packages/ui/.turbo"
  "packages/database/.turbo"
)

TOTAL_CLEANED=0

for PATH_TO_CLEAN in "${CLEANUP_PATHS[@]}"; do
  if [ -e "$PATH_TO_CLEAN" ]; then
    SIZE=$(du -sh "$PATH_TO_CLEAN" 2>/dev/null | cut -f1 || echo "unknown")
    log_info "$PATH_TO_CLEAN ($SIZE)"
    if [ "$DRY_RUN" = false ]; then
      rm -rf "$PATH_TO_CLEAN"
      TOTAL_CLEANED=$((TOTAL_CLEANED + 1))
    else
      log_info "[DRY RUN] 將刪除: $PATH_TO_CLEAN"
    fi
  fi
done

if [ $TOTAL_CLEANED -gt 0 ] && [ "$DRY_RUN" = false ]; then
  log_success "已清理 $TOTAL_CLEANED 個項目"
elif [ "$DRY_RUN" = false ]; then
  log_info "沒有需要清理的項目"
fi

# ==========================================
# 4. 清理 TypeScript 建置資訊
# ==========================================
log_step "4/5 清理 TypeScript 建置資訊"

TS_BUILD_COUNT=$(find . -name "*.tsbuildinfo" -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TS_BUILD_COUNT" -gt 0 ]; then
  log_info "找到 $TS_BUILD_COUNT 個 .tsbuildinfo 檔案"
  if [ "$DRY_RUN" = false ]; then
    find . -name "*.tsbuildinfo" -not -path "*/node_modules/*" -delete 2>/dev/null
    log_success "已清理 TypeScript 建置資訊"
  else
    log_info "[DRY RUN] 將刪除這些檔案"
  fi
else
  log_info "沒有找到 .tsbuildinfo 檔案"
fi

# ==========================================
# 5. 深度清理（選擇性）
# ==========================================
if [ "$DEEP_CLEAN" = true ]; then
  log_step "5/5 深度清理（node_modules）"

  if [ "$DRY_RUN" = false ]; then
    if ! confirm "確定要刪除所有 node_modules?" "n"; then
      log_info "已跳過深度清理"
    else
      log_info "刪除 node_modules..."
      find . -name "node_modules" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
      log_success "已刪除所有 node_modules"
      log_warning "請記得執行: pnpm install"
    fi
  else
    log_info "[DRY RUN] 將刪除所有 node_modules 目錄"
  fi
else
  log_step "5/5 跳過深度清理"
  log_info "使用 --deep 選項進行深度清理"
fi

# ==========================================
# 完成
# ==========================================
echo ""
if [ "$DRY_RUN" = true ]; then
  print_header "預覽完成"
  echo -e "執行 ${CYAN}./scripts/cli.sh clean${NC} 以實際清理"
else
  print_header "清理完成"

  echo -e "${YELLOW}建議的後續步驟：${NC}"
  echo -e "  1. 重新安裝依賴（如果刪除了）: ${CYAN}pnpm install${NC}"
  echo -e "  2. 重新產生 Prisma Client: ${CYAN}pnpm db:generate${NC}"
  echo -e "  3. 啟動開發環境: ${CYAN}pnpm dev${NC}"
fi
echo ""
