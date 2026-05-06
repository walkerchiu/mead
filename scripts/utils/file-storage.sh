#!/bin/bash

# ==========================================
# 檔案儲存管理工具
# 支援 Local / SeaweedFS / AWS S3
# ==========================================

set -euo pipefail

# 載入共用函數
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# ==========================================
# 獲取儲存類型
# ==========================================
get_storage_type() {
  local env_file="$PROJECT_ROOT/apps/backend/.env"

  if [[ -f "$env_file" ]]; then
    local storage_type=$(grep "^FILE_STORAGE_TYPE=" "$env_file" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    echo "${storage_type:-local}"
  else
    echo "local"
  fi
}

# ==========================================
# 獲取上傳目錄路徑
# ==========================================
get_upload_dir() {
  local env_file="$PROJECT_ROOT/apps/backend/.env"

  if [[ -f "$env_file" ]]; then
    local upload_dir=$(grep "^UPLOAD_DIR=" "$env_file" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    if [[ -n "$upload_dir" ]]; then
      # 處理相對路徑
      if [[ "$upload_dir" == ./* ]]; then
        echo "$PROJECT_ROOT/apps/backend/${upload_dir#./}"
      else
        echo "$upload_dir"
      fi
      return
    fi
  fi

  # 預設路徑
  echo "$PROJECT_ROOT/apps/backend/uploads"
}

# ==========================================
# 獲取 S3 配置
# ==========================================
get_s3_config() {
  local env_file="$PROJECT_ROOT/apps/backend/.env"

  if [[ ! -f "$env_file" ]]; then
    log_error ".env 檔案不存在"
    return 1
  fi

  export S3_ENDPOINT=$(grep "^S3_ENDPOINT=" "$env_file" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  export S3_ACCESS_KEY_ID=$(grep "^S3_ACCESS_KEY_ID=" "$env_file" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  export S3_SECRET_ACCESS_KEY=$(grep "^S3_SECRET_ACCESS_KEY=" "$env_file" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  export S3_BUCKET=$(grep "^S3_BUCKET=" "$env_file" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  export AWS_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID"
  export AWS_SECRET_ACCESS_KEY="$S3_SECRET_ACCESS_KEY"

  if [[ -z "$S3_ENDPOINT" ]] || [[ -z "$S3_ACCESS_KEY_ID" ]] || [[ -z "$S3_BUCKET" ]]; then
    log_error "S3 配置不完整"
    return 1
  fi
}

# ==========================================
# 備份檔案儲存
# ==========================================
backup_files() {
  local backup_dir="$1"
  local timestamp="$2"

  log_info "開始備份檔案儲存..."

  local storage_type=$(get_storage_type)
  log_info "儲存類型: $storage_type"

  case "$storage_type" in
    local)
      backup_local_files "$backup_dir" "$timestamp"
      ;;
    seaweedfs|s3)
      backup_s3_files "$backup_dir" "$timestamp"
      ;;
    *)
      log_warning "未知的儲存類型: ${storage_type}，跳過檔案備份"
      return 0
      ;;
  esac
}

# ==========================================
# 備份本地檔案
# ==========================================
backup_local_files() {
  local backup_dir="$1"
  local timestamp="$2"

  local upload_dir=$(get_upload_dir)

  if [[ ! -d "$upload_dir" ]]; then
    log_warning "上傳目錄不存在: $upload_dir"
    log_info "建立空的檔案備份標記..."
    touch "$backup_dir/files_${timestamp}_empty.marker"
    return 0
  fi

  # 檢查是否有檔案
  if [[ -z "$(ls -A "$upload_dir" 2>/dev/null)" ]]; then
    log_info "上傳目錄為空，建立空標記"
    touch "$backup_dir/files_${timestamp}_empty.marker"
    return 0
  fi

  local backup_file="$backup_dir/files_${timestamp}.tar.gz"

  log_info "打包上傳目錄: $upload_dir"

  # 統計檔案數量和大小
  local file_count=$(find "$upload_dir" -type f | wc -l | tr -d ' ')
  local dir_size=$(du -sh "$upload_dir" | cut -f1)

  log_info "檔案數量: $file_count"
  log_info "目錄大小: $dir_size"

  # 打包檔案（排除 .DS_Store）
  if tar -czf "$backup_file" \
    --exclude='.DS_Store' \
    --exclude='._*' \
    -C "$(dirname "$upload_dir")" \
    "$(basename "$upload_dir")" 2>/dev/null; then

    local backup_size=$(du -h "$backup_file" | cut -f1)
    log_success "檔案備份完成"
    echo -e "  ${CYAN}備份檔案:${NC} $(basename "$backup_file")"
    echo -e "  ${CYAN}壓縮後大小:${NC} $backup_size"
    echo -e "  ${CYAN}包含檔案:${NC} $file_count 個"
    return 0
  else
    log_error "檔案備份失敗"
    return 1
  fi
}

# ==========================================
# 備份 S3 檔案
# ==========================================
backup_s3_files() {
  local backup_dir="$1"
  local timestamp="$2"

  if ! command -v aws &> /dev/null; then
    log_error "未安裝 AWS CLI，無法備份 S3 檔案"
    log_info "安裝方式: brew install awscli"
    return 1
  fi

  get_s3_config || return 1

  local backup_s3_dir="$backup_dir/s3_${timestamp}"
  mkdir -p "$backup_s3_dir"

  log_info "同步 S3 Bucket: $S3_BUCKET"
  log_info "目標目錄: $backup_s3_dir"

  # 使用 AWS CLI 同步 S3 內容
  if aws --endpoint-url="$S3_ENDPOINT" s3 sync \
    "s3://$S3_BUCKET/" \
    "$backup_s3_dir" \
    --no-progress \
    --quiet 2>/dev/null; then

    # 統計
    local file_count=$(find "$backup_s3_dir" -type f | wc -l | tr -d ' ')
    local dir_size=$(du -sh "$backup_s3_dir" | cut -f1)

    # 打包
    local backup_file="$backup_dir/files_s3_${timestamp}.tar.gz"
    tar -czf "$backup_file" -C "$backup_dir" "s3_${timestamp}" 2>/dev/null
    rm -rf "$backup_s3_dir"

    local backup_size=$(du -h "$backup_file" | cut -f1)
    log_success "S3 檔案備份完成"
    echo -e "  ${CYAN}備份檔案:${NC} $(basename "$backup_file")"
    echo -e "  ${CYAN}壓縮後大小:${NC} $backup_size"
    echo -e "  ${CYAN}包含檔案:${NC} $file_count 個"
    return 0
  else
    log_error "S3 同步失敗"
    return 1
  fi
}

# ==========================================
# 還原檔案儲存
# ==========================================
restore_files() {
  local backup_dir="$1"
  local timestamp="$2"

  log_info "開始還原檔案儲存..."

  local storage_type=$(get_storage_type)
  log_info "儲存類型: $storage_type"

  case "$storage_type" in
    local)
      restore_local_files "$backup_dir" "$timestamp"
      ;;
    seaweedfs|s3)
      restore_s3_files "$backup_dir" "$timestamp"
      ;;
    *)
      log_warning "未知的儲存類型: ${storage_type}，跳過檔案還原"
      return 0
      ;;
  esac
}

# ==========================================
# 還原本地檔案
# ==========================================
restore_local_files() {
  local backup_dir="$1"
  local timestamp="$2"

  local backup_file="$backup_dir/files_${timestamp}.tar.gz"
  local empty_marker="$backup_dir/files_${timestamp}_empty.marker"
  local upload_dir=$(get_upload_dir)

  # 檢查是否有備份
  if [[ -f "$empty_marker" ]]; then
    log_info "備份時檔案目錄為空，清空當前目錄"
    if [[ -d "$upload_dir" ]]; then
      rm -rf "$upload_dir"
      mkdir -p "$upload_dir"
    fi
    log_success "檔案還原完成（空目錄）"
    return 0
  fi

  if [[ ! -f "$backup_file" ]]; then
    log_warning "未找到檔案備份: $(basename "$backup_file")"
    log_info "可能是舊版備份，跳過檔案還原"
    return 0
  fi

  # 確認操作
  if [[ -d "$upload_dir" ]] && [[ -n "$(ls -A "$upload_dir" 2>/dev/null)" ]]; then
    log_warning "目標目錄已存在檔案，將被覆蓋: $upload_dir"
    if ! confirm "確定要覆蓋現有檔案嗎?" "n"; then
      log_info "已取消檔案還原"
      return 0
    fi

    # 備份現有檔案
    local emergency_backup="$backup_dir/emergency_files_$(date +%Y%m%d_%H%M%S).tar.gz"
    log_info "建立緊急備份: $(basename "$emergency_backup")"
    tar -czf "$emergency_backup" \
      --exclude='.DS_Store' \
      --exclude='._*' \
      -C "$(dirname "$upload_dir")" \
      "$(basename "$upload_dir")" 2>/dev/null || true
  fi

  # 清空目標目錄
  log_info "清空目標目錄..."
  rm -rf "$upload_dir"
  mkdir -p "$(dirname "$upload_dir")"

  # 解壓縮
  log_info "解壓縮備份檔案..."
  if tar -xzf "$backup_file" -C "$(dirname "$upload_dir")" 2>/dev/null; then
    local file_count=$(find "$upload_dir" -type f 2>/dev/null | wc -l | tr -d ' ')
    local dir_size=$(du -sh "$upload_dir" 2>/dev/null | cut -f1)

    log_success "檔案還原完成"
    echo -e "  ${CYAN}目標目錄:${NC} $upload_dir"
    echo -e "  ${CYAN}檔案數量:${NC} $file_count 個"
    echo -e "  ${CYAN}目錄大小:${NC} $dir_size"
    return 0
  else
    log_error "檔案還原失敗"
    return 1
  fi
}

# ==========================================
# 還原 S3 檔案
# ==========================================
restore_s3_files() {
  local backup_dir="$1"
  local timestamp="$2"

  if ! command -v aws &> /dev/null; then
    log_error "未安裝 AWS CLI，無法還原 S3 檔案"
    return 1
  fi

  local backup_file="$backup_dir/files_s3_${timestamp}.tar.gz"

  if [[ ! -f "$backup_file" ]]; then
    log_warning "未找到 S3 備份: $(basename "$backup_file")"
    return 0
  fi

  get_s3_config || return 1

  # 確認操作
  log_warning "此操作將清空 S3 Bucket 並還原備份"
  if ! confirm "確定要繼續嗎?" "n"; then
    log_info "已取消 S3 還原"
    return 0
  fi

  # 解壓縮到臨時目錄
  local temp_dir="$backup_dir/temp_s3_restore"
  mkdir -p "$temp_dir"

  log_info "解壓縮 S3 備份..."
  tar -xzf "$backup_file" -C "$temp_dir" 2>/dev/null

  local s3_content_dir="$temp_dir/s3_${timestamp}"

  if [[ ! -d "$s3_content_dir" ]]; then
    log_error "備份內容錯誤"
    rm -rf "$temp_dir"
    return 1
  fi

  # 清空 S3 Bucket
  log_info "清空 S3 Bucket: $S3_BUCKET"
  aws --endpoint-url="$S3_ENDPOINT" s3 rm "s3://$S3_BUCKET/" --recursive --quiet 2>/dev/null || true

  # 上傳備份內容
  log_info "上傳備份內容到 S3..."
  if aws --endpoint-url="$S3_ENDPOINT" s3 sync \
    "$s3_content_dir/" \
    "s3://$S3_BUCKET/" \
    --no-progress \
    --quiet 2>/dev/null; then

    local file_count=$(find "$s3_content_dir" -type f | wc -l | tr -d ' ')

    log_success "S3 還原完成"
    echo -e "  ${CYAN}Bucket:${NC} $S3_BUCKET"
    echo -e "  ${CYAN}檔案數量:${NC} $file_count 個"

    # 清理
    rm -rf "$temp_dir"
    return 0
  else
    log_error "S3 還原失敗"
    rm -rf "$temp_dir"
    return 1
  fi
}

# ==========================================
# 清理檔案儲存
# ==========================================
clean_files() {
  local skip_confirm="${1:-false}"
  log_info "清理檔案儲存..."

  local storage_type=$(get_storage_type)

  case "$storage_type" in
    local)
      clean_local_files "$skip_confirm"
      ;;
    seaweedfs|s3)
      clean_s3_files "$skip_confirm"
      ;;
    *)
      log_warning "未知的儲存類型: $storage_type"
      return 0
      ;;
  esac
}

# ==========================================
# 清理本地檔案
# ==========================================
clean_local_files() {
  local skip_confirm="${1:-false}"
  local upload_dir=$(get_upload_dir)

  if [[ ! -d "$upload_dir" ]]; then
    log_info "上傳目錄不存在，無需清理"
    return 0
  fi

  local file_count=$(find "$upload_dir" -type f 2>/dev/null | wc -l | tr -d ' ')

  if [[ "$file_count" -eq 0 ]]; then
    log_info "上傳目錄為空，無需清理"
    return 0
  fi

  local dir_size=$(du -sh "$upload_dir" 2>/dev/null | cut -f1 || echo "未知")

  log_warning "即將刪除 $file_count 個檔案（總大小: ${dir_size:-未知}）"
  log_warning "目錄: $upload_dir"

  if [[ "$skip_confirm" == "true" ]] || confirm "確定要刪除所有上傳的檔案嗎?" "n"; then
    rm -rf "$upload_dir"
    mkdir -p "$upload_dir"
    log_success "本地檔案已清理"
  else
    log_info "已取消清理"
  fi
}

# ==========================================
# 清理 S3 檔案
# ==========================================
clean_s3_files() {
  local skip_confirm="${1:-false}"

  if ! command -v aws &> /dev/null; then
    log_error "未安裝 AWS CLI"
    return 1
  fi

  get_s3_config || return 1

  # 檢查 Bucket 是否有檔案
  local file_count=$(aws --endpoint-url="$S3_ENDPOINT" s3 ls "s3://$S3_BUCKET/" --recursive 2>/dev/null | wc -l | tr -d ' ')

  if [[ "$file_count" -eq 0 ]]; then
    log_info "S3 Bucket 為空，無需清理"
    return 0
  fi

  log_warning "即將刪除 S3 Bucket 中的 $file_count 個檔案"
  log_warning "Bucket: $S3_BUCKET"

  if [[ "$skip_confirm" == "true" ]] || confirm "確定要刪除所有 S3 檔案嗎?" "n"; then
    aws --endpoint-url="$S3_ENDPOINT" s3 rm "s3://$S3_BUCKET/" --recursive --quiet 2>/dev/null
    log_success "S3 檔案已清理"
  else
    log_info "已取消清理"
  fi
}

# ==========================================
# 顯示儲存狀態
# ==========================================
show_storage_status() {
  local storage_type=$(get_storage_type)

  echo -e ""
  echo -e "${YELLOW}檔案儲存狀態${NC}"
  echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}"
  echo -e "  ${CYAN}儲存類型:${NC} $storage_type"

  case "$storage_type" in
    local)
      local upload_dir=$(get_upload_dir)
      if [[ -d "$upload_dir" ]]; then
        local file_count=$(find "$upload_dir" -type f 2>/dev/null | wc -l | tr -d ' ')
        local dir_size=$(du -sh "$upload_dir" 2>/dev/null | cut -f1)
        echo -e "  ${CYAN}目錄:${NC} $upload_dir"
        echo -e "  ${CYAN}檔案數量:${NC} $file_count 個"
        echo -e "  ${CYAN}總大小:${NC} $dir_size"
      else
        echo -e "  ${DIM}目錄不存在${NC}"
      fi
      ;;
    seaweedfs|s3)
      if command -v aws &> /dev/null && get_s3_config 2>/dev/null; then
        local file_count=$(aws --endpoint-url="$S3_ENDPOINT" s3 ls "s3://$S3_BUCKET/" --recursive 2>/dev/null | wc -l | tr -d ' ')
        echo -e "  ${CYAN}Endpoint:${NC} $S3_ENDPOINT"
        echo -e "  ${CYAN}Bucket:${NC} $S3_BUCKET"
        echo -e "  ${CYAN}檔案數量:${NC} $file_count 個"
      else
        echo -e "  ${DIM}無法連接 S3 或配置不完整${NC}"
      fi
      ;;
  esac

  echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}"
}
