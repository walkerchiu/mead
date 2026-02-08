/**
 * 密碼相似度檢查工具
 * 基於業界最佳實踐（NIST SP 800-63B, OWASP）
 */

/**
 * 從文字中提取有意義的 tokens
 * 拆分方式：空格、點、下劃線、連字符
 * 只返回長度 ≥ 3 的 tokens（避免誤判）
 */
export function extractTokens(text: string): string[] {
  if (!text) return [];

  return (
    text
      .toLowerCase()
      // 拆分常見分隔符號（包含單引號、撇號等）
      .split(/[\s._\-@']+/)
      // 過濾太短的 token（長度 < 3）
      .filter((token) => token.length >= 3)
      // 去重
      .filter((token, index, self) => self.indexOf(token) === index)
  );
}

/**
 * 正規化密碼，將常見的字母數字替換還原
 * 這樣可以檢測到 "J0hn" 實際上是 "john" 的變體
 *
 * 常見替換對照：
 * - 0 → o
 * - 1 → i (或 l)
 * - 3 → e
 * - 4 → a
 * - 5 → s
 * - 7 → t
 * - 8 → b
 * - @ → a
 * - $ → s
 */
export function normalizePassword(password: string): string {
  return password
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's');
}

/**
 * 反轉字串
 * 用於檢測反轉的用戶名（如 "ecilA" 來自 "Alice"）
 */
export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * 檢查密碼是否包含用戶資訊的任何有意義的部分
 *
 * @param password 要檢查的密碼
 * @param tokens 用戶資訊的 tokens（已提取並小寫化）
 * @returns 是否包含任何 token
 */
export function containsAnyToken(password: string, tokens: string[]): boolean {
  if (tokens.length === 0) return false;

  const passwordLower = password.toLowerCase();
  const normalizedPassword = normalizePassword(password);

  for (const token of tokens) {
    // 檢查 1: 直接包含（忽略大小寫）
    if (passwordLower.includes(token)) {
      return true;
    }

    // 檢查 2: 正規化後包含（檢測數字替換）
    if (normalizedPassword.includes(token)) {
      return true;
    }

    // 檢查 3: 反轉後包含
    const reversedToken = reverseString(token);
    if (passwordLower.includes(reversedToken)) {
      return true;
    }

    // 檢查 4: 正規化 + 反轉
    if (normalizedPassword.includes(reversedToken)) {
      return true;
    }
  }

  return false;
}

/**
 * 從 email 中提取 tokens
 *
 * @param email Email 地址
 * @param includeDomain 是否包含網域部分的檢查（預設：false）
 *
 * @example
 * extractEmailTokens('john.smith@example.com')
 * // Returns: ['john', 'smith']
 *
 * @example
 * extractEmailTokens('alice@techcorp.com', true)
 * // Returns: ['alice', 'techcorp']
 *
 * @remarks
 * 通常不建議檢查網域部分，因為：
 * 1. 公開 email 服務的網域很通用（gmail, outlook）
 * 2. 可能造成誤判（如 car.com → 密碼包含 "career"）
 *
 * 但在以下情況可以考慮啟用 includeDomain：
 * - 企業內部系統，所有員工使用統一的公司網域
 * - 公司名稱獨特且有意義
 */
export function extractEmailTokens(
  email: string,
  includeDomain: boolean = false,
): string[] {
  const [username, domain] = email.split('@');
  const tokens = extractTokens(username);

  if (includeDomain && domain) {
    // 提取網域名稱（去除 .com, .co.uk 等後綴）
    const domainName = domain.split('.')[0];
    const domainTokens = extractTokens(domainName);
    tokens.push(...domainTokens);
  }

  return tokens;
}

/**
 * 從姓名中提取 tokens
 *
 * @example
 * extractNameTokens('John Smith')
 * // Returns: ['john', 'smith']
 *
 * @example
 * extractNameTokens('Alice')
 * // Returns: ['alice']
 */
export function extractNameTokens(name: string): string[] {
  return extractTokens(name);
}
