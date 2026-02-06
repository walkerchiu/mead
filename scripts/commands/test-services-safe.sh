#!/bin/bash

# ==========================================
# 安全的服務健康檢查
# 只檢查 Docker 服務狀態，不啟動任何開發服務器
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 檢查 Docker 服務是否運行
check_docker_services() {
  local all_healthy=true

  # 檢查 PostgreSQL
  if docker ps --format '{{.Names}}' | grep -q "timescaledb"; then
    log_success "✓ PostgreSQL 運行中"
  else
    log_error "✗ PostgreSQL 未運行"
    all_healthy=false
  fi

  # 檢查 RabbitMQ
  if docker ps --format '{{.Names}}' | grep -q "rabbitmq"; then
    log_success "✓ RabbitMQ 運行中"
  else
    log_error "✗ RabbitMQ 未運行"
    all_healthy=false
  fi

  # 檢查 Dragonfly (Redis)
  if docker ps --format '{{.Names}}' | grep -q "dragonfly"; then
    log_success "✓ Dragonfly (Redis) 運行中"
  else
    log_error "✗ Dragonfly 未運行"
    all_healthy=false
  fi

  # 檢查 Mailpit
  if docker ps --format '{{.Names}}' | grep -q "mailpit"; then
    log_success "✓ Mailpit 運行中"
  else
    log_error "✗ Mailpit 未運行"
    all_healthy=false
  fi

  if [ "$all_healthy" = true ]; then
    return 0
  else
    return 1
  fi
}

echo ""
log_info "檢查 Docker 服務狀態..."
echo ""

if check_docker_services; then
  echo ""
  log_success "所有 Docker 服務運行正常"
  exit 0
else
  echo ""
  log_warning "部分 Docker 服務未運行，請檢查"
  exit 1
fi
