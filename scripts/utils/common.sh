#!/bin/bash

# ==========================================
# MEAD CLI - 共用工具函數庫
# ==========================================

# 顏色定義
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export MAGENTA='\033[0;35m'
export CYAN='\033[0;36m'
export WHITE='\033[1;37m'
export BOLD='\033[1m'
export DIM='\033[2m'
export NC='\033[0m' # No Color

# 依 .current-env 推導「應該用的」per-host compose override 檔名（不檢查是否存在）。
# 對齊 .env.docker.<env>.example 的每環境模型：override 範本 *.override.yml.example tracked、
# 實際檔 docker-compose.<env>.override.yml gitignored，由 cli 在 runtime 依當前環境自動挑
# （env switch 切 .env.docker / .env，up 時才 -f 疊上 override）。
#   local | dev → docker-compose.dev.override.yml
#   sit/uat/staging/prod → docker-compose.<env>.override.yml
get_compose_override_name() {
  local root="${PROJECT_ROOT:-$(pwd)}"
  local env="local"
  [[ -f "$root/.current-env" ]] && env="$(tr -d '[:space:]' < "$root/.current-env")"
  [[ -z "$env" ]] && env="local"
  case "$env" in
    sit) echo "docker-compose.sit.override.yml" ;;
    uat) echo "docker-compose.uat.override.yml" ;;
    staging) echo "docker-compose.staging.override.yml" ;;
    prod) echo "docker-compose.prod.override.yml" ;;
    *) echo "docker-compose.dev.override.yml" ;;
  esac
}

# 回傳「存在的」override 檔名（相對 PROJECT_ROOT）；不存在則回空字串，呼叫端自行決定是否 -f。
# 預設情況（未 cp 出實際 override 檔）回空字串 → 所有指令行為與未導入 override 時完全相同。
get_compose_override() {
  local root="${PROJECT_ROOT:-$(pwd)}"
  local file; file="$(get_compose_override_name)"
  [[ -f "$root/$file" ]] && echo "$file" || echo ""
}

# 日誌函數
log_info() {
  echo -e "${BLUE}ℹ${NC}  $1"
}

log_success() {
  echo -e "${GREEN}✓${NC}  $1"
}

# 判斷 SEAWEEDFS_S3_PASSWORD 是否為不安全的預設／佔位值。
# 規則：未設、空字串、admin123、或以 CHANGEME / please-change / please-set 開頭都視為不安全。
# 用法：if _is_insecure_s3_password; then ...; fi
_is_insecure_s3_password() {
  local pw="${SEAWEEDFS_S3_PASSWORD:-}"
  [[ -z "$pw" ]] && return 0
  [[ "$pw" == "admin123" ]] && return 0
  [[ "$pw" == CHANGEME* || "$pw" == please-change* || "$pw" == please-set* ]] && return 0
  return 1
}

log_warning() {
  echo -e "${YELLOW}⚠${NC}  $1"
}

log_error() {
  echo -e "${RED}✗${NC}  $1"
}

log_step() {
  echo -e "\n${CYAN}▶${NC}  ${BOLD}$1${NC}"
}

# 標題函數
print_header() {
  echo -e ""
  echo -e "${GREEN}━━━${NC} ${BOLD}$1${NC}"
  echo -e ""
}

# 確認函數
#
# 非互動規則：
#   1. AUTO_YES=1（或非空）— 一律視為 Yes，不 prompt（適合 --yes / CI）
#   2. stdin 非 TTY 且未設 AUTO_YES — 直接用 default（避免 read 在管線環境卡死）
confirm() {
  local message="$1"
  local default="${2:-n}"

  if [[ "$default" == "y" ]]; then
    local prompt="[Y/n]"
    local default_answer="y"
  else
    local prompt="[y/N]"
    local default_answer="n"
  fi

  # AUTO_YES=1 → 一律 Yes
  if [[ -n "${AUTO_YES:-}" ]]; then
    echo -e "${YELLOW}?${NC}  $message $prompt: ${GREEN}y${NC} ${DIM}(AUTO_YES)${NC}"
    return 0
  fi

  # 非 TTY → 直接用 default 不 read，避免卡死
  if [[ ! -t 0 ]]; then
    echo -e "${YELLOW}?${NC}  $message $prompt: ${DIM}$default_answer (非互動模式)${NC}"
    [[ "$default_answer" == "y" ]]
    return $?
  fi

  echo -ne "${YELLOW}?${NC}  $message $prompt: "
  read -r answer
  answer=${answer:-$default_answer}

  [[ "$answer" =~ ^[Yy]$ ]]
}

# 檢查命令是否存在
check_command() {
  local cmd="$1"
  local name="${2:-$cmd}"

  if command -v "$cmd" &> /dev/null; then
    log_success "$name 已安裝 ($(command -v "$cmd"))"
    return 0
  else
    log_error "$name 未安裝"
    return 1
  fi
}

# 檢查版本
check_version() {
  local cmd="$1"
  local min_version="$2"
  local name="${3:-$cmd}"

  if ! command -v "$cmd" &> /dev/null; then
    log_error "$name 未安裝"
    return 1
  fi

  local version=$($cmd --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)

  if [[ -z "$version" ]]; then
    log_warning "$name 版本無法確定"
    return 0
  fi

  log_success "$name 版本: $version"
  return 0
}

# 檢查 port 是否被占用
check_port() {
  local port="$1"
  local service="${2:-Service}"

  if lsof -Pi ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_warning "$service (port $port) 已被使用"
    return 1
  else
    log_success "$service (port $port) 可用"
    return 0
  fi
}

# 檢查檔案是否存在
check_file() {
  local file="$1"
  local name="${2:-File}"

  if [[ -f "$file" ]]; then
    log_success "$name 存在"
    return 0
  else
    log_error "$name 不存在: $file"
    return 1
  fi
}

# 檢查目錄是否存在
check_directory() {
  local dir="$1"
  local name="${2:-Directory}"

  if [[ -d "$dir" ]]; then
    log_success "$name 存在"
    return 0
  else
    log_error "$name 不存在: $dir"
    return 1
  fi
}

# 複製範本檔案
copy_template() {
  local template="$1"
  local target="$2"
  local name="${3:-File}"

  if [[ -f "$target" ]]; then
    log_warning "$name 已存在，跳過"
    return 0
  fi

  if [[ ! -f "$template" ]]; then
    log_error "範本檔案不存在: $template"
    return 1
  fi

  cp "$template" "$target"
  log_success "$name 已建立"
  return 0
}

# 等待服務就緒
wait_for_service() {
  local check_command="$1"
  local service_name="$2"
  local max_wait="${3:-30}"
  local interval="${4:-2}"

  log_info "等待 $service_name 就緒..."

  local elapsed=0
  while [ $elapsed -lt $max_wait ]; do
    if eval "$check_command" &> /dev/null; then
      log_success "$service_name 已就緒"
      return 0
    fi
    sleep $interval
    elapsed=$((elapsed + interval))
    echo -ne "  等待中... ${elapsed}/${max_wait}s\r"
  done

  echo ""
  log_error "$service_name 啟動逾時"
  return 1
}

# 獲取專案根目錄
get_project_root() {
  local current_dir="$PWD"

  # 往上查找 package.json
  while [[ "$current_dir" != "/" ]]; do
    if [[ -f "$current_dir/package.json" ]] && [[ -f "$current_dir/pnpm-workspace.yaml" ]]; then
      echo "$current_dir"
      return 0
    fi
    current_dir=$(dirname "$current_dir")
  done

  log_error "找不到專案根目錄"
  return 1
}

# 讀取 .env 檔案
load_env() {
  local env_file="$1"

  if [[ ! -f "$env_file" ]]; then
    log_error "環境變數檔案不存在: $env_file"
    return 1
  fi

  set -a
  source <(grep -v '^#' "$env_file" | sed 's/\r$//')
  set +a

  log_success "已載入環境變數: $env_file"
  return 0
}

# 顯示進度條
show_progress() {
  local current="$1"
  local total="$2"
  local width=50
  local percentage=$((current * 100 / total))
  local completed=$((width * current / total))
  local remaining=$((width - completed))

  printf "\r["
  printf "%${completed}s" | tr ' ' '='
  printf "%${remaining}s" | tr ' ' '-'
  printf "] %d%%" "$percentage"
}

# 顯示旋轉指示器
spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'

  while ps -p $pid > /dev/null 2>&1; do
    local temp=${spinstr#?}
    printf " [%c]  " "$spinstr"
    spinstr=$temp${spinstr%"$temp"}
    sleep $delay
    printf "\b\b\b\b\b\b"
  done
  printf "    \b\b\b\b"
}

# 顯示幫助訊息
show_help() {
  local command="${1:-}"

  echo -e "\n${GREEN}MEAD CLI${NC} - 專案管理工具\n"
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh <command> [options]"
  echo ""
  echo -e "${YELLOW}可用命令:${NC}"
  echo -e "  ${CYAN}init${NC}      初始化專案（新開發者設置）"
  echo -e "  ${CYAN}doctor${NC}    診斷開發環境"
  echo -e "  ${CYAN}dev${NC}       啟動開發環境"
  echo -e "  ${CYAN}db${NC}        資料庫管理"
  echo -e "  ${CYAN}clean${NC}     環境清理"
  echo -e "  ${CYAN}test${NC}      執行測試"
  echo -e "  ${CYAN}help${NC}      顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh init              # 初始化專案"
  echo "  ./scripts/cli.sh doctor            # 檢查環境"
  echo "  ./scripts/cli.sh db reset          # 重置資料庫"
  echo "  ./scripts/cli.sh clean --dry-run   # 預覽環境清理操作"
  echo ""
  echo -e "${YELLOW}更多資訊:${NC}"
  echo "  ./scripts/cli.sh <command> --help  # 查看特定命令的幫助"
  echo ""
}

# 錯誤處理
handle_error() {
  local exit_code=$?
  local line_number=$1

  if [ $exit_code -ne 0 ]; then
    log_error "命令執行失敗 (line $line_number, exit code $exit_code)"
  fi
}

# 設置錯誤追蹤
set_error_trap() {
  trap 'handle_error ${LINENO}' ERR
}

# 清理函數
cleanup() {
  log_info "清理中..."
}

# 設置清理陷阱
set_cleanup_trap() {
  trap cleanup EXIT INT TERM
}

# 取得 Docker 容器名稱（通用函數）
get_container_name() {
  local service_name="$1"  # timescaledb, rabbitmq, dragonfly, mailpit
  local env_var_name=""
  local compose_service_name=""
  local default_name=""
  local project_root="${PROJECT_ROOT:-$(get_project_root)}"

  # 根據服務類型設定對應變數
  case "$service_name" in
    timescaledb|postgres|postgresql)
      env_var_name="POSTGRES_CONTAINER_NAME"
      compose_service_name="timescaledb"
      default_name="mead-timescaledb"
      ;;
    rabbitmq|rabbit)
      env_var_name="RABBITMQ_CONTAINER_NAME"
      compose_service_name="rabbitmq"
      default_name="mead-rabbitmq"
      ;;
    dragonfly|redis)
      env_var_name="DRAGONFLY_CONTAINER_NAME"
      compose_service_name="dragonfly"
      default_name="mead-dragonfly"
      ;;
    mailpit|mail)
      env_var_name="MAILPIT_CONTAINER_NAME"
      compose_service_name="mailpit"
      default_name="mead-mailpit"
      ;;
    adminer|db-ui)
      env_var_name="ADMINER_CONTAINER_NAME"
      compose_service_name="adminer"
      default_name="mead-adminer"
      ;;
    seaweedfs-master|seaweedfs_master)
      env_var_name="SEAWEEDFS_MASTER_CONTAINER_NAME"
      compose_service_name="seaweedfs-master"
      default_name="mead-seaweedfs-master"
      ;;
    seaweedfs-volume|seaweedfs_volume)
      env_var_name="SEAWEEDFS_VOLUME_CONTAINER_NAME"
      compose_service_name="seaweedfs-volume"
      default_name="mead-seaweedfs-volume"
      ;;
    seaweedfs-filer|seaweedfs_filer)
      env_var_name="SEAWEEDFS_FILER_CONTAINER_NAME"
      compose_service_name="seaweedfs-filer"
      default_name="mead-seaweedfs-filer"
      ;;
    seaweedfs-s3|seaweedfs_s3)
      env_var_name="SEAWEEDFS_S3_CONTAINER_NAME"
      compose_service_name="seaweedfs-s3"
      default_name="mead-seaweedfs-s3"
      ;;
    *)
      log_error "不支援的服務類型: $service_name"
      return 1
      ;;
  esac

  local container_name=""

  # 1. 優先從 .env.docker 讀取
  if [[ -f "$project_root/.env.docker" ]]; then
    container_name=$(grep -E "^${env_var_name}=" "$project_root/.env.docker" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  fi

  # 2. 如果沒有設定，從 docker-compose.yml 讀取
  if [[ -z "$container_name" ]] && [[ -f "$project_root/docker-compose.yml" ]]; then
    container_name=$(awk "/^  ${compose_service_name}:/,/^  [a-z]/ {if (\$1 == \"container_name:\") print \$2}" "$project_root/docker-compose.yml")
  fi

  # 3. 如果還是沒有，使用預設值
  if [[ -z "$container_name" ]]; then
    container_name="$default_name"
  fi

  echo "$container_name"
}
