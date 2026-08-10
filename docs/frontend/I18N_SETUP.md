# 前端 i18n 設置指南

入口網以 [next-intl](https://next-intl.dev/) 提供中／英雙語。語言由 URL locale 前綴決定（`/en`、`/zh-TW`），無後端、無使用者偏好同步。

## 架構

| 檔案                                      | 作用                                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/i18n/routing.ts`                     | 定義 locales（`en`、`zh-TW`）、預設語言（`en`）與 `localePrefix: 'always'`；匯出 localized 的 `Link` / `redirect` / `usePathname` / `useRouter`。 |
| `src/i18n/request.ts`                     | `getRequestConfig`：依 request locale 載入對應 `messages/<locale>.json`，無效 locale 回退預設。                                                   |
| `src/i18n/use-nav-router.ts`              | `useNavRouter`：包裝 next-intl router，程式式導航（`push`/`replace`/`back`/`forward`）時觸發頂部進度條。                                          |
| `src/proxy.ts`                            | next-intl middleware（locale 偵測與轉址）＋ CSP nonce。                                                                                           |
| `messages/en.json`、`messages/zh-TW.json` | 翻譯內容。                                                                                                                                        |

## 訊息結構

翻譯只含兩個命名空間：

- `a11y` — 無障礙字串（skip link、外部連結 aria-label 等）。
- `portal` — 入口網內容（eyebrow、heading、footer、計畫詳情 `detail`、敘事 `narrative` 等）。

兩個語系檔的 key 必須完全對稱，新增文字時兩邊同步增修。

## 取用翻譯

Server Component：

```tsx
import { getTranslations } from 'next-intl/server';

const t = await getTranslations('portal');
return <h1>{t('heading')}</h1>;
```

Client Component：

```tsx
'use client';
import { useTranslations } from 'next-intl';

const t = useTranslations('portal');
return <p>{t('viewingPlan', { name })}</p>;
```

帶變數或富文本（如 `narrative.body1` 內的 `<link>`）時，用 next-intl 的參數與 rich text 機制傳入。

## 語言切換與導航

- 切換語言＝切換 URL locale 前綴；用 `@/i18n/routing` 的 localized `Link` / `redirect`。
- 程式式導航改用 `@/i18n/use-nav-router` 的 `useNavRouter`，以便觸發進度條。
- `<html lang>` 由 `app/layout.tsx` 依當前 locale（`getLocale()`）設定，符合無障礙與政府網站規範。

## 型別安全

由英文訊息檔生成型別定義：

```bash
pnpm --filter @mead/frontend generate-i18n-types
```

輸出 `src/types/i18n.generated.ts`（`Messages` interface），新增／調整 key 後重新生成。

## 完整性測試

`src/i18n-completeness.test.ts` 檢查各語系 key 對稱、無缺漏：

```bash
pnpm test:i18n
```

新增翻譯後務必跑此測試，確保兩語系一致。

## 相關文檔

- [組件庫指南](./COMPONENT_LIBRARY.md)
- [SPOSAD 入口網](./SPOSAD_PORTAL.md)
