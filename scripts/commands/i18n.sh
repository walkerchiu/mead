#!/bin/bash

# ==========================================
# Wind CLI - i18n 命令
# 多語系管理工具
# ==========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 載入共用函數
source "$SCRIPT_DIR/../utils/common.sh"

# 顯示幫助
show_command_help() {
  echo -e "\n${GREEN}./scripts/cli.sh i18n${NC} - 多語系管理工具\n"
  echo -e "${YELLOW}描述:${NC}"
  echo "  管理專案的多語系翻譯"
  echo ""
  echo -e "${YELLOW}使用方式:${NC}"
  echo "  ./scripts/cli.sh i18n [command]"
  echo ""
  echo -e "${YELLOW}命令:${NC}"
  echo "  test              執行翻譯完整性測試（檢查鍵一致性、placeholder、空值等）"
  echo "  generate          生成 TypeScript 類型定義"
  echo "  unused            檢查未使用的翻譯鍵"
  echo "  stats             顯示翻譯統計資訊"
  echo "  -h, --help        顯示此幫助訊息"
  echo ""
  echo -e "${YELLOW}範例:${NC}"
  echo "  ./scripts/cli.sh i18n test            # 執行翻譯測試"
  echo "  ./scripts/cli.sh i18n generate        # 生成類型定義"
  echo "  ./scripts/cli.sh i18n unused          # 檢查未使用的翻譯鍵"
  echo "  ./scripts/cli.sh i18n stats           # 顯示統計資訊"
  echo ""
}

# 執行測試
run_test() {
  print_header "執行 i18n 翻譯完整性測試"

  log_info "▶ 1/2 後端翻譯測試"
  echo ""
  cd "$PROJECT_ROOT/apps/backend"
  pnpm test:i18n

  echo ""
  log_info "▶ 2/2 前端翻譯測試"
  echo ""
  cd "$PROJECT_ROOT/apps/frontend"
  pnpm test:i18n

  echo ""
  log_success "✅ 所有 i18n 測試通過"
}

# 生成類型
generate_types() {
  print_header "生成 TypeScript 類型定義"

  log_info "▶ 1/2 後端類型生成"
  cd "$PROJECT_ROOT/apps/backend"
  pnpm generate-i18n-types

  echo ""
  log_info "▶ 2/2 前端類型生成"
  cd "$PROJECT_ROOT/apps/frontend"
  pnpm generate-i18n-types

  echo ""
  log_success "✅ TypeScript 類型定義已生成"
  echo ""
  log_info "生成的檔案:"
  echo "  • apps/backend/src/i18n/i18n.types.ts"
  echo "  • apps/frontend/src/types/i18n.types.ts"
}

# 檢查未使用的翻譯鍵
check_unused() {
  print_header "檢查未使用的翻譯鍵"

  # 選項
  local DETAILED=false
  local SAVE_REPORT=false
  local SHOW_DETAILS=false
  local GENERATE_CLEANUP=false

  # 解析參數 (第一個參數是 'unused',從第二個開始解析選項)
  shift  # 移除第一個參數 'unused'
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --detailed)
        DETAILED=true
        ;;
      --report)
        SAVE_REPORT=true
        ;;
      --show)
        SHOW_DETAILS=true
        ;;
      --cleanup)
        GENERATE_CLEANUP=true
        ;;
    esac
    shift
  done

  # ==========================================
  # 前端翻譯檢查
  # ==========================================
  log_info "📱 掃描前端翻譯使用情況..."
  echo ""

  cd "$PROJECT_ROOT/apps/frontend"

  # 1. 提取所有翻譯鍵定義
  log_info "▶ 1/4 提取翻譯鍵定義"

  TRANSLATION_DATA=$(node << 'TRANSEOF'
    const fs = require('fs');
    const path = require('path');

    try {
      const messagesZh = JSON.parse(fs.readFileSync('messages/zh-TW.json', 'utf8'));
      const messagesEn = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

      function getAllKeys(obj, prefix = '') {
        let keys = [];
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
          } else {
            keys.push(fullKey);
          }
        }
        return keys;
      }

      const keysZh = getAllKeys(messagesZh);
      const keysEn = getAllKeys(messagesEn);

      // 找出只在其中一個語言存在的鍵
      const onlyZh = keysZh.filter(k => !keysEn.includes(k));
      const onlyEn = keysEn.filter(k => !keysZh.includes(k));

      console.log(JSON.stringify({
        allKeys: keysZh,
        totalKeys: keysZh.length,
        onlyZh: onlyZh,
        onlyEn: onlyEn
      }));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
TRANSEOF
  )

  TOTAL_KEYS=$(echo "$TRANSLATION_DATA" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.totalKeys);")
  TRANSLATION_KEYS=$(echo "$TRANSLATION_DATA" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.allKeys.join('\n'));")

  log_success "  找到 $TOTAL_KEYS 個翻譯鍵"

  # 檢查不一致的鍵
  ONLY_ZH=$(echo "$TRANSLATION_DATA" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.onlyZh.join('\n'));")
  ONLY_EN=$(echo "$TRANSLATION_DATA" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.onlyEn.join('\n'));")

  if [ -n "$ONLY_ZH" ] || [ -n "$ONLY_EN" ]; then
    log_warning "  ⚠ 發現語言不一致的鍵"
    if [ -n "$ONLY_ZH" ]; then
      ONLY_ZH_COUNT=$(echo "$ONLY_ZH" | grep -v '^$' | wc -l | tr -d ' ')
      echo "    • 只在 zh-TW: $ONLY_ZH_COUNT 個"
    fi
    if [ -n "$ONLY_EN" ]; then
      ONLY_EN_COUNT=$(echo "$ONLY_EN" | grep -v '^$' | wc -l | tr -d ' ')
      echo "    • 只在 en: $ONLY_EN_COUNT 個"
    fi
  fi

  echo ""
  log_info "▶ 2/4 掃描源代碼使用情況"

  # 掃描所有可能的翻譯鍵使用模式
  # - useTranslations('namespace')
  # - t('key'), t.rich('key'), t.raw('key')
  # - tc('key')
  # - 動態鍵: t(\`\${variable}.key\`)

  # 使用 find 獲取所有源文件
  ALL_FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null)
  TOTAL_FILES=$(echo "$ALL_FILES" | wc -l | tr -d ' ')

  # 將 Node 腳本保存到臨時文件
  cat > /tmp/scan_i18n.js <<'SCANSCRIPT'
const fs = require('fs');
const path = require('path');

const usedKeys = new Set();
const usedNamespaces = new Set();
const dynamicPatterns = new Set();

// 從命令行參數讀取文件列表
const filesArg = process.argv[2] || '';
const files = filesArg.split('\n').filter(f => f.trim());

    function scanFile(filePath) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');

        // 1. useTranslations('namespace')
        const nsMatches = content.matchAll(/useTranslations\(['"]([^'"]+)['"]\)/g);
        for (const match of nsMatches) {
          usedNamespaces.add(match[1]);
        }

        // 2. t('key') 各種變體
        const tMatches = content.matchAll(/\bt(?:\.(?:rich|raw))?\(['"]([^'"]+)['"]\)/g);
        for (const match of tMatches) {
          usedKeys.add(match[1]);
        }

        // 3. tc('key')
        const tcMatches = content.matchAll(/\btc\(['"]([^'"]+)['"]\)/g);
        for (const match of tcMatches) {
          usedKeys.add(match[1]);
        }

        // 4. 檢測動態鍵模式 (template literals, concatenation, array access)
        // 檢查 t(var+) 或 t(arr[) 或 t($) 等動態模式
        if (/\bt\s*\(\s*\w+\s*[\+\[]/.test(content) || /\bt\s*\(\s*[$]/.test(content)) {
          dynamicPatterns.add(path.basename(filePath));
        }
      } catch (error) {
        // 忽略讀取錯誤
      }
    }

files.forEach(scanFile);

console.log(JSON.stringify({
  usedKeys: Array.from(usedKeys),
  usedNamespaces: Array.from(usedNamespaces),
  dynamicFiles: Array.from(dynamicPatterns),
  totalFiles: files.length
}));
SCANSCRIPT

  # 運行 Node 腳本並保存結果到臨時文件
  node /tmp/scan_i18n.js "$ALL_FILES" > /tmp/scan_result.json 2>&1 || true

  USED_KEYS=$(node -e "const data = require('/tmp/scan_result.json'); console.log(data.usedKeys.join('\n'));" 2>/dev/null || echo "")
  USED_NAMESPACES=$(node -e "const data = require('/tmp/scan_result.json'); console.log(data.usedNamespaces.join('\n'));" 2>/dev/null || echo "")
  DYNAMIC_FILES=$(node -e "const data = require('/tmp/scan_result.json'); console.log(data.dynamicFiles.join('\n'));" 2>/dev/null || echo "")

  # 計算使用的鍵數量
  USED_KEYS_COUNT=$(printf "%s\n" "$USED_KEYS" | grep -v '^$' | wc -l | tr -d ' ' || true)
  USED_NS_COUNT=$(printf "%s\n" "$USED_NAMESPACES" | grep -v '^$' | wc -l | tr -d ' ' || true)
  DYNAMIC_FILES_COUNT=$(printf "%s\n" "$DYNAMIC_FILES" | grep -v '^$' | wc -l | tr -d ' ' || true)

  log_success "  掃描 $TOTAL_FILES 個文件"
  echo "    • 找到 $USED_KEYS_COUNT 個直接使用的鍵"
  echo "    • 找到 $USED_NS_COUNT 個命名空間"

  if [ "$DYNAMIC_FILES_COUNT" -gt 0 ]; then
    log_warning "    • 檢測到 $DYNAMIC_FILES_COUNT 個文件使用動態鍵"
  fi

  echo ""
  log_info "▶ 3/4 分析未使用的翻譯鍵"

  # 精確檢查未使用的鍵
  UNUSED_ANALYSIS=$(node << UNUSEDEOF
    const definedKeys = \`$TRANSLATION_KEYS\`.split('\\n').filter(k => k);
    const usedKeys = \`$USED_KEYS\`.split('\\n').filter(k => k);
    const usedNamespaces = \`$USED_NAMESPACES\`.split('\\n').filter(k => k);

    const unused = [];
    const possiblyUsed = [];

    definedKeys.forEach(key => {
      // 直接使用檢查
      if (usedKeys.includes(key)) {
        return; // 已使用
      }

      // 命名空間檢查
      const namespace = key.split('.')[0];
      if (usedNamespaces.includes(namespace)) {
        possiblyUsed.push(key); // 可能通過命名空間使用
      } else {
        unused.push(key); // 未使用
      }
    });

    // 按命名空間分組
    const byNamespace = {};
    unused.forEach(key => {
      const ns = key.split('.')[0];
      if (!byNamespace[ns]) byNamespace[ns] = [];
      byNamespace[ns].push(key);
    });

    console.log(JSON.stringify({
      unused: unused,
      possiblyUsed: possiblyUsed,
      byNamespace: byNamespace,
      unusedCount: unused.length,
      possiblyUsedCount: possiblyUsed.length
    }));
UNUSEDEOF
  )

  UNUSED_COUNT=$(echo "$UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.unusedCount);")
  POSSIBLY_USED_COUNT=$(echo "$UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.possiblyUsedCount);")

  echo ""

  if [ "$UNUSED_COUNT" -gt 0 ]; then
    log_warning "  發現 $UNUSED_COUNT 個確定未使用的翻譯鍵"

    if [ "$SHOW_DETAILS" = true ] || [ "$DETAILED" = true ]; then
      echo ""
      echo -e "${YELLOW}未使用的翻譯鍵列表:${NC}"
      echo ""

      NAMESPACES=$(echo "$UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(Object.keys(data.byNamespace).join('\n'));")

      echo "$NAMESPACES" | while read -r ns; do
        if [ -n "$ns" ]; then
          KEYS=$(echo "$UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.byNamespace['$ns'].join('\n'));")
          KEY_COUNT=$(echo "$KEYS" | wc -l | tr -d ' ')

          echo -e "  ${CYAN}▶ $ns${NC} ($KEY_COUNT 個)"
          echo "$KEYS" | while read -r key; do
            echo "    • $key"
          done
          echo ""
        fi
      done
    else
      echo ""
      echo -e "${YELLOW}未使用的翻譯鍵命名空間:${NC}"

      NAMESPACES=$(echo "$UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(Object.keys(data.byNamespace).join('\n'));")

      echo "$NAMESPACES" | while read -r ns; do
        if [ -n "$ns" ]; then
          KEY_COUNT=$(echo "$UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.byNamespace['$ns'].length);")
          echo "  • $ns ($KEY_COUNT 個鍵)"
        fi
      done

      echo ""
      log_info "💡 使用 --show 參數查看詳細列表"
    fi
  else
    log_success "  ✓ 所有翻譯鍵都有被使用"
  fi

  if [ "$POSSIBLY_USED_COUNT" -gt 0 ]; then
    echo ""
    log_info "  ℹ️  $POSSIBLY_USED_COUNT 個鍵可能通過命名空間動態使用"
  fi

  # 保存前端未使用鍵數據到臨時文件
  echo "$UNUSED_ANALYSIS" > /tmp/frontend_unused.json

  echo ""
  log_info "▶ 4/4 等待後端掃描完成..."

  # ==========================================
  # 後端翻譯檢查
  # ==========================================
  echo ""
  echo ""
  log_info "🖥️  掃描後端翻譯使用情況..."
  echo ""

  cd "$PROJECT_ROOT/apps/backend"

  # 檢查後端翻譯文件
  if [ ! -d "src/i18n" ]; then
    log_warning "  未找到後端翻譯目錄 (src/i18n)"

    # 生成統整報告(僅前端)
    generate_summary_report "$TOTAL_KEYS" "$USED_KEYS_COUNT" "$UNUSED_COUNT" "$POSSIBLY_USED_COUNT" "0" "0" "0" "0"
    return 0
  fi

  # 1. 提取所有翻譯鍵定義
  log_info "▶ 1/4 提取翻譯鍵定義"

  # 創建後端掃描腳本
  cat > /tmp/scan_backend_i18n.js <<'BACKEND_SCAN_SCRIPT'
const fs = require('fs');
const path = require('path');

// 讀取所有翻譯文件
function getAllTranslationKeys(dir) {
  const keys = new Set();

  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // 遞歸讀取子目錄
        const subKeys = getAllTranslationKeys(filePath);
        subKeys.forEach(k => keys.add(k));
      } else if (file.endsWith('.json')) {
        // 讀取 JSON 文件
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // 獲取文件名作為命名空間 (不包括.json後綴)
        const namespace = path.basename(file, '.json');

        // 提取所有鍵 (扁平化,並加上命名空間前綴)
        function extractKeys(obj, prefix = '') {
          Object.keys(obj).forEach(key => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              extractKeys(obj[key], fullKey);
            } else {
              // 加上命名空間前綴
              keys.add(`${namespace}.${fullKey}`);
            }
          });
        }

        extractKeys(content);
      }
    });
  } catch (error) {
    // Ignore errors
  }

  return keys;
}

// 掃描所有語言的鍵
const enKeys = getAllTranslationKeys('src/i18n/en');
const zhKeys = getAllTranslationKeys('src/i18n/zh-TW');

// 找出只在某個語言存在的鍵
const onlyEn = Array.from(enKeys).filter(k => !zhKeys.has(k));
const onlyZh = Array.from(zhKeys).filter(k => !enKeys.has(k));

console.log(JSON.stringify({
  allKeys: Array.from(enKeys),
  totalKeys: enKeys.size,
  onlyEn: onlyEn,
  onlyZh: onlyZh
}));
BACKEND_SCAN_SCRIPT

  BACKEND_TRANSLATION_DATA=$(node /tmp/scan_backend_i18n.js 2>/dev/null || echo '{"allKeys":[],"totalKeys":0,"onlyEn":[],"onlyZh":[]}')

  BACKEND_TOTAL_KEYS=$(echo "$BACKEND_TRANSLATION_DATA" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.totalKeys || 0);" 2>/dev/null || echo "0")
  BACKEND_TRANSLATION_KEYS=$(echo "$BACKEND_TRANSLATION_DATA" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log((data.allKeys || []).join('\\n'));" 2>/dev/null || echo "")

  log_success "  找到 $BACKEND_TOTAL_KEYS 個翻譯鍵"

  # 檢查不一致的鍵
  BACKEND_ONLY_EN=$(echo "$BACKEND_TRANSLATION_DATA" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log((data.onlyEn || []).length);" 2>/dev/null || echo "0")
  BACKEND_ONLY_ZH=$(echo "$BACKEND_TRANSLATION_DATA" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log((data.onlyZh || []).length);" 2>/dev/null || echo "0")

  if [ "$BACKEND_ONLY_EN" -gt 0 ] || [ "$BACKEND_ONLY_ZH" -gt 0 ]; then
    log_warning "  ⚠ 發現語言不一致的鍵"
    if [ "$BACKEND_ONLY_ZH" -gt 0 ]; then
      echo "    • 只在 zh-TW: $BACKEND_ONLY_ZH 個"
    fi
    if [ "$BACKEND_ONLY_EN" -gt 0 ]; then
      echo "    • 只在 en: $BACKEND_ONLY_EN 個"
    fi
  fi

  echo ""
  log_info "▶ 2/4 掃描源代碼使用情況"

  # 掃描所有源文件
  BACKEND_ALL_FILES=$(find src -type f \( -name "*.ts" -o -name "*.js" \) ! -path "*/i18n/*" ! -name "*.spec.ts" ! -name "*.test.ts" 2>/dev/null)
  BACKEND_TOTAL_FILES=$(echo "$BACKEND_ALL_FILES" | wc -l | tr -d ' \n')

  # 創建後端代碼掃描腳本
  cat > /tmp/scan_backend_code.js <<'BACKEND_CODE_SCRIPT'
const fs = require('fs');

const usedKeys = new Set();
const filesArg = process.argv[2] || '';
const files = filesArg.split('\n').filter(f => f.trim());

files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 匹配: this.i18n.translate('key', ...) 或 i18n.translate('key', ...)
    const matches = content.matchAll(/\.i18n\.translate\(['"]([^'"]+)['"]/g);
    for (const match of matches) {
      usedKeys.add(match[1]);
    }
  } catch (error) {
    // Ignore
  }
});

console.log(JSON.stringify({
  usedKeys: Array.from(usedKeys),
  totalFiles: files.length
}));
BACKEND_CODE_SCRIPT

  node /tmp/scan_backend_code.js "$BACKEND_ALL_FILES" > /tmp/backend_scan_result.json 2>&1 || true

  BACKEND_USED_KEYS=$(node -e "const data = require('/tmp/backend_scan_result.json'); console.log(data.usedKeys.join('\\n'));" 2>/dev/null || echo "")
  BACKEND_USED_KEYS_COUNT=$(printf "%s\n" "$BACKEND_USED_KEYS" | grep -v '^$' | wc -l | tr -d ' \n' || true)
  BACKEND_USED_KEYS_COUNT=${BACKEND_USED_KEYS_COUNT:-0}

  log_success "  掃描 $BACKEND_TOTAL_FILES 個文件"
  echo "    • 找到 $BACKEND_USED_KEYS_COUNT 個直接使用的鍵"

  echo ""
  log_info "▶ 3/4 分析未使用的翻譯鍵"

  # 分析未使用的鍵
  BACKEND_UNUSED_ANALYSIS=$(node <<BACKEND_UNUSED_SCRIPT
    const definedKeys = \`$BACKEND_TRANSLATION_KEYS\`.split('\\n').filter(k => k);
    const usedKeys = \`$BACKEND_USED_KEYS\`.split('\\n').filter(k => k);

    const unused = definedKeys.filter(key => !usedKeys.includes(key));

    // 按命名空間分組
    const byNamespace = {};
    unused.forEach(key => {
      const ns = key.split('.')[0];
      if (!byNamespace[ns]) byNamespace[ns] = [];
      byNamespace[ns].push(key);
    });

    console.log(JSON.stringify({
      unused: unused,
      byNamespace: byNamespace,
      unusedCount: unused.length
    }));
BACKEND_UNUSED_SCRIPT
  )

  BACKEND_UNUSED_COUNT=$(echo "$BACKEND_UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(data.unusedCount || 0);" 2>/dev/null || echo "0")

  echo ""

  if [ "$BACKEND_UNUSED_COUNT" -gt 0 ]; then
    log_warning "  發現 $BACKEND_UNUSED_COUNT 個確定未使用的翻譯鍵"

    if [ "$SHOW_DETAILS" = true ] || [ "$DETAILED" = true ]; then
      echo ""
      echo -e "${YELLOW}未使用的翻譯鍵列表:${NC}"
      echo ""

      BACKEND_NAMESPACES=$(echo "$BACKEND_UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(Object.keys(data.byNamespace || {}).join('\\n'));" 2>/dev/null || echo "")

      echo "$BACKEND_NAMESPACES" | while read -r ns; do
        if [ -n "$ns" ]; then
          KEYS=$(echo "$BACKEND_UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log((data.byNamespace['$ns'] || []).join('\\n'));" 2>/dev/null || echo "")
          KEY_COUNT=$(echo "$KEYS" | wc -l | tr -d ' ')

          echo -e "  ${CYAN}▶ $ns${NC} ($KEY_COUNT 個)"
          echo "$KEYS" | while read -r key; do
            echo "    • $key"
          done
          echo ""
        fi
      done
    else
      echo ""
      echo -e "${YELLOW}未使用的翻譯鍵命名空間:${NC}"

      BACKEND_NAMESPACES=$(echo "$BACKEND_UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(Object.keys(data.byNamespace || {}).join('\\n'));" 2>/dev/null || echo "")

      echo "$BACKEND_NAMESPACES" | while read -r ns; do
        if [ -n "$ns" ]; then
          KEY_COUNT=$(echo "$BACKEND_UNUSED_ANALYSIS" | node -e "const data = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log((data.byNamespace['$ns'] || []).length);" 2>/dev/null || echo "0")
          echo "  • $ns ($KEY_COUNT 個鍵)"
        fi
      done

      echo ""
      log_info "💡 使用 --show 參數查看詳細列表"
    fi
  else
    log_success "  ✓ 所有翻譯鍵都有被使用"
  fi

  # 保存後端未使用鍵數據到臨時文件
  echo "$BACKEND_UNUSED_ANALYSIS" > /tmp/backend_unused.json

  echo ""
  log_info "▶ 4/4 生成報告"

  # 生成統整報告(前端+後端)
  generate_summary_report "$TOTAL_KEYS" "$USED_KEYS_COUNT" "$UNUSED_COUNT" "$POSSIBLY_USED_COUNT" "$BACKEND_TOTAL_KEYS" "$BACKEND_USED_KEYS_COUNT" "$BACKEND_UNUSED_COUNT" "0"
}

# 生成統整報告
generate_summary_report() {
  local FE_TOTAL=$1
  local FE_USED=$2
  local FE_UNUSED=$3
  local FE_POSSIBLY=$4
  local BE_TOTAL=$5
  local BE_USED=$6
  local BE_UNUSED=$7
  local BE_POSSIBLY=$8

  local TOTAL_DEFINED=$((FE_TOTAL + BE_TOTAL))
  local TOTAL_USED=$((FE_USED + BE_USED))
  local TOTAL_UNUSED=$((FE_UNUSED + BE_UNUSED))
  local TOTAL_POSSIBLY=$((FE_POSSIBLY + BE_POSSIBLY))

  # 計算實際應該刪除的鍵 (未使用且不可能動態使用)
  local FE_SHOULD_DELETE=$((FE_UNUSED))
  local BE_SHOULD_DELETE=$((BE_UNUSED))
  local TOTAL_SHOULD_DELETE=$((FE_SHOULD_DELETE + BE_SHOULD_DELETE))

  echo ""

  cat << SUMMARY_REPORT

╔══════════════════════════════════════════════════════════════╗
║           i18n 多語系翻譯鍵使用情況統整報告                  ║
╚══════════════════════════════════════════════════════════════╝

生成時間: $(date '+%Y-%m-%d %H:%M:%S')

📊 整體統計摘要
──────────────────────────────────────────────────────
  總定義鍵數:                     $TOTAL_DEFINED
  總使用鍵數:                     $TOTAL_USED
  總未使用鍵數:                   $TOTAL_UNUSED
  可能動態使用的鍵:               $TOTAL_POSSIBLY

🗑️  建議刪除
──────────────────────────────────────────────────────
  確定可刪除的鍵:                 $TOTAL_SHOULD_DELETE
  潛在可節省空間:                 $(awk "BEGIN {printf \"%.1f%%\", ($TOTAL_SHOULD_DELETE/$TOTAL_DEFINED)*100}")

📱 前端 (apps/frontend)
──────────────────────────────────────────────────────
  定義的翻譯鍵:                   $FE_TOTAL
  使用的鍵:                       $FE_USED
  未使用的鍵:                     $FE_UNUSED
  可能動態使用:                   $FE_POSSIBLY
  使用率:                         $(awk "BEGIN {printf \"%.1f%%\", ($FE_USED/$FE_TOTAL)*100}")
  ❌ 建議刪除:                     $FE_SHOULD_DELETE 個鍵

🖥️  後端 (apps/backend)
──────────────────────────────────────────────────────
  定義的翻譯鍵:                   $BE_TOTAL
  使用的鍵:                       $BE_USED
  未使用的鍵:                     $BE_UNUSED
  可能動態使用:                   $BE_POSSIBLY
  使用率:                         $(awk "BEGIN {if ($BE_TOTAL > 0) printf \"%.1f%%\", ($BE_USED/$BE_TOTAL)*100; else print \"N/A\"}")
  ❌ 建議刪除:                     $BE_SHOULD_DELETE 個鍵

⚠️  重要說明
──────────────────────────────────────────────────────
  • 未使用的翻譯鍵會增加維護成本和檔案大小
  • 這些鍵在前後端代碼中都沒有被引用
  • 建議刪除這些鍵以保持代碼庫整潔
  • 刪除前請確認是否有動態引用的情況

💡 後續操作
──────────────────────────────────────────────────────
  1. 查看詳細列表:
     ./scripts/cli.sh i18n unused --show

  2. 生成清理腳本:
     ./scripts/cli.sh i18n unused --cleanup

  3. 保存完整報告:
     ./scripts/cli.sh i18n unused --report

  4. 驗證翻譯完整性:
     pnpm test:i18n

SUMMARY_REPORT

  # 如果要保存報告
  if [ "$SAVE_REPORT" = true ]; then
    REPORT_FILE="$PROJECT_ROOT/i18n-unused-report-$(date '+%Y%m%d-%H%M%S').txt"
    cat << SUMMARY_REPORT > "$REPORT_FILE"

╔══════════════════════════════════════════════════════════════╗
║           i18n 多語系翻譯鍵使用情況統整報告                  ║
╚══════════════════════════════════════════════════════════════╝

生成時間: $(date '+%Y-%m-%d %H:%M:%S')

📊 整體統計摘要
──────────────────────────────────────────────────────
  總定義鍵數:                     $TOTAL_DEFINED
  總使用鍵數:                     $TOTAL_USED
  總未使用鍵數:                   $TOTAL_UNUSED
  可能動態使用的鍵:               $TOTAL_POSSIBLY

📱 前端 (apps/frontend)
──────────────────────────────────────────────────────
  定義的翻譯鍵:                   $FE_TOTAL
  使用的鍵:                       $FE_USED
  未使用的鍵:                     $FE_UNUSED
  可能動態使用:                   $FE_POSSIBLY
  使用率:                         $(awk "BEGIN {printf \"%.1f%%\", ($FE_USED/$FE_TOTAL)*100}")

🖥️  後端 (apps/backend)
──────────────────────────────────────────────────────
  定義的翻譯鍵:                   $BE_TOTAL
  使用的鍵:                       $BE_USED
  未使用的鍵:                     $BE_UNUSED
  可能動態使用:                   $BE_POSSIBLY
  使用率:                         $(awk "BEGIN {if ($BE_TOTAL > 0) printf \"%.1f%%\", ($BE_USED/$BE_TOTAL)*100; else print \"N/A\"}")

SUMMARY_REPORT

    echo ""
    log_success "  報告已保存: $REPORT_FILE"
  fi

  # 如果要生成清理腳本
  if [ "$GENERATE_CLEANUP" = true ]; then
    generate_cleanup_script
  fi
}

# 生成清理腳本
generate_cleanup_script() {
  local CLEANUP_SCRIPT="$PROJECT_ROOT/cleanup-unused-i18n-keys.js"

  log_info ""
  log_info "📝 生成清理腳本..."

  cat > "$CLEANUP_SCRIPT" << 'CLEANUP_SCRIPT_CONTENT'
#!/usr/bin/env node
/**
 * i18n 未使用翻譯鍵清理腳本
 *
 * ⚠️  警告: 此腳本會直接修改翻譯文件!
 * 使用前請確保:
 * 1. 已提交所有更改到 Git
 * 2. 仔細檢查要刪除的鍵列表
 * 3. 執行後運行 pnpm test:i18n 驗證
 *
 * 用法:
 *   node cleanup-unused-i18n-keys.js           # 預覽模式(不實際刪除)
 *   node cleanup-unused-i18n-keys.js --confirm # 確認執行刪除
 */

const fs = require('fs');
const path = require('path');

// 讀取未使用鍵數據
const frontendUnused = JSON.parse(fs.readFileSync('/tmp/frontend_unused.json', 'utf8'));
const backendUnused = JSON.parse(fs.readFileSync('/tmp/backend_unused.json', 'utf8'));

const DRY_RUN = !process.argv.includes('--confirm');

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║         i18n 未使用翻譯鍵清理腳本                            ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

if (DRY_RUN) {
  console.log('🔍 預覽模式 (不會實際修改文件)');
  console.log('   使用 --confirm 參數執行實際刪除\n');
} else {
  console.log('⚠️  執行模式 - 將會修改文件!\n');
}

// 刪除嵌套對象中的鍵
function deleteNestedKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) return false;
    current = current[parts[i]];
  }

  const lastKey = parts[parts.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  return false;
}

// 清理空對象
function cleanEmptyObjects(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      cleanEmptyObjects(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

// 處理前端翻譯文件
function cleanupFrontend() {
  console.log('📱 前端翻譯清理\n');
  console.log(`   將刪除 ${frontendUnused.unusedCount} 個未使用的鍵\n`);

  if (frontendUnused.unusedCount === 0) {
    console.log('   ✓ 無需清理\n');
    return;
  }

  const langs = ['zh-TW', 'en'];
  let totalDeleted = 0;

  langs.forEach(lang => {
    const filePath = path.join(__dirname, 'apps/frontend/messages', `${lang}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  文件不存在: ${filePath}`);
      return;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let deleted = 0;

    frontendUnused.unused.forEach(key => {
      if (deleteNestedKey(content, key)) {
        deleted++;
        totalDeleted++;
      }
    });

    cleanEmptyObjects(content);

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    }

    console.log(`   ${lang}.json: ${deleted} 個鍵已${DRY_RUN ? '標記' : '刪除'}`);
  });

  console.log(`\n   總計: ${totalDeleted} 個鍵${DRY_RUN ? '將被' : '已'}刪除\n`);
}

// 處理後端翻譯文件
function cleanupBackend() {
  console.log('🖥️  後端翻譯清理\n');
  console.log(`   將刪除 ${backendUnused.unusedCount} 個未使用的鍵\n`);

  if (backendUnused.unusedCount === 0) {
    console.log('   ✓ 無需清理\n');
    return;
  }

  const langs = ['en', 'zh-TW'];
  let totalDeleted = 0;

  // 按文件分組
  const byFile = {};
  backendUnused.unused.forEach(key => {
    const parts = key.split('.');
    const fileName = parts[0]; // 例如: auth, email, validation
    const actualKey = parts.slice(1).join('.');

    if (!byFile[fileName]) byFile[fileName] = [];
    byFile[fileName].push(actualKey);
  });

  Object.entries(byFile).forEach(([fileName, keys]) => {
    console.log(`   處理文件: ${fileName}.json`);

    langs.forEach(lang => {
      const filePath = path.join(__dirname, 'apps/backend/src/i18n', lang, `${fileName}.json`);

      if (!fs.existsSync(filePath)) {
        console.log(`     ⚠️  文件不存在: ${filePath}`);
        return;
      }

      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let deleted = 0;

      keys.forEach(key => {
        if (deleteNestedKey(content, key)) {
          deleted++;
          totalDeleted++;
        }
      });

      cleanEmptyObjects(content);

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
      }

      console.log(`     ${lang}/${fileName}.json: ${deleted} 個鍵已${DRY_RUN ? '標記' : '刪除'}`);
    });
  });

  console.log(`\n   總計: ${totalDeleted} 個鍵${DRY_RUN ? '將被' : '已'}刪除\n`);
}

// 執行清理
try {
  cleanupFrontend();
  cleanupBackend();

  console.log('════════════════════════════════════════════════════════════════\n');

  if (DRY_RUN) {
    console.log('💡 下一步:');
    console.log('   1. 檢查上述列表,確認要刪除的鍵');
    console.log('   2. 執行: node cleanup-unused-i18n-keys.js --confirm');
    console.log('   3. 執行: pnpm test:i18n');
    console.log('   4. 提交更改到 Git\n');
  } else {
    console.log('✅ 清理完成!\n');
    console.log('💡 下一步:');
    console.log('   1. 執行: pnpm test:i18n');
    console.log('   2. 檢查應用功能是否正常');
    console.log('   3. 提交更改到 Git\n');
  }
} catch (error) {
  console.error('❌ 錯誤:', error.message);
  process.exit(1);
}
CLEANUP_SCRIPT_CONTENT

  chmod +x "$CLEANUP_SCRIPT"

  echo ""
  log_success "✅ 清理腳本已生成: $CLEANUP_SCRIPT"
  echo ""
  log_info "📋 使用方式:"
  echo ""
  echo "  1. 預覽模式 (不實際刪除):"
  echo "     node $CLEANUP_SCRIPT"
  echo ""
  echo "  2. 執行刪除:"
  echo "     node $CLEANUP_SCRIPT --confirm"
  echo ""
  log_warning "⚠️  注意: 執行前請確保已提交所有更改到 Git!"
  echo ""
}

# 顯示統計
show_stats() {
  print_header "i18n 翻譯統計"

  echo -e "${CYAN}後端翻譯:${NC}"
  echo ""

  for lang in en zh-TW; do
    echo -e "  ${YELLOW}$lang${NC}"
    cd "$PROJECT_ROOT/apps/backend/src/i18n/$lang"
    for file in *.json; do
      if [ -f "$file" ]; then
        local keys=$(grep -o '"[^"]*"' "$file" | wc -l | tr -d ' ')
        local lines=$(wc -l < "$file" | tr -d ' ')
        printf "    %-20s %3d 鍵  (%3d 行)\n" "$file" "$keys" "$lines"
      fi
    done
    echo ""
  done

  echo -e "${CYAN}前端翻譯:${NC}"
  echo ""

  for lang in en zh-TW; do
    local file="$PROJECT_ROOT/apps/frontend/messages/$lang.json"
    if [ -f "$file" ]; then
      local keys=$(grep -o '"[^"]*"' "$file" | wc -l | tr -d ' ')
      local lines=$(wc -l < "$file" | tr -d ' ')
      echo -e "  ${YELLOW}$lang.json${NC}"
      printf "    總鍵數: %d 鍵  (%d 行)\n" "$keys" "$lines"
      echo ""
    fi
  done

  echo -e "${CYAN}支援的語言:${NC}"
  echo "  • en (English)"
  echo "  • zh-TW (繁體中文)"
  echo ""
}

# 解析參數
if [[ $# -eq 0 ]]; then
  show_command_help
  exit 0
fi

case "$1" in
  test)
    run_test
    ;;
  generate)
    generate_types
    ;;
  unused)
    check_unused "$@"
    ;;
  stats)
    show_stats
    ;;
  -h|--help)
    show_command_help
    exit 0
    ;;
  *)
    log_error "未知的命令: $1"
    show_command_help
    exit 1
    ;;
esac
