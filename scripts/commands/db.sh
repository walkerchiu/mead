#!/bin/bash

# ==========================================
# MEAD CLI - db 命令
# 資料庫管理工具（支援多環境）
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 載入檔案儲存管理工具
source "$SCRIPT_DIR/../utils/file-storage.sh"

# 預設環境
ENVIRONMENT="${NPT_ENV:-development}"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh db${NC} - 資料管理（支援多環境）\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  管理資料庫與檔案儲存，支援開發、測試、生產環境"
  echo "  備份/還原包含: PostgreSQL 資料庫 + 檔案儲存 (local/SeaweedFS S3)"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh db <subcommand> [options]"
  echo ""
  echo -e "${YELLOW}子命令:${NC}"
  echo -e "  ${CYAN}migrate create <name>${NC}  建立新的 migration（或 ${CYAN}migrate:create <name>${NC}）"
  echo -e "  ${CYAN}migrate:up${NC}    執行待處理的 migrations"
  echo -e "  ${CYAN}migrate:down${NC}  回滾最後一次 migration"
  echo -e "  ${CYAN}migrate:status${NC} 查看 migration 狀態"
  echo -e "  ${CYAN}reset${NC}         重置資料（資料庫 + 可選檔案清理）"
  echo -e "  ${CYAN}seed${NC}          重新載入種子資料"
  echo -e "  ${CYAN}backup${NC}        備份資料（資料庫 + 檔案儲存）"
  echo -e "  ${CYAN}restore${NC}       還原資料（資料庫 + 檔案儲存）"
  echo -e "  ${CYAN}cleanup${NC}       清理舊備份"
  echo -e "  ${CYAN}studio${NC}        開啟 Prisma Studio（http://localhost:5555）"
  echo -e "  ${CYAN}adminer${NC}       啟動 Adminer DB GUI（http://localhost:\${ADMINER_PORT:-5556}）"
  echo -e "  ${CYAN}generate${NC}      產生 Prisma Client"
  echo ""
  echo -e "${YELLOW}環境選項:${NC}"
  echo "  --env <env>    指定環境 (development, uat, production)"
  echo "                 預設: development (或從 NPT_ENV 環境變數讀取)"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  # 開發環境（預設）"
  echo "  ./scripts/cli.sh db migrate create \"add_user_profile\"  # 建立 migration"
  echo "  ./scripts/cli.sh db migrate:up                         # 執行 migrations"
  echo "  ./scripts/cli.sh db migrate:down                       # 回滾最後一次"
  echo "  ./scripts/cli.sh db reset                              # 重置資料庫"
  echo "  "
  echo "  # 測試環境"
  echo "  ./scripts/cli.sh db migrate:up --env uat"
  echo "  ./scripts/cli.sh db seed --env uat"
  echo "  "
  echo "  # 生產環境（需要確認）"
  echo "  ./scripts/cli.sh db migrate:up --env production"
  echo "  ./scripts/cli.sh db backup --env production"
  echo ""
  echo -e "${YELLOW}Migration 工作流程:${NC}"
  echo "  1. ./scripts/cli.sh db migrate create \"description\"    # 建立 migration"
  echo "  2. 編輯產生的 migration 檔案"
  echo "  3. ./scripts/cli.sh db migrate:up                      # 執行 migration"
  echo "  4. 如果有問題: ./scripts/cli.sh db migrate:down       # 回滾"
  echo ""
}

# 切換到專案根目錄
cd "$PROJECT_ROOT"

# 解析環境參數
parse_env_option() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --env)
        ENVIRONMENT="$2"
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done
}

# 驗證環境
validate_environment() {
  case "$ENVIRONMENT" in
    development|uat|production)
      log_info "環境: ${CYAN}$ENVIRONMENT${NC}"
      ;;
    *)
      log_error "無效的環境: $ENVIRONMENT"
      echo "支援的環境: development, uat, production"
      exit 1
      ;;
  esac
}

# 生產環境安全確認
production_safety_check() {
  local action="$1"

  if [[ "$ENVIRONMENT" == "production" ]]; then
    log_warning "⚠️  您正在操作 ${RED}生產環境${NC}！"
    echo ""
    echo "操作: $action"
    echo "環境: PRODUCTION"
    echo ""

    if ! confirm "確定要繼續嗎？這可能影響線上服務。" "n"; then
      log_info "已取消"
      exit 0
    fi

    # 額外確認
    echo ""
    log_warning "請輸入 'PRODUCTION' 以確認："
    read -r confirmation
    if [[ "$confirmation" != "PRODUCTION" ]]; then
      log_error "確認失敗，已取消操作"
      exit 1
    fi
  fi
}

# 獲取資料庫 URL（根據環境）
get_database_url() {
  local env_file=""
  case "$ENVIRONMENT" in
    development)
      env_file="$PROJECT_ROOT/apps/backend/.env"
      ;;
    sit)
      env_file="$PROJECT_ROOT/apps/backend/.env.sit"
      ;;
    staging)
      env_file="$PROJECT_ROOT/apps/backend/.env.staging"
      ;;
    uat)
      env_file="$PROJECT_ROOT/apps/backend/.env.uat"
      ;;
    production)
      env_file="$PROJECT_ROOT/apps/backend/.env.production"
      ;;
  esac

  if [[ -f "$env_file" ]]; then
    source "$env_file"
    echo "$DATABASE_URL"
  else
    log_error "環境配置文件不存在: $env_file"
    exit 1
  fi
}

# 解析子命令
SUBCOMMAND="${1:-}"

if [[ -z "$SUBCOMMAND" ]]; then
  show_command_help
  exit 0
fi

shift

# 解析環境選項
parse_env_option "$@"

# 驗證環境（cleanup 命令除外，它可以使用 "all"）
if [[ "$SUBCOMMAND" != "cleanup" ]]; then
  validate_environment
fi

# ==========================================
# 子命令: migrate create
# ==========================================
db_migrate_create() {
  local migration_name="${1:-}"

  if [[ -z "$migration_name" ]]; then
    log_error "請提供 migration 名稱"
    echo "使用方式: ./scripts/cli.sh db migrate create <name>"
    echo "範例: ./scripts/cli.sh db migrate create \"add_user_profile\""
    exit 1
  fi

  print_header "建立新的 Migration"

  log_info "Migration 名稱: $migration_name"

  # 切換到 database package
  cd apps/backend

  # 建立 migration
  if pnpm prisma migrate dev --name "$migration_name" --create-only; then
    log_success "Migration 已建立"
    echo ""
    log_info "下一步："
    echo "  1. 檢查產生的 migration 檔案"
    echo "  2. 執行: ./scripts/cli.sh db migrate:up"
  else
    log_error "Migration 建立失敗"
    exit 1
  fi

  cd ../..
}

# ==========================================
# 子命令: migrate:up (執行 migrations)
# ==========================================
db_migrate_up() {
  print_header "執行 Database Migrations"

  production_safety_check "執行 database migrations"

  log_info "檢查待執行的 migrations..."

  # 切換到 database package
  cd apps/backend

  # 設置資料庫 URL
  export DATABASE_URL=$(get_database_url)

  # 執行 migrations
  log_info "執行 prisma migrate deploy..."
  if pnpm prisma migrate deploy; then
    log_success "Migrations 執行完成"

    # 產生 Prisma Client
    log_info "更新 Prisma Client..."
    pnpm prisma generate

    log_success "資料庫更新完成"
  else
    log_error "Migrations 執行失敗"
    exit 1
  fi

  cd ../..
}

# ==========================================
# 子命令: migrate:down (回滾)
# ==========================================
db_migrate_down() {
  print_header "回滾 Migration"

  production_safety_check "回滾 migration"

  log_warning "此操作將回滾最後一次 migration"

  if ! confirm "確定要繼續嗎?" "n"; then
    log_info "已取消"
    exit 0
  fi

  # 切換到 database package
  cd apps/backend

  # 設置資料庫 URL
  export DATABASE_URL=$(get_database_url)

  # 回滾 migration
  log_info "回滾最後一次 migration..."
  if pnpm prisma migrate resolve --rolled-back "$(pnpm prisma migrate status | grep "migration name" | tail -1 | awk '{print $3}')"; then
    log_success "Migration 已回滾"

    # 重新產生 Prisma Client
    log_info "更新 Prisma Client..."
    pnpm prisma generate

    log_success "回滾完成"
  else
    log_error "回滾失敗"
    exit 1
  fi

  cd ../..
}

# ==========================================
# 子命令: migrate:status
# ==========================================
db_migrate_status() {
  print_header "Migration 狀態"

  # 切換到 database package
  cd apps/backend

  # 設置資料庫 URL
  export DATABASE_URL=$(get_database_url)

  log_info "查詢 migration 狀態..."
  echo ""

  pnpm prisma migrate status

  cd ../..
}

# ==========================================
# 子命令: reset
# ==========================================
db_reset() {
  print_header "重置資料"

  log_info "環境: ${CYAN}$ENVIRONMENT${NC}"

  production_safety_check "重置資料（刪除所有資料）"

  # ==========================================
  # 檔案清理確認
  # ==========================================
  echo ""
  log_warning "重置資料庫時，是否也要清理上傳的檔案？"
  show_storage_status
  echo ""

  local clean_files_flag=false
  if confirm "是否清理所有上傳的檔案？" "n"; then
    clean_files_flag=true
    log_info "將清理檔案儲存"
  else
    log_info "保留現有檔案（可能導致孤立檔案）"
  fi


  log_warning "此操作將清空所有資料！"
  if ! confirm "確定要繼續嗎?" "n"; then
    log_info "已取消"
    exit 0
  fi

  # 切換到 database package
  cd apps/backend

  # 設置資料庫 URL
  export DATABASE_URL=$(get_database_url)

  log_step "1/3 重置 schema"
  if pnpm prisma migrate reset --force --skip-seed; then
    log_success "Schema 已重置"
  else
    log_error "Schema 重置失敗"
    exit 1
  fi

  log_step "2/3 產生 Prisma Client"
  if pnpm prisma generate; then
    log_success "Prisma Client 已產生"
  else
    log_error "Prisma Client 產生失敗"
    exit 1
  fi

  log_step "3/3 載入種子資料"
  export NPT_ENV="$ENVIRONMENT"
  log_info "Seed 環境: $NPT_ENV"
  if pnpm db:seed; then
    log_success "種子資料已載入"
  else
    log_error "種子資料載入失敗"
    exit 1
  fi

  cd ../..

  # 清理檔案儲存（如果用戶選擇）
  if [[ "$clean_files_flag" == true ]]; then
    echo ""
    log_step "清理檔案儲存"
    clean_files true
  fi

  echo ""
  log_success "資料庫重置完成！"

  if [[ "$ENVIRONMENT" == "development" ]]; then
    echo ""
    echo "測試帳號："
    echo "  HQ:     hq@example.com    / Password123!"
    echo "  Public: public@example.com / Password123!"
    echo ""
  fi
}

# ==========================================
# 子命令: seed
# ==========================================
db_seed() {
  print_header "重新載入種子資料"

  if [[ "$ENVIRONMENT" == "production" ]]; then
    log_error "生產環境不支援 seed 操作"
    exit 1
  fi

  cd apps/backend

  # 設置資料庫 URL
  export DATABASE_URL=$(get_database_url)

  export NPT_ENV="$ENVIRONMENT"
  log_info "載入種子資料...（環境: ${NPT_ENV}）"
  if pnpm db:seed; then
    log_success "種子資料已載入"
  else
    log_error "種子資料載入失敗"
    exit 1
  fi

  cd ../..
}

# ==========================================
# 子命令: backup
# ==========================================
db_backup() {
  print_header "備份資料（資料庫 + 檔案儲存）"

  log_info "目標環境: ${CYAN}$ENVIRONMENT${NC}"
  echo ""

  # 建立備份目錄
  BACKUP_DIR="$PROJECT_ROOT/backups/$ENVIRONMENT"
  mkdir -p "$BACKUP_DIR"

  # 產生備份檔案名稱
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_FILE="$BACKUP_DIR/mead_db_${ENVIRONMENT}_$TIMESTAMP.sql"
  BACKUP_FILE_GZ="$BACKUP_FILE.gz"

  log_step "備份資料庫"

  # 根據環境獲取連線資訊
  case "$ENVIRONMENT" in
    development)
      if [[ -f ".env.docker" ]]; then
        source .env.docker
        export PGPASSWORD="$POSTGRES_PASSWORD"
        PG_HOST="localhost"
        PG_PORT="${POSTGRES_PORT:-5432}"
        PG_USER="${POSTGRES_USER:-postgres}"
        PG_DB="${POSTGRES_DB:-mead_db}"
      else
        log_error ".env.docker 不存在"
        exit 1
      fi
      ;;
    uat|production)
      # 從環境的 .env 檔案解析 DATABASE_URL
      DATABASE_URL=$(get_database_url)
      # 解析 DATABASE_URL (格式: postgresql://user:password@host:port/database)
      PG_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
      PG_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
      PG_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
      PG_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
      PG_DB=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
      export PGPASSWORD="$PG_PASS"
      ;;
  esac

  # 執行備份
  log_info "正在備份資料庫..."

  case "$ENVIRONMENT" in
    development)
      # 開發環境：簡單備份
      CONTAINER_NAME=$(get_container_name timescaledb)
      log_info "使用 Docker 容器執行備份: $CONTAINER_NAME"
      if docker exec "$CONTAINER_NAME" pg_dump -U "$PG_USER" -d "$PG_DB" > "$BACKUP_FILE"; then
        backup_success=true
      else
        backup_success=false
      fi
      ;;
    uat|production)
      # UAT/生產環境：加上 --clean 選項以支援安全還原
      log_info "使用 --clean 模式備份（支援安全還原）"
      if command -v pg_dump &> /dev/null; then
        if pg_dump \
          --clean \
          --if-exists \
          --no-owner \
          --no-privileges \
          -h "$PG_HOST" \
          -p "$PG_PORT" \
          -U "$PG_USER" \
          -d "$PG_DB" \
          > "$BACKUP_FILE"; then
          backup_success=true
        else
          backup_success=false
        fi
      else
        log_error "找不到 pg_dump 命令，請安裝 PostgreSQL 客戶端"
        log_info "macOS: brew install postgresql"
        log_info "Ubuntu/Debian: sudo apt-get install postgresql-client"
        exit 1
      fi
      ;;
  esac

  if [ "$backup_success" = true ]; then

    # 壓縮備份檔案
    log_info "壓縮備份檔案..."
    if gzip "$BACKUP_FILE"; then
      BACKUP_FILE="$BACKUP_FILE_GZ"
      log_success "備份完成（已壓縮）"
    else
      log_success "備份完成（未壓縮）"
    fi

    # 顯示備份資訊
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo ""
    echo -e "  ${CYAN}環境:${NC} $ENVIRONMENT"
    echo -e "  ${CYAN}檔案:${NC} $(basename "$BACKUP_FILE")"
    echo -e "  ${CYAN}路徑:${NC} $BACKUP_FILE"
    echo -e "  ${CYAN}大小:${NC} $BACKUP_SIZE"
    echo ""

    # 列出此環境的所有備份
    log_info "環境 $ENVIRONMENT 的最近備份："
    find "$BACKUP_DIR" -maxdepth 1 \( -name "*.sql.gz" -o -name "*.sql" \) -type f -exec ls -lht {} + 2>/dev/null | head -5 | while read -r line; do
      size=$(echo "$line" | awk '{print $5}')
      date=$(echo "$line" | awk '{print $6, $7, $8}')
      file=$(echo "$line" | awk '{print $9}')
      filename=$(basename "$file")
      echo -e "  • $filename  ${DIM}($size, $date)${NC}"
    done || true
    echo ""

    # 顯示備份統計
    echo ""
    local backup_count=$(find "$BACKUP_DIR" -maxdepth 1 \( -name "*.sql.gz" -o -name "*.sql" \) -type f 2>/dev/null | wc -l | tr -d ' ')
    log_info "共有 $backup_count 個備份"

    # ==========================================
    # 備份檔案儲存
    # ==========================================
    echo ""
    log_info "開始檔案儲存備份..."
    backup_files "$BACKUP_DIR" "$TIMESTAMP" || log_warning "檔案備份失敗，但資料庫備份成功"
    echo ""
    log_success "資料備份完成（資料庫 + 檔案儲存）"

  else
    log_error "備份失敗"
    rm -f "$BACKUP_FILE" 2>/dev/null
    exit 1
  fi

  unset PGPASSWORD
}

# ==========================================
# 子命令: restore
# ==========================================
db_restore() {
  local backup_file="${1:-}"

  if [[ -z "$backup_file" ]]; then
    log_error "請指定備份檔案"
    echo "使用方式: ./scripts/cli.sh db restore <backup_file> [--env <environment>]"
    echo ""

    # 列出可用的備份
    if [[ -d "backups/$ENVIRONMENT" ]] && (ls backups/$ENVIRONMENT/*.sql &> /dev/null || ls backups/$ENVIRONMENT/*.sql.gz &> /dev/null); then
      log_info "環境 $ENVIRONMENT 的可用備份："
      (ls -lht backups/$ENVIRONMENT/*.sql backups/$ENVIRONMENT/*.sql.gz 2>/dev/null) | head -5 | while read -r line; do
        size=$(echo "$line" | awk '{print $5}')
        date=$(echo "$line" | awk '{print $6, $7, $8}')
        file=$(echo "$line" | awk '{print $9}')
        filename=$(basename "$file")
        echo -e "  • $filename  ${DIM}($size, $date)${NC}"
      done
    fi
    exit 1
  fi

  if [[ ! -f "$backup_file" ]]; then
    log_error "備份檔案不存在: $backup_file"
    exit 1
  fi

  print_header "還原資料（資料庫 + 檔案儲存）"

  log_info "目標環境: ${CYAN}$ENVIRONMENT${NC}"
  echo ""

  # 生產環境額外確認
  if [[ "$ENVIRONMENT" == "production" ]]; then
    log_warning "⚠️  生產環境還原 - 這是一個高風險操作！"
    echo ""
    echo "備份資訊："
    echo "  檔案: $(basename "$backup_file")"
    echo "  大小: $(du -h "$backup_file" | cut -f1)"
    if [[ -f "$backup_file" ]]; then
      echo "  修改時間: $(date -r "$backup_file" '+%Y-%m-%d %H:%M:%S')"
    fi
    echo ""
    echo "這將會："
    echo "  1. 建立緊急備份"
    echo "  2. 中斷所有資料庫連線"
    echo "  3. 清理現有資料結構"
    echo "  4. 還原備份資料"
    echo ""
    log_warning "請輸入 'RESTORE PRODUCTION' 確認："
    read -r confirmation
    if [[ "$confirmation" != "RESTORE PRODUCTION" ]]; then
      log_error "確認失敗，已取消還原"
      exit 1
    fi
  fi

  production_safety_check "還原資料庫（覆蓋現有資料）"

  log_warning "此操作將覆蓋現有資料！"
  if ! confirm "確定要繼續嗎?" "n"; then
    log_info "已取消"
    exit 0
  fi

  # 根據環境獲取連線資訊
  case "$ENVIRONMENT" in
    development)
      if [[ -f ".env.docker" ]]; then
        source .env.docker
        export PGPASSWORD="$POSTGRES_PASSWORD"
        PG_HOST="localhost"
        PG_PORT="${POSTGRES_PORT:-5432}"
        PG_USER="${POSTGRES_USER:-postgres}"
        PG_DB="${POSTGRES_DB:-mead_db}"
      else
        log_error ".env.docker 不存在"
        exit 1
      fi
      ;;
    uat|production)
      DATABASE_URL=$(get_database_url)
      PG_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
      PG_PASS=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
      PG_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
      PG_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
      PG_DB=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
      export PGPASSWORD="$PG_PASS"
      ;;
  esac

  log_info "準備還原資料庫..."

  # 還原流程依環境而定
  case "$ENVIRONMENT" in
    development)
      # 開發環境：完全重建資料庫（快速簡單）
      CONTAINER_NAME=$(get_container_name timescaledb)
      log_warning "開發環境將完全重建資料庫..."

      # 中斷所有連線
      docker exec "$CONTAINER_NAME" psql -U "$PG_USER" -d postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$PG_DB' AND pid <> pg_backend_pid();" &>/dev/null || true

      # 刪除並重建資料庫
      log_info "重建資料庫 $PG_DB..."
      docker exec "$CONTAINER_NAME" psql -U "$PG_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$PG_DB\";" || true
      docker exec "$CONTAINER_NAME" psql -U "$PG_USER" -d postgres -c "CREATE DATABASE \"$PG_DB\";" || {
        log_error "無法重建資料庫"
        exit 1
      }
      log_success "資料庫已重建"
      ;;

    uat|production)
      # UAT/生產環境：安全還原流程
      log_warning "生產環境使用安全還原流程..."

      if ! command -v psql &> /dev/null; then
        log_error "找不到 psql 命令，請安裝 PostgreSQL 客戶端"
        log_info "macOS: brew install postgresql"
        log_info "Ubuntu/Debian: sudo apt-get install postgresql-client"
        exit 1
      fi

      # 步驟 1: 建立緊急備份
      EMERGENCY_BACKUP="$BACKUP_DIR/emergency_backup_${ENVIRONMENT}_$(date +%Y%m%d_%H%M%S).sql"
      log_info "建立緊急備份..."
      if pg_dump -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" > "$EMERGENCY_BACKUP" 2>/dev/null; then
        log_success "緊急備份已建立: $(basename "$EMERGENCY_BACKUP")"
        # 壓縮緊急備份
        gzip "$EMERGENCY_BACKUP" &
      else
        log_warning "緊急備份失敗（可能是資料庫為空），繼續還原..."
      fi

      # 步驟 2: 中斷所有連線
      log_info "中斷所有資料庫連線..."
      psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$PG_DB' AND pid <> pg_backend_pid();" &>/dev/null || true

      # 步驟 3: 清理 Schema（保留資料庫）
      log_info "清理資料庫結構（保留資料庫設定）..."
      psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c "DROP SCHEMA IF EXISTS public CASCADE;" || {
        log_error "無法刪除 schema"
        exit 1
      }
      psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c "CREATE SCHEMA public;" || {
        log_error "無法建立 schema"
        exit 1
      }
      psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c "GRANT ALL ON SCHEMA public TO $PG_USER;" || true
      psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c "GRANT ALL ON SCHEMA public TO public;" || true

      log_success "資料庫結構已清理"
      ;;
  esac

  log_info "開始還原資料..."

  # 檢查是否為壓縮檔
  local restore_success=false

  case "$ENVIRONMENT" in
    development)
      # 開發環境使用 Docker
      CONTAINER_NAME=$(get_container_name timescaledb)

      if [[ "$backup_file" == *.gz ]]; then
        log_info "偵測到壓縮檔，正在解壓縮並還原..."
        if gunzip -c "$backup_file" | docker exec -i "$CONTAINER_NAME" psql -U "$PG_USER" -d "$PG_DB" -q; then
          restore_success=true
        fi
      else
        log_info "還原未壓縮備份..."
        if docker exec -i "$CONTAINER_NAME" psql -U "$PG_USER" -d "$PG_DB" -q < "$backup_file"; then
          restore_success=true
        fi
      fi
      ;;

    uat|production)
      # 遠端環境使用 psql（需要安裝 PostgreSQL 客戶端）
      if ! command -v psql &> /dev/null; then
        log_error "找不到 psql 命令，請安裝 PostgreSQL 客戶端"
        log_info "macOS: brew install postgresql"
        log_info "Ubuntu/Debian: sudo apt-get install postgresql-client"
        exit 1
      fi

      if [[ "$backup_file" == *.gz ]]; then
        log_info "偵測到壓縮檔，正在解壓縮並還原..."
        if gunzip -c "$backup_file" | psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -q; then
          restore_success=true
        fi
      else
        log_info "還原未壓縮備份..."
        if psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -q < "$backup_file"; then
          restore_success=true
        fi
      fi
      ;;
  esac

  if [ "$restore_success" = true ]; then
    log_success "資料庫還原完成"

    # 驗證資料完整性
    log_info "驗證資料完整性..."

    case "$ENVIRONMENT" in
      development)
        CONTAINER_NAME=$(get_container_name timescaledb)
        # 檢查關鍵資料表
        local user_count=$(docker exec "$CONTAINER_NAME" psql -U "$PG_USER" -d "$PG_DB" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
        local role_count=$(docker exec "$CONTAINER_NAME" psql -U "$PG_USER" -d "$PG_DB" -t -c "SELECT COUNT(*) FROM roles;" 2>/dev/null | tr -d ' ')

        if [[ "$user_count" =~ ^[0-9]+$ ]]; then
          log_success "Users 表: $user_count 筆記錄"
        else
          log_warning "無法驗證 users 表"
        fi

        if [[ "$role_count" =~ ^[0-9]+$ ]]; then
          log_success "Roles 表: $role_count 筆記錄"
        else
          log_warning "無法驗證 roles 表"
        fi
        ;;

      uat|production)
        # 檢查關鍵資料表
        local user_count=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')
        local role_count=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -t -c "SELECT COUNT(*) FROM roles;" 2>/dev/null | tr -d ' ')

        if [[ "$user_count" =~ ^[0-9]+$ ]]; then
          log_success "Users 表: $user_count 筆記錄"
        else
          log_warning "無法驗證 users 表"
        fi

        if [[ "$role_count" =~ ^[0-9]+$ ]]; then
          log_success "Roles 表: $role_count 筆記錄"
        else
          log_warning "無法驗證 roles 表"
        fi

        # 生產環境額外提醒
        if [[ "$ENVIRONMENT" == "production" ]]; then
          echo ""
          log_warning "生產環境還原完成，請執行以下檢查："
          echo "  1. 測試關鍵功能（登入、註冊等）"
          echo "  2. 檢查應用服務是否正常"
          echo "  3. 監控錯誤日誌"
          echo "  4. 如有問題，緊急備份位於: $BACKUP_DIR"
        fi
        ;;
    esac
  else
    log_error "資料庫還原失敗"
    exit 1
  fi


  # ==========================================
  # 還原檔案儲存
  # ==========================================
  echo ""
  log_info "檢查檔案備份..."

  # 從備份檔名提取時間戳記
  local backup_basename=$(basename "$backup_file")
  local timestamp=""

  if [[ "$backup_basename" =~ _([0-9]{8}_[0-9]{6}) ]]; then
    timestamp="${BASH_REMATCH[1]}"
    local backup_dir=$(dirname "$backup_file")

    # 檢查是否有對應的檔案備份
    if [[ -f "$backup_dir/files_${timestamp}.tar.gz" ]] || \
       [[ -f "$backup_dir/files_s3_${timestamp}.tar.gz" ]] || \
       [[ -f "$backup_dir/files_${timestamp}_empty.marker" ]]; then
      log_info "發現檔案備份，開始還原..."
      restore_files "$backup_dir" "$timestamp" || log_warning "檔案還原失敗，但資料庫已還原"
    else
      log_warning "未找到檔案備份（可能是舊版備份）"
    fi
  fi

  unset PGPASSWORD
}

# ==========================================
# 子命令: cleanup (清理舊備份)
# ==========================================
db_cleanup() {
  local target_env=""
  local keep_count=5

  # 解析參數
  while [[ $# -gt 0 ]]; do
    case $1 in
      --env)
        target_env="$2"
        shift 2
        ;;
      --keep)
        keep_count="$2"
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done

  # 驗證環境（對於非 "all" 的情況）
  if [[ "$target_env" != "all" ]]; then
    case "$target_env" in
      development|uat|production)
        ;;
      *)
        log_error "無效的環境: $target_env"
        echo "支援的環境: development, uat, production, all"
        exit 1
        ;;
    esac
  fi

  # 驗證保留數量
  if ! [[ "$keep_count" =~ ^[0-9]+$ ]]; then
    log_error "保留數量必須是數字"
    exit 1
  fi

  if [ "$keep_count" -eq 0 ]; then
    log_warning "保留數量為 0 將刪除所有備份！"
    if ! confirm "確定要刪除所有備份嗎？" "n"; then
      log_info "已取消"
      exit 0
    fi
  fi

  print_header "清理舊備份"

  BACKUP_BASE="$PROJECT_ROOT/backups"

  # 確定要清理的環境
  local envs_to_clean=()
  if [ "$target_env" = "all" ]; then
    envs_to_clean=("development" "uat" "production")
  else
    envs_to_clean=("$target_env")
  fi

  log_info "保留最近 $keep_count 個備份，刪除更舊的備份"
  echo ""

  local total_deleted=0
  local total_freed=0

  for env in "${envs_to_clean[@]}"; do
    local env_dir="$BACKUP_BASE/$env"

    if [[ ! -d "$env_dir" ]]; then
      continue
    fi

    # 計算備份數量（包含 .sql 和 .sql.gz）
    local backup_count=$(find "$env_dir" \( -name "*.sql" -o -name "*.sql.gz" \) -type f 2>/dev/null | wc -l | tr -d ' ')

    if [ "$backup_count" -eq 0 ]; then
      log_info "環境 $env: 沒有備份"
      continue
    fi

    if [ "$backup_count" -le "$keep_count" ]; then
      log_info "環境 $env: 只有 $backup_count 個備份，無需清理"
      continue
    fi

    log_info "環境 $env: 發現 $backup_count 個備份"

    # 列出要刪除的備份（保留最新的 keep_count 個）
    local files_to_delete=$(find "$env_dir" \( -name "*.sql" -o -name "*.sql.gz" \) -type f -print0 2>/dev/null | xargs -0 ls -t | tail -n +$((keep_count + 1)))

    if [ -n "$files_to_delete" ]; then
      # 先計算要刪除的檔案統計（在刪除前）
      local deleted_count=$(echo "$files_to_delete" | wc -l | tr -d ' ')
      local freed_bytes=0

      # 計算總大小
      while IFS= read -r backup; do
        if [ -f "$backup" ]; then
          local size=$(du -b "$backup" 2>/dev/null | cut -f1 || echo "0")
          freed_bytes=$((freed_bytes + size))
        fi
      done <<< "$files_to_delete"

      # 顯示並刪除檔案
      while IFS= read -r backup; do
        if [ -f "$backup" ]; then
          log_info "  刪除: $(basename "$backup")"
          rm "$backup"
        fi
      done <<< "$files_to_delete"

      total_deleted=$((total_deleted + deleted_count))
      total_freed=$((total_freed + freed_bytes))

      log_success "環境 $env: 刪除了 $deleted_count 個備份，釋放 $((freed_bytes / 1024 / 1024))MB"
    fi
  done

  echo ""
  if [ $total_deleted -gt 0 ]; then
    local freed_mb=$((total_freed / 1024 / 1024))
    log_success "清理完成：共刪除 $total_deleted 個備份，釋放 ${freed_mb}MB 空間"
  else
    log_info "沒有需要清理的備份"
  fi
}

# ==========================================
# 子命令: studio
# ==========================================
db_studio() {
  print_header "開啟 Prisma Studio"

  cd apps/backend

  # 設置資料庫 URL
  export DATABASE_URL=$(get_database_url)

  log_info "啟動 Prisma Studio..."
  log_info "環境: $ENVIRONMENT"
  log_info "將在瀏覽器中開啟 http://localhost:5555"
  echo ""

  if [[ "$ENVIRONMENT" == "production" ]]; then
    log_warning "⚠️  您正在連接生產環境資料庫！"
    if ! confirm "確定要繼續嗎?" "n"; then
      log_info "已取消"
      exit 0
    fi
  fi

  pnpm prisma studio

  cd ../..
}

# ==========================================
# 子命令: adminer（啟動 Adminer DB GUI）
# ==========================================
db_adminer() {
  print_header "資料庫瀏覽工具（Adminer）"

  ADMINER_PORT="${ADMINER_PORT:-5556}"
  ADMINER_URL="http://localhost:${ADMINER_PORT}"

  if docker ps --format '{{.Names}}' | grep -q '^mead-adminer$'; then
    log_success "Adminer 已運行：${ADMINER_URL}"
  else
    log_info "Adminer 容器未運行，嘗試啟動..."
    if docker compose --env-file "${PROJECT_ROOT}/.env.docker" up -d adminer 2>/dev/null \
        || docker-compose --env-file "${PROJECT_ROOT}/.env.docker" up -d adminer 2>/dev/null; then
      sleep 2
      log_success "Adminer 已啟動：${ADMINER_URL}"
    else
      log_warning "啟動 Adminer 失敗（可能 .env.docker 不存在）。"
      log_info "請先 cp .env.docker.example .env.docker，再 docker compose up -d adminer"
      return 1
    fi
  fi

  echo ""
  log_info "登入資訊（從 .env.docker）："
  echo "  System:   PostgreSQL"
  echo "  Server:   timescaledb"
  echo "  Username: \${POSTGRES_USER:-postgres}"
  echo "  Password: 見 .env.docker"
  echo "  Database: \${POSTGRES_DB:-mead_db}"

  if command -v open >/dev/null 2>&1; then
    open "$ADMINER_URL" 2>/dev/null || true
  fi
}

# ==========================================
# 子命令: generate
# ==========================================
db_generate() {
  print_header "產生 Prisma Client"

  cd apps/backend

  log_info "產生 Prisma Client..."
  if pnpm prisma generate; then
    log_success "Prisma Client 已產生"
  else
    log_error "Prisma Client 產生失敗"
    exit 1
  fi

  cd ../..
}

# ==========================================
# 路由子命令
# ==========================================
case "$SUBCOMMAND" in
  migrate)
    # migrate 有子命令
    SUB_ACTION="${1:-}"
    if [[ "$SUB_ACTION" == "create" ]]; then
      shift
      db_migrate_create "$@"
    else
      show_command_help
    fi
    ;;
  migrate:create)
    # 與 migrate:up / migrate:down / migrate:status 同風格
    db_migrate_create "$@"
    ;;
  migrate:up)
    db_migrate_up "$@"
    ;;
  migrate:down)
    db_migrate_down "$@"
    ;;
  migrate:status)
    db_migrate_status "$@"
    ;;
  reset)
    db_reset "$@"
    ;;
  seed)
    db_seed "$@"
    ;;
  backup)
    db_backup "$@"
    ;;
  restore)
    db_restore "$@"
    ;;
  cleanup)
    db_cleanup "$@"
    ;;
  studio)
    db_studio "$@"
    ;;
  adminer|db-ui)
    db_adminer "$@"
    ;;
  generate)
    db_generate "$@"
    ;;
  -h|--help)
    show_command_help
    ;;
  *)
    log_error "未知的子命令: $SUBCOMMAND"
    echo ""
    show_command_help
    exit 1
    ;;
esac
