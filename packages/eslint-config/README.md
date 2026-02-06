# @repo/eslint-config

共享 ESLint 規則設定，支援 ESLint 9 Flat Config。

## 可用設定

| 設定檔     | 用途                              |
| ---------- | --------------------------------- |
| `base.mjs` | 基礎規則（TypeScript + Prettier） |
| `next.mjs` | Next.js 前端專用規則              |

## 使用方式

```js
import baseConfig from '@repo/eslint-config/base';

export default [...baseConfig];
```

## 依賴

- `@eslint/js` 9.x
- `typescript-eslint` 8.x
- `eslint-config-prettier`
- `eslint-plugin-prettier`
