#!/bin/bash

# ==========================================
# NPT CLI - clean 命令
# 環境清理
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh clean${NC} - 環境清理\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  清理專案的快取和建置產物，釋放磁碟空間"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh clean [options]"
  echo ""
  echo -e "${YELLOW}選項:${NC}"
  echo "  --dry-run        預覽將執行的操作（不實際刪除）"
  echo "  --deep           深度清理（包含 node_modules）"
  echo "  --clean-env      清理所有 .env 和 .env.docker 檔案"
  echo "  -h, --help       顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh clean               # 標準清理"
  echo "  ./scripts/cli.sh clean --dry-run     # 預覽清理操作"
  echo "  ./scripts/cli.sh clean --deep        # 深度清理（包含依賴）"
  echo "  ./scripts/cli.sh clean --clean-env   # 清理環境變數檔案"
  echo ""
}

# 解析參數
DRY_RUN=false
DEEP_CLEAN=false
CLEAN_ENV=false
INTERACTIVE_MODE=false

# 記錄參數數量
ARG_COUNT=$#

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
    --clean-env)
      CLEAN_ENV=true
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

# 如果沒有傳任何參數，啟用互動模式
if [ $ARG_COUNT -eq 0 ]; then
  INTERACTIVE_MODE=true
fi

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
log_step "1/7 終止開發伺服器"

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
log_step "2/7 清理 Turbo 快取"

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
log_step "3/7 清理專案快取"

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
log_step "4/7 清理 TypeScript 建置資訊"

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
# 互動模式下詢問用戶
if [ "$INTERACTIVE_MODE" = true ] && [ "$DEEP_CLEAN" = false ] && [ "$DRY_RUN" = false ]; then
  log_step "5/7 深度清理選項"
  echo ""
  echo -e "${YELLOW}深度清理說明：${NC}"
  echo "  • 刪除所有 node_modules 目錄"
  echo "  • 釋放數 GB 磁碟空間"
  echo "  • 需重新執行: pnpm install"
  echo ""

  if confirm "是否進行深度清理（刪除 node_modules）?" "n"; then
    DEEP_CLEAN=true
  fi
fi

if [ "$DEEP_CLEAN" = true ]; then
  log_step "5/7 深度清理（node_modules）"

  if [ "$DRY_RUN" = false ]; then
    # 非互動模式或已確認
    if [ "$INTERACTIVE_MODE" = false ]; then
      if ! confirm "確定要刪除所有 node_modules?" "n"; then
        log_info "已跳過深度清理"
        DEEP_CLEAN=false
      fi
    fi

    if [ "$DEEP_CLEAN" = true ]; then
      log_info "刪除 node_modules..."
      find . -name "node_modules" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
      log_success "已刪除所有 node_modules"
      log_warning "請記得執行: pnpm install"
    fi
  else
    log_info "[DRY RUN] 將刪除所有 node_modules 目錄"
  fi
else
  log_step "5/7 跳過深度清理"
  if [ "$INTERACTIVE_MODE" = false ]; then
    log_info "使用 --deep 選項進行深度清理"
  else
    log_info "已跳過深度清理"
  fi
fi

# ==========================================
# 6. 清理環境變數檔案（選擇性）
# ==========================================
# 互動模式下詢問用戶
if [ "$INTERACTIVE_MODE" = true ] && [ "$CLEAN_ENV" = false ] && [ "$DRY_RUN" = false ]; then
  log_step "6/7 清理環境變數檔案選項"
  echo ""
  echo -e "${YELLOW}清理環境變數檔案說明：${NC}"
  echo "  • 刪除所有 .env 和 .env.docker 檔案（不含 .example）"
  echo "  • 包含: .env.docker、apps/backend/.env、apps/frontend/.env"
  echo -e "  • ${RED}⚠️  刪除前將自動停止所有服務（含 Docker）${NC}"
  echo "  • 需重新執行: ./scripts/cli.sh init（會自動從 .example 複製建立）"
  echo ""

  if confirm "是否清理環境變數檔案（.env / .env.docker）?" "n"; then
    CLEAN_ENV=true
  fi
fi

if [ "$CLEAN_ENV" = true ]; then
  log_step "6/7 清理環境變數檔案"

  # 找出所有 .env 和 .env.docker 檔案（排除 .example 與 node_modules）
  ENV_FILES=()
  while IFS= read -r f; do
    ENV_FILES+=("$f")
  done < <(find . \( -name ".env" -o -name ".env.docker" \) \
    -not -name "*.example" \
    -not -path "*/node_modules/*" \
    2>/dev/null | sort)

  if [ ${#ENV_FILES[@]} -eq 0 ]; then
    log_info "沒有找到 .env 或 .env.docker 檔案"
  else
    log_info "找到以下環境變數檔案："
    for ENV_FILE in "${ENV_FILES[@]}"; do
      echo -e "    ${DIM}${ENV_FILE}${NC}"
    done
    echo ""

    if [ "$DRY_RUN" = false ]; then
      # 非互動模式需再次確認
      if [ "$INTERACTIVE_MODE" = false ]; then
        echo ""
        log_warning "刪除環境變數檔案前將自動停止所有服務（含 Docker）"
        if ! confirm "確定要刪除這些環境變數檔案?" "n"; then
          log_info "已跳過環境變數檔案清理"
          CLEAN_ENV=false
        fi
      fi

      if [ "$CLEAN_ENV" = true ]; then
        # 先停止所有服務，避免 .env.docker 刪除後無法 docker-compose down
        log_info "正在停止所有服務..."

        # 停止開發伺服器
        for PORT in 3000 4000 6006 5555; do
          PIDS=$(lsof -ti:$PORT 2>/dev/null || true)
          if [ -n "$PIDS" ]; then
            echo "$PIDS" | xargs kill -9 2>/dev/null || true
            log_success "已停止 port $PORT 的服務"
          fi
        done

        # 停止 Docker 服務（趁 .env.docker 還存在時執行）
        if [ -f ".env.docker" ]; then
          log_info "停止 Docker 容器..."
          docker-compose --env-file .env.docker --profile storage down 2>/dev/null || \
          docker-compose --env-file .env.docker down 2>/dev/null || true
          log_success "Docker 服務已停止"
        fi

        echo ""
        # 刪除環境變數檔案
        for ENV_FILE in "${ENV_FILES[@]}"; do
          rm -f "$ENV_FILE"
          log_success "已刪除: $ENV_FILE"
        done
        log_warning "請記得重新建立環境變數檔案（執行: ./scripts/cli.sh init）"
      fi
    else
      log_info "[DRY RUN] 將執行以下操作："
      log_info "[DRY RUN] 1. 停止所有開發伺服器（port 3000/4000/6006/5555）"
      log_info "[DRY RUN] 2. 停止 Docker 服務（docker-compose down）"
      log_info "[DRY RUN] 3. 刪除以下環境變數檔案："
      for ENV_FILE in "${ENV_FILES[@]}"; do
        log_info "[DRY RUN]    $ENV_FILE"
      done
    fi
  fi
else
  log_step "6/7 跳過環境變數檔案清理"
  if [ "$INTERACTIVE_MODE" = false ]; then
    log_info "使用 --clean-env 選項清理環境變數檔案"
  else
    log_info "已跳過環境變數檔案清理"
  fi
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

  if [ "$DEEP_CLEAN" = true ] || [ "$CLEAN_ENV" = true ]; then
    echo -e "${YELLOW}後續步驟（必須）：${NC}"
    STEP=1
    if [ "$DEEP_CLEAN" = true ]; then
      echo -e "  $STEP. 重新安裝依賴: ${CYAN}pnpm install${NC}"
      STEP=$((STEP + 1))
      echo -e "  $STEP. 重新產生 Prisma Client: ${CYAN}pnpm db:generate${NC}"
      STEP=$((STEP + 1))
    fi
    if [ "$CLEAN_ENV" = true ]; then
      echo -e "  $STEP. 重新建立環境變數檔案: ${CYAN}./scripts/cli.sh init${NC}"
      STEP=$((STEP + 1))
    fi
    echo -e "  $STEP. 啟動開發環境: ${CYAN}pnpm dev${NC}"
  else
    echo -e "${YELLOW}建議的後續步驟：${NC}"
    echo -e "  如需深度清理: ${CYAN}./scripts/cli.sh clean --deep${NC}"
    echo -e "  如需清理環境變數: ${CYAN}./scripts/cli.sh clean --clean-env${NC}"
    echo -e "  啟動開發環境: ${CYAN}pnpm dev${NC}"
  fi
  echo ""
  echo -e "${YELLOW}注意事項：${NC}"
  echo -e "  - ${CYAN}apps/backend/uploads${NC} 目錄的檔案已保留（用戶上傳資料）"
  echo -e "  - Docker volumes 資料已保留（資料庫、SeaweedFS）"
  echo ""
  echo -e "${YELLOW}清理持久化資料：${NC}"
  echo -e "  如需重置資料庫: ${CYAN}./scripts/cli.sh db reset${NC}"
  echo -e "  如需重置 SeaweedFS: ${CYAN}./scripts/cli.sh storage reset${NC}"
fi
echo ""
