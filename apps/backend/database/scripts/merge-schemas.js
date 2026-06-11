#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Prisma Schema 合併腳本
 *
 * 將 prisma/schemas/ 目錄下的所有 .prisma 檔案合併成單一 schema.prisma
 */

const fs = require('fs');
const path = require('path');

const SCHEMAS_DIR = path.join(__dirname, '../prisma/schemas');
const OUTPUT_FILE = path.join(__dirname, '../prisma/schema.prisma');

function mergeSchemas() {
  console.log('🔄 開始合併 Prisma schema 檔案...\n');

  // 讀取所有 schema 檔案
  const schemaFiles = fs
    .readdirSync(SCHEMAS_DIR)
    .filter((file) => file.endsWith('.prisma'))
    .sort((a, b) => {
      // base.prisma 必須放最前面
      if (a === 'base.prisma') return -1;
      if (b === 'base.prisma') return 1;
      return a.localeCompare(b);
    });

  console.log('📁 找到的 schema 檔案：');
  schemaFiles.forEach((file) => console.log(`   - ${file}`));
  console.log('');

  // 合併內容
  let mergedContent = '// This file is auto-generated. DO NOT EDIT manually.\n';
  mergedContent +=
    '// Edit files in prisma/schemas/ instead and run: pnpm db:merge-schemas\n';
  // 不輸出時間戳，避免每次重新產生時造成 schema.prisma 無意義 churn（檔頭已標示 auto-generated）。
  mergedContent += '\n';

  schemaFiles.forEach((file) => {
    const filePath = path.join(SCHEMAS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    mergedContent += `// ============================================\n`;
    mergedContent += `// Source: ${file}\n`;
    mergedContent += `// ============================================\n\n`;
    mergedContent += content.trim() + '\n\n';
  });

  // 寫入合併後的檔案
  fs.writeFileSync(OUTPUT_FILE, mergedContent);

  console.log('✅ Schema 合併完成！');
  console.log(`📄 輸出檔案: ${OUTPUT_FILE}\n`);
}

try {
  mergeSchemas();
} catch (error) {
  console.error('❌ 合併失敗:', error.message);
  process.exit(1);
}
