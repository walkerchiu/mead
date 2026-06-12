#!/bin/bash

# ==========================================
# MEAD CLI - 主入口（互動式）
# ==========================================

set -euo pipefail

# 正確解析腳本目錄（支援符號連結）
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
SCRIPT_DIR="$(cd -P "$(dirname "$SOURCE")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/utils/common.sh"

VERSION="1.0.0"

# 顯示版本
if [[ "${1:-}" == "--version" ]] || [[ "${1:-}" == "-v" ]]; then
  echo -e "MEAD CLI v$VERSION"
  exit 0
fi

# 顯示 top-level help
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "help" ]]; then
  cat <<EOF
MEAD CLI v$VERSION - 教育部藝術設計三大計畫入口網

使用方式:
  ./scripts/cli.sh                進入互動式選單（16 個功能）
  ./scripts/cli.sh <command> [options]
  ./scripts/cli.sh --version      顯示版本
  ./scripts/cli.sh --help         顯示此說明

可用命令:
  init                初始化 MEAD 專案
  dev                 啟動開發伺服器（支援 --frontend-only / --backend-only 等）
  test                執行測試（型別檢查 + 單元測試）
  status              查看服務狀態（--health 含健康檢查）
  doctor              診斷環境（--fix 自動修復，加 --yes 跳過確認）
  stop <target>       停止服務（all / frontend / backend / docker / ...）
  restart <target>    重啟服務
  logs <service>      查看日誌（-f 跟隨 / --tail N / --since 5m）
  db <sub>            資料庫（migrate:up|down|create|status / reset / backup / restore / cleanup / studio）
  clean               清理快取與建置產物
  port <sub>          Port 管理（status / free <port> / free-all）
  env <sub>           環境切換（current / list / switch <env> / diff <env>）
  deps <sub>          依賴管理（outdated / audit / update / cleanup）
  i18n <sub>          多語系（test / generate / unused / stats）
  storage <sub>       SeaweedFS（start / stop / restart / status / info / logs / diagnose / reset）
  drift               檢查 backend convention 是否符合（CONVENTIONS.md）
  menu                強制進入互動式選單

每個命令都支援 --help 查看詳細選項，例如:
  ./scripts/cli.sh db --help
  ./scripts/cli.sh doctor --help

完整文件: docs/getting-started/CLI_GUIDE.md
EOF
  exit 0
fi

# 等待用戶按 Enter 後返回選單
wait_and_return() {
  echo -e ""
  echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}"
  echo -ne "按 Enter 返回主選單..."
  read -r
}

# 互動式選單（迴圈）
show_interactive_menu() {
  while true; do
    clear
    echo -e ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}║                      ${NC}${BLUE}${BOLD}MEAD CLI${NC} ${GREEN}v$VERSION                     ║${NC}"
    echo -e "${GREEN}║         教育部藝術設計三大計畫入口網 - 互動式選單        ║${NC}"
    echo -e "${GREEN}║                                                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo -e ""

    echo -e "${YELLOW}🚀 快速開始${NC}"
    echo -e "  ${CYAN}1${NC})  初始化環境          ${DIM}│${NC}  安裝依賴與基礎設施"
    echo -e "  ${CYAN}2${NC})  啟動開發伺服器      ${DIM}│${NC}  開始寫程式（含 Storybook）"
    echo -e "  ${CYAN}3${NC})  查看服務狀態        ${DIM}│${NC}  快速查看運行狀態和資源"
    echo -e ""

    echo -e "${YELLOW}🔧 開發工具${NC}"
    echo -e "  ${CYAN}4${NC})  停止服務            ${DIM}│${NC}  停止運行中的服務"
    echo -e "  ${CYAN}5${NC})  重啟服務            ${DIM}│${NC}  改了程式快速重啟"
    echo -e "  ${CYAN}6${NC})  查看日誌            ${DIM}│${NC}  看看程式輸出什麼"
    echo -e "  ${CYAN}7${NC})  執行測試            ${DIM}│${NC}  測試程式是否正常"
    echo -e ""

    echo -e "${YELLOW}💾 資料管理${NC}"
    echo -e "  ${CYAN}8${NC})  資料庫遷移          ${DIM}│${NC}  更新資料庫結構"
    echo -e "  ${CYAN}9${NC})  重置資料            ${DIM}│${NC}  清空資料庫與檔案"
    echo -e "  ${CYAN}10${NC}) 備份/還原           ${DIM}│${NC}  資料庫 + 檔案儲存"
    echo -e ""

    echo -e "${YELLOW}🏥 診斷修復${NC}"
    echo -e "  ${CYAN}11${NC}) 環境診斷            ${DIM}│${NC}  診斷環境並可選自動修復"
    echo -e "  ${CYAN}12${NC}) 環境清理            ${DIM}│${NC}  清理環境以釋放空間"
    echo -e ""

    echo -e "${YELLOW}⚙️  進階功能${NC}"
    echo -e "  ${CYAN}13${NC}) i18n 多語系管理     ${DIM}│${NC}  翻譯測試與類型生成"
    echo -e "  ${CYAN}14${NC}) Port 管理           ${DIM}│${NC}  管理服務 Port 占用"
    echo -e "  ${CYAN}15${NC}) 環境切換            ${DIM}│${NC}  切換開發/測試/生產環境"
    echo -e "  ${CYAN}16${NC}) 依賴管理            ${DIM}│${NC}  檢查更新套件"
    echo -e ""

    echo -e "${YELLOW}📚 說明文件${NC}"
    echo -e "  ${CYAN}d${NC})  開啟文檔            ${DIM}│${NC}  在編輯器中開啟 CLI 文檔"
    echo -e "  ${CYAN}q${NC})  離開                ${DIM}│${NC}  結束 CLI"
    echo -e ""
    echo -e "${DIM}────────────────────────────────────────────────────────────────${NC}"
    echo -ne "${GREEN}❯${NC} 請選擇功能 [1-16, d, q]: "
    read -r choice

    case "$choice" in
      1) bash "$SCRIPT_DIR/commands/init.sh" || true; wait_and_return ;;
      2)
        echo -e ""
        echo -e "${YELLOW}選擇啟動模式:${NC}"
        echo -e "  ${CYAN}1${NC}) 全部（Frontend + Backend + Storybook + Prisma Studio）"
        echo -e "  ${CYAN}2${NC}) Frontend + Backend + Storybook"
        echo -e "  ${CYAN}3${NC}) Frontend + Backend"
        echo -e "  ${CYAN}4${NC}) Frontend + Storybook"
        echo -e "  ${CYAN}5${NC}) 僅 Frontend"
        echo -e "  ${CYAN}6${NC}) 僅 Backend"
        echo -e "  ${CYAN}7${NC}) 僅 Storybook"
        echo -e "  ${CYAN}8${NC}) 僅 Prisma Studio"
        echo -ne "${GREEN}請選擇 [1-8]:${NC} "
        read -r dev_choice
        case "$dev_choice" in
          1)
            "$SCRIPT_DIR/commands/dev.sh" --all &
            "$SCRIPT_DIR/commands/db.sh" studio &
            wait
            ;;
          2) exec "$SCRIPT_DIR/commands/dev.sh" --all ;;
          3) exec "$SCRIPT_DIR/commands/dev.sh" ;;
          4) exec "$SCRIPT_DIR/commands/dev.sh" --frontend-storybook ;;
          5) exec "$SCRIPT_DIR/commands/dev.sh" --frontend-only ;;
          6) exec "$SCRIPT_DIR/commands/dev.sh" --backend-only ;;
          7) exec "$SCRIPT_DIR/commands/dev.sh" --storybook-only ;;
          8) exec "$SCRIPT_DIR/commands/db.sh" studio ;;
          *) echo -e "${RED}無效選擇${NC}"; sleep 1 ;;
        esac
        ;;
      3) bash "$SCRIPT_DIR/commands/status.sh" || true; wait_and_return ;;
      4)
        echo -e ""
        echo -e "${YELLOW}選擇要停止的服務:${NC}"
        echo -e "  ${CYAN}1${NC}) 全部（包含 Docker）"
        echo -e "  ${CYAN}2${NC}) Frontend + Backend + Storybook"
        echo -e "  ${CYAN}3${NC}) Frontend + Backend"
        echo -e "  ${CYAN}4${NC}) Frontend + Storybook"
        echo -e "  ${CYAN}5${NC}) 僅 Frontend"
        echo -e "  ${CYAN}6${NC}) 僅 Backend"
        echo -e "  ${CYAN}7${NC}) 僅 Storybook"
        echo -e "  ${CYAN}8${NC}) 僅 Prisma Studio"
        echo -e "  ${CYAN}9${NC}) 僅 Adminer (DB GUI)"
        echo -e "  ${CYAN}10${NC}) Docker 服務"
        echo -e "  ${CYAN}11${NC}) SeaweedFS"
        echo -ne "${GREEN}請選擇 [1-11]:${NC} "
        read -r svc
        case "$svc" in
          1) bash "$SCRIPT_DIR/commands/stop.sh" all || true ;;
          2)
            bash "$SCRIPT_DIR/commands/stop.sh" frontend || true
            bash "$SCRIPT_DIR/commands/stop.sh" backend || true
            bash "$SCRIPT_DIR/commands/stop.sh" storybook || true
            ;;
          3)
            bash "$SCRIPT_DIR/commands/stop.sh" frontend || true
            bash "$SCRIPT_DIR/commands/stop.sh" backend || true
            ;;
          4)
            bash "$SCRIPT_DIR/commands/stop.sh" frontend || true
            bash "$SCRIPT_DIR/commands/stop.sh" storybook || true
            ;;
          5) bash "$SCRIPT_DIR/commands/stop.sh" frontend || true ;;
          6) bash "$SCRIPT_DIR/commands/stop.sh" backend || true ;;
          7) bash "$SCRIPT_DIR/commands/stop.sh" storybook || true ;;
          8) bash "$SCRIPT_DIR/commands/stop.sh" prisma-studio || true ;;
          9) bash "$SCRIPT_DIR/commands/stop.sh" adminer || true ;;
          10) bash "$SCRIPT_DIR/commands/stop.sh" docker || true ;;
          11) bash "$SCRIPT_DIR/commands/storage.sh" stop || true ;;
          *) echo -e "${RED}無效選擇${NC}"; sleep 1; continue ;;
        esac
        wait_and_return
        ;;
      5)
        echo -e ""
        echo -e "${YELLOW}選擇要重啟的服務:${NC}"
        echo -e "  ${CYAN}1${NC}) 全部（包含 Docker）"
        echo -e "  ${CYAN}2${NC}) Frontend + Backend + Storybook"
        echo -e "  ${CYAN}3${NC}) Frontend + Backend"
        echo -e "  ${CYAN}4${NC}) Frontend + Storybook"
        echo -e "  ${CYAN}5${NC}) 僅 Frontend"
        echo -e "  ${CYAN}6${NC}) 僅 Backend"
        echo -e "  ${CYAN}7${NC}) 僅 Storybook"
        echo -e "  ${CYAN}8${NC}) 僅 Prisma Studio"
        echo -e "  ${CYAN}9${NC}) 僅 Adminer (DB GUI)"
        echo -e "  ${CYAN}10${NC}) Docker 服務"
        echo -e "  ${CYAN}11${NC}) SeaweedFS"
        echo -ne "${GREEN}請選擇 [1-11]:${NC} "
        read -r svc
        case "$svc" in
          1) bash "$SCRIPT_DIR/commands/restart.sh" all || true ;;
          2)
            bash "$SCRIPT_DIR/commands/restart.sh" frontend || true &
            bash "$SCRIPT_DIR/commands/restart.sh" backend || true &
            bash "$SCRIPT_DIR/commands/restart.sh" storybook || true &
            wait
            ;;
          3)
            bash "$SCRIPT_DIR/commands/restart.sh" frontend || true &
            bash "$SCRIPT_DIR/commands/restart.sh" backend || true &
            wait
            ;;
          4)
            bash "$SCRIPT_DIR/commands/restart.sh" frontend || true &
            bash "$SCRIPT_DIR/commands/restart.sh" storybook || true &
            wait
            ;;
          5) bash "$SCRIPT_DIR/commands/restart.sh" frontend || true ;;
          6) bash "$SCRIPT_DIR/commands/restart.sh" backend || true ;;
          7) bash "$SCRIPT_DIR/commands/restart.sh" storybook || true ;;
          8) bash "$SCRIPT_DIR/commands/restart.sh" prisma-studio || true ;;
          9) bash "$SCRIPT_DIR/commands/restart.sh" adminer || true ;;
          10) bash "$SCRIPT_DIR/commands/restart.sh" docker || true ;;
          11) bash "$SCRIPT_DIR/commands/storage.sh" restart || true ;;
          *) echo -e "${RED}無效選擇${NC}"; sleep 1; continue ;;
        esac
        wait_and_return
        ;;
      6)
        echo -e ""
        echo -e "${YELLOW}選擇要查看的日誌:${NC}"
        echo -e "  ${CYAN}1${NC}) 所有 Docker 服務"
        echo -e "  ${CYAN}2${NC}) Frontend"
        echo -e "  ${CYAN}3${NC}) Backend"
        echo -e "  ${CYAN}4${NC}) Storybook"
        echo -e "  ${CYAN}5${NC}) PostgreSQL"
        echo -e "  ${CYAN}6${NC}) RabbitMQ"
        echo -e "  ${CYAN}7${NC}) Redis/Dragonfly"
        echo -e "  ${CYAN}8${NC}) Mailpit"
        echo -e "  ${CYAN}9${NC}) Adminer (DB GUI)"
        echo -e "  ${CYAN}10${NC}) SeaweedFS (所有)"
        echo -e "  ${CYAN}11${NC}) SeaweedFS Master"
        echo -e "  ${CYAN}12${NC}) SeaweedFS Volume"
        echo -e "  ${CYAN}13${NC}) SeaweedFS Filer"
        echo -e "  ${CYAN}14${NC}) SeaweedFS S3"
        echo -ne "${GREEN}請選擇 [1-14]:${NC} "
        read -r log_choice
        case "$log_choice" in
          1) bash "$SCRIPT_DIR/commands/logs.sh" docker -f || true ;;
          2) bash "$SCRIPT_DIR/commands/logs.sh" frontend -f || true ;;
          3) bash "$SCRIPT_DIR/commands/logs.sh" backend -f || true ;;
          4) bash "$SCRIPT_DIR/commands/logs.sh" storybook -f || true ;;
          5) bash "$SCRIPT_DIR/commands/logs.sh" postgres -f || true ;;
          6) bash "$SCRIPT_DIR/commands/logs.sh" rabbitmq -f || true ;;
          7) bash "$SCRIPT_DIR/commands/logs.sh" redis -f || true ;;
          8) bash "$SCRIPT_DIR/commands/logs.sh" mailpit -f || true ;;
          9) bash "$SCRIPT_DIR/commands/logs.sh" adminer -f || true ;;
          10) bash "$SCRIPT_DIR/commands/logs.sh" seaweedfs -f || true ;;
          11) bash "$SCRIPT_DIR/commands/logs.sh" seaweedfs-master -f || true ;;
          12) bash "$SCRIPT_DIR/commands/logs.sh" seaweedfs-volume -f || true ;;
          13) bash "$SCRIPT_DIR/commands/logs.sh" seaweedfs-filer -f || true ;;
          14) bash "$SCRIPT_DIR/commands/logs.sh" seaweedfs-s3 -f || true ;;
          *) echo -e "${RED}無效選擇${NC}"; sleep 1; continue ;;
        esac
        wait_and_return
        ;;
      7) bash "$SCRIPT_DIR/commands/test.sh" || true; wait_and_return ;;
      8)
        echo -e ""
        echo -e "${YELLOW}資料庫遷移操作:${NC}"
        echo -e "  ${CYAN}1${NC}) 建立新的 migration"
        echo -e "  ${CYAN}2${NC}) 執行 migration"
        echo -e "  ${CYAN}3${NC}) 回滾 migration"
        echo -e "  ${CYAN}4${NC}) 查看 migration 狀態"
        echo -ne "${GREEN}請選擇 [1-4]:${NC} "
        read -r mig_choice
        case "$mig_choice" in
          1)
            echo -ne "Migration 名稱: "
            read -r mig_name
            bash "$SCRIPT_DIR/commands/db.sh" migrate:create "$mig_name" || true
            ;;
          2) bash "$SCRIPT_DIR/commands/db.sh" migrate:up || true ;;
          3) bash "$SCRIPT_DIR/commands/db.sh" migrate:down || true ;;
          4) bash "$SCRIPT_DIR/commands/db.sh" migrate:status || true ;;
          *) echo -e "${RED}無效選擇${NC}"; sleep 1; continue ;;
        esac
        wait_and_return
        ;;
      9) bash "$SCRIPT_DIR/commands/db.sh" reset || true; wait_and_return ;;
      10)
        echo -e ""
        echo -e "${YELLOW}資料備份/還原:${NC}"
        echo -e "  ${CYAN}1${NC}) 備份資料（資料庫 + 檔案儲存）"
        echo -e "  ${CYAN}2${NC}) 還原資料（資料庫 + 檔案儲存）"
        echo -e "  ${CYAN}3${NC}) 列出備份"
        echo -e "  ${CYAN}4${NC}) 刪除舊備份"
        echo -ne "${GREEN}請選擇 [1-4]:${NC} "
        read -r backup_choice
        case "$backup_choice" in
          1)
            CURRENT_ENV="${MEAD_ENV:-development}"
            echo -e ""
            echo -e "${YELLOW}將備份環境:${NC} ${CYAN}$CURRENT_ENV${NC}"
            echo -e "${DIM}提示: 使用 MEAD_ENV 環境變數可指定其他環境${NC}"
            echo -e ""
            if confirm "確定要繼續嗎?" "y"; then
              bash "$SCRIPT_DIR/commands/db.sh" backup || true
            else
              echo -e "${YELLOW}已取消${NC}"
              sleep 1
            fi
            ;;
          2)
            # 列出可用備份供選擇
            CURRENT_ENV="${MEAD_ENV:-development}"
            BACKUP_DIR="$SCRIPT_DIR/../backups/$CURRENT_ENV"

            # 檢查是否有任何備份檔案
            has_backups=false
            if [[ -d "$BACKUP_DIR" ]]; then
              if ls "$BACKUP_DIR"/*.sql 2>/dev/null >/dev/null || ls "$BACKUP_DIR"/*.sql.gz 2>/dev/null >/dev/null; then
                has_backups=true
              fi
            fi

            if [ "$has_backups" = true ]; then
              echo -e ""
              echo -e "${YELLOW}選擇要還原的備份 (環境: ${CYAN}$CURRENT_ENV${YELLOW}):${NC}"
              echo -e ""

              # 列出備份並編號（包含 .sql 和 .sql.gz）
              backups=()
              while IFS= read -r file; do
                [[ -f "$file" ]] && backups+=("$file")
              done < <(ls -t "$BACKUP_DIR"/*.sql "$BACKUP_DIR"/*.sql.gz 2>/dev/null)

              if [ ${#backups[@]} -eq 0 ]; then
                echo -e "${YELLOW}目前沒有可用的備份${NC}"
                sleep 2
              else
                count=1
                for backup in "${backups[@]}"; do
                  size=$(du -h "$backup" | cut -f1)
                  filename=$(basename "$backup")
                  timestamp=$(echo "$filename" | sed -n 's/.*_\([0-9]\{8\}_[0-9]\{6\}\).*/\1/p')
                  date_formatted=$(echo "$timestamp" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')

                  # 提取環境名稱（從檔名中）
                  env_name=$(echo "$filename" | sed -n 's/.*_db_\([^_]*\)_.*/\1/p')

                  echo -e "  ${CYAN}$count${NC}) $date_formatted  ${DIM}[$size]${NC}  ${YELLOW}($env_name)${NC}"
                  echo -e "      ${DIM}$filename${NC}"
                  ((count++))
                done
                echo -e "  ${CYAN}0${NC}) 取消"
                echo -e ""
                echo -ne "${GREEN}請選擇 [0-${#backups[@]}]:${NC} "
                read -r restore_choice

                if [[ "$restore_choice" =~ ^[0-9]+$ ]] && [ "$restore_choice" -ge 1 ] && [ "$restore_choice" -le "${#backups[@]}" ]; then
                  selected_backup="${backups[$((restore_choice-1))]}"
                  bash "$SCRIPT_DIR/commands/db.sh" restore "$selected_backup" || true
                elif [ "$restore_choice" != "0" ]; then
                  echo -e "${RED}無效選擇${NC}"
                  sleep 1
                fi
              fi
            else
              echo -e ""
              echo -e "${YELLOW}環境 ${CYAN}$CURRENT_ENV${YELLOW} 目前沒有可用的備份${NC}"
              echo -e ""
              echo -e "${DIM}提示: 使用選項 1 建立備份${NC}"
              sleep 2
            fi
            ;;
          3)
            echo -e ""
            echo -e "${YELLOW}現有備份列表:${NC}"
            echo -e ""

            BACKUP_BASE="$SCRIPT_DIR/../backups"
            found_backups=false

            for env in development uat production; do
              if [[ -d "$BACKUP_BASE/$env" ]]; then
                # 收集該環境的所有備份檔案
                backup_files=()
                while IFS= read -r file; do
                  [[ -f "$file" ]] && backup_files+=("$file")
                done < <(ls -t "$BACKUP_BASE/$env"/*.sql "$BACKUP_BASE/$env"/*.sql.gz 2>/dev/null)

                # 如果有備份檔案才顯示
                if [ ${#backup_files[@]} -gt 0 ]; then
                  found_backups=true
                  backup_count=${#backup_files[@]}
                  echo -e "${CYAN}━━━ 環境: $env${NC} ${DIM}($backup_count 個備份)${NC}"

                  # 顯示每個備份檔案
                  for file in "${backup_files[@]}"; do
                    size=$(du -h "$file" | cut -f1)
                    filename=$(basename "$file")

                    # 提取時間戳記並格式化
                    if [[ "$filename" =~ _([0-9]{8})_([0-9]{6}) ]]; then
                      date_part="${BASH_REMATCH[1]}"
                      time_part="${BASH_REMATCH[2]}"
                      formatted_date="${date_part:0:4}-${date_part:4:2}-${date_part:6:2} ${time_part:0:2}:${time_part:2:2}:${time_part:4:2}"
                    else
                      formatted_date="unknown"
                    fi

                    echo -e "  • ${formatted_date}  ${DIM}[${size}]${NC}  $filename"
                  done
                  echo -e ""
                fi
              fi
            done

            if [ "$found_backups" = false ]; then
              echo -e "  ${DIM}目前沒有任何備份${NC}"
              echo -e ""
            fi
            ;;
          4)
            echo -e ""
            echo -e "${YELLOW}選擇要清理的環境:${NC}"
            echo -e "  ${CYAN}1${NC}) development"
            echo -e "  ${CYAN}2${NC}) uat"
            echo -e "  ${CYAN}3${NC}) production"
            echo -e "  ${CYAN}4${NC}) 全部環境"
            echo -e "  ${CYAN}0${NC}) 取消"
            echo -ne "${GREEN}請選擇 [0-4]:${NC} "
            read -r env_choice

            case "$env_choice" in
              0)
                echo -e "${YELLOW}已取消${NC}"
                sleep 1
                continue
                ;;
              1) env="development" ;;
              2) env="uat" ;;
              3) env="production" ;;
              4) env="all" ;;
              *)
                echo -e "${RED}無效選擇${NC}"
                sleep 1
                continue
                ;;
            esac

            echo -e ""
            echo -ne "${YELLOW}保留最近幾個備份？[預設: 5]:${NC} "
            read -r keep_count
            keep_count=${keep_count:-5}

            if ! [[ "$keep_count" =~ ^[0-9]+$ ]]; then
              echo -e "${RED}無效的數字${NC}"
              sleep 1
              continue
            fi

            echo -e ""
            if [ "$env" = "all" ]; then
              echo -e "${YELLOW}將清理所有環境的舊備份，保留最近 ${CYAN}$keep_count${YELLOW} 個${NC}"
            else
              echo -e "${YELLOW}將清理環境 ${CYAN}$env${YELLOW} 的舊備份，保留最近 ${CYAN}$keep_count${YELLOW} 個${NC}"
            fi
            echo -e ""

            if confirm "確定要繼續嗎?" "n"; then
              bash "$SCRIPT_DIR/commands/db.sh" cleanup --env "$env" --keep "$keep_count" || true
            else
              echo -e "${YELLOW}已取消${NC}"
              sleep 1
            fi
            ;;
          *)
            echo -e "${RED}無效選擇${NC}"
            sleep 1
            continue
            ;;
        esac
        wait_and_return
        ;;
      11)
        echo -e ""
        echo -e "${YELLOW}環境診斷選項:${NC}"
        echo -e "  ${CYAN}1${NC}) 快速診斷（基本環境檢查）"
        echo -e "  ${CYAN}2${NC}) 完整診斷（基本 + 服務健康檢查）"
        echo -e "  ${CYAN}3${NC}) 完整診斷並自動修復"
        echo -ne "${GREEN}請選擇 [1-3]:${NC} "
        read -r doctor_choice
        case "$doctor_choice" in
          1) bash "$SCRIPT_DIR/commands/doctor.sh" || true ;;
          2)
            bash "$SCRIPT_DIR/commands/doctor.sh" || true
            echo -e ""
            echo -e "${YELLOW}執行服務健康檢查...${NC}"
            bash "$SCRIPT_DIR/commands/status.sh" --health || true
            ;;
          3)
            bash "$SCRIPT_DIR/commands/doctor.sh" --fix || true
            echo -e ""
            echo -e "${YELLOW}執行服務健康檢查...${NC}"
            bash "$SCRIPT_DIR/commands/status.sh" --health || true
            ;;
          *) echo -e "${RED}無效選擇${NC}"; sleep 1; continue ;;
        esac
        wait_and_return
        ;;
      12) bash "$SCRIPT_DIR/commands/clean.sh" || true; wait_and_return ;;
      13)
        echo -e ""
        echo -e "${YELLOW}i18n 多語系管理:${NC}"
        echo -e "  ${CYAN}1${NC}) 執行翻譯完整性測試"
        echo -e "  ${CYAN}2${NC}) 生成 TypeScript 類型"
        echo -e "  ${CYAN}3${NC}) 檢查未使用的翻譯鍵"
        echo -e "  ${CYAN}4${NC}) 顯示翻譯統計"
        echo -ne "${GREEN}請選擇 [1-4]:${NC} "
        read -r i18n_choice
        case "$i18n_choice" in
          1) bash "$SCRIPT_DIR/commands/i18n.sh" test || true ;;
          2) bash "$SCRIPT_DIR/commands/i18n.sh" generate || true ;;
          3) bash "$SCRIPT_DIR/commands/i18n.sh" unused || true ;;
          4) bash "$SCRIPT_DIR/commands/i18n.sh" stats || true ;;
          *) echo -e "${RED}無效選擇${NC}"; sleep 1; continue ;;
        esac
        wait_and_return
        ;;
      14) bash "$SCRIPT_DIR/commands/port.sh" || true; wait_and_return ;;
      15) bash "$SCRIPT_DIR/commands/env.sh" || true; wait_and_return ;;
      16) bash "$SCRIPT_DIR/commands/deps.sh" || true; wait_and_return ;;
      d|D)
        if command -v open >/dev/null 2>&1; then
          open "$SCRIPT_DIR/../docs/getting-started/CLI_GUIDE.md" 2>/dev/null || cat "$SCRIPT_DIR/../docs/getting-started/CLI_GUIDE.md" | less
        else
          less "$SCRIPT_DIR/../docs/getting-started/CLI_GUIDE.md"
        fi
        ;;
      q|Q|exit|quit)
        echo -e ""
        log_success "再見！祝開發順利 👋"
        exit 0
        ;;
      *)
        echo -e "${RED}無效選擇，請重新選擇${NC}"
        sleep 1
        ;;
    esac
  done
}

# 沒有參數 = 互動式選單
if [[ -z "${1:-}" ]]; then
  show_interactive_menu
  exit 0
fi

# 路由到對應命令
COMMAND="$1"
shift

case "$COMMAND" in
  init)
    exec "$SCRIPT_DIR/commands/init.sh" "$@"
    ;;
  dev)
    exec "$SCRIPT_DIR/commands/dev.sh" "$@"
    ;;
  test)
    exec "$SCRIPT_DIR/commands/test.sh" "$@"
    ;;
  clean)
    exec "$SCRIPT_DIR/commands/clean.sh" "$@"
    ;;
  db)
    exec "$SCRIPT_DIR/commands/db.sh" "$@"
    ;;
  doctor)
    exec "$SCRIPT_DIR/commands/doctor.sh" "$@"
    ;;
  status)
    exec "$SCRIPT_DIR/commands/status.sh" "$@"
    ;;
  stop)
    exec "$SCRIPT_DIR/commands/stop.sh" "$@"
    ;;
  restart)
    exec "$SCRIPT_DIR/commands/restart.sh" "$@"
    ;;
  logs)
    exec "$SCRIPT_DIR/commands/logs.sh" "$@"
    ;;
  port)
    exec "$SCRIPT_DIR/commands/port.sh" "$@"
    ;;
  env)
    exec "$SCRIPT_DIR/commands/env.sh" "$@"
    ;;
  deps)
    exec "$SCRIPT_DIR/commands/deps.sh" "$@"
    ;;
  i18n)
    exec "$SCRIPT_DIR/commands/i18n.sh" "$@"
    ;;
  storage)
    exec "$SCRIPT_DIR/commands/storage.sh" "$@"
    ;;
  drift)
    exec python3 "$SCRIPT_DIR/check-drift.py" "$@"
    ;;
  menu)
    case "${1:-}" in
      -h|--help)
        echo "Usage: ./scripts/cli.sh menu"
        echo ""
        echo "強制進入互動式選單（與不帶任何參數呼叫 cli.sh 等價）。"
        exit 0
        ;;
    esac
    show_interactive_menu
    ;;
  *)
    log_error "未知的命令: $COMMAND"
    echo -e ""
    echo -e "💡 小提示："
    echo -e "  - 輸入 ${CYAN}./scripts/cli.sh${NC} 進入互動式選單"
    echo -e "  - 輸入 ${CYAN}./scripts/cli.sh --help${NC} 查看所有命令"
    echo -e "  - 輸入 ${CYAN}./scripts/cli.sh doctor${NC} 診斷環境問題"
    exit 1
    ;;
esac
