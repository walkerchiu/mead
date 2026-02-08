# @npt/typescript-config

共享 TypeScript 編譯器設定預設檔。

## 可用設定

| 設定檔               | 用途                                        |
| -------------------- | ------------------------------------------- |
| `base.json`          | 基礎設定                                    |
| `nestjs.json`        | NestJS 後端（ES2022、Decorators、CommonJS） |
| `nextjs.json`        | Next.js 前端                                |
| `react-library.json` | React 組件庫                                |

## 使用方式

在 `tsconfig.json` 中繼承：

```json
{
  "extends": "@npt/typescript-config/nextjs.json"
}
```
