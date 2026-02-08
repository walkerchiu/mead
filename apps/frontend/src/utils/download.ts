/**
 * Download Utility Functions
 *
 * 提供檔案下載功能,支援 JSON、CSV 和通用 Blob 下載
 */

/**
 * 下載 JSON 檔案
 *
 * @param data - 要下載的資料物件
 * @param filename - 檔案名稱（包含 .json 副檔名）
 *
 * @example
 * ```ts
 * downloadJSON({ id: '123', name: 'Test' }, 'data.json');
 * ```
 */
export function downloadJSON(
  data: Record<string, any> | Array<any>,
  filename: string,
): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, filename);
}

/**
 * 下載 CSV 檔案（單一記錄）
 *
 * 將單一物件轉換為 CSV 格式並下載
 * 第一行為標題（欄位名稱）,第二行為值
 *
 * @param data - 要下載的資料物件
 * @param filename - 檔案名稱（包含 .csv 副檔名）
 *
 * @example
 * ```ts
 * downloadCSV({ id: '123', name: 'Test', email: 'test@example.com' }, 'data.csv');
 * ```
 */
export function downloadCSV(data: Record<string, any>, filename: string): void {
  const headers = Object.keys(data);
  const values = Object.values(data).map((v) => {
    // 處理特殊字元和換行
    const str = v != null ? String(v) : '';
    // 如果包含逗號、引號或換行,需要用引號包裹並轉義內部引號
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  });

  const csvContent = [headers.join(','), values.join(',')].join('\n');

  // 添加 BOM 以支援 Excel 正確顯示 UTF-8
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  downloadBlob(blob, filename);
}

/**
 * 下載 CSV 檔案（多筆記錄）
 *
 * 將陣列資料轉換為 CSV 格式並下載
 * 第一行為標題,後續行為各筆資料
 *
 * @param data - 要下載的資料陣列
 * @param filename - 檔案名稱（包含 .csv 副檔名）
 *
 * @example
 * ```ts
 * downloadCSVArray([
 *   { id: '1', name: 'Test1' },
 *   { id: '2', name: 'Test2' }
 * ], 'data.csv');
 * ```
 */
export function downloadCSVArray(
  data: Array<Record<string, any>>,
  filename: string,
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // 取得所有可能的欄位名稱
  const allKeys = new Set<string>();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });
  const headers = Array.from(allKeys);

  // 處理每一行資料
  const rows = data.map((item) => {
    return headers
      .map((header) => {
        const value = item[header];
        const str = value != null ? String(value) : '';
        // 如果包含逗號、引號或換行,需要用引號包裹並轉義內部引號
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  // 添加 BOM 以支援 Excel 正確顯示 UTF-8
  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  downloadBlob(blob, filename);
}

/**
 * 通用 Blob 下載
 *
 * 創建臨時連結並觸發下載
 *
 * @param blob - 要下載的 Blob 物件
 * @param filename - 檔案名稱
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // 清理
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * 下載文字檔案
 *
 * @param content - 文字內容
 * @param filename - 檔案名稱
 * @param mimeType - MIME 類型（預設為 text/plain）
 *
 * @example
 * ```ts
 * downloadText('Hello World', 'hello.txt');
 * downloadText('<html>...</html>', 'page.html', 'text/html');
 * ```
 */
export function downloadText(
  content: string,
  filename: string,
  mimeType: string = 'text/plain',
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  downloadBlob(blob, filename);
}
