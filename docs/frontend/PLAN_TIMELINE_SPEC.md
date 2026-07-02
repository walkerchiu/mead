# 計畫時程（Timeline）資料格式與填寫說明

三大計畫入口網的「計畫時程」模組為**資料驅動**：只要在 `apps/frontend/public/data/plans.json`
的各計畫底下維護 `timelines` 欄位，前端（計畫卡與詳細頁）即自動依規則繪製時間軸、
tooltip 與事件列表，無需改程式。本文件為填寫規格；業主／編輯照此格式填即可。

- 型別定義：`apps/frontend/src/types/plan.ts`（`TimelineEvent` / `PlanTimelineYear`）
- 呈現元件：`apps/frontend/src/components/public/molecules/PlanTimeline/`

## 資料層級

```text
plans[]
  plan                       # 單一計畫（sposad / tisdc / idc）
    timelines[]              # 可有多個年度
      { year, label?, events[] }
        events[]             # 該年度的時程事件
```

一個計畫可有多個年度（例如菁培含「當年 2026」與「隔年 2027」）。前端會在計畫卡／
詳細頁以**年度切換鈕**呈現多年度；單一年度則直接顯示年度標籤。

## 放置位置

在 `plans.json` 中，於各計畫物件內新增（或維護）`timelines` 陣列，建議放在
`decorativeText` 之後：

```json
{
  "id": "sposad",
  "...": "其他既有欄位不動",
  "decorativeText": [ ... ],
  "timelines": [
    { "year": 2026, "events": [ /* 事件… */ ] }
  ]
}
```

## 欄位說明

### 年度物件 `PlanTimelineYear`

| 欄位     | 必填 | 型別              | 說明                                                          |
| -------- | ---- | ----------------- | ------------------------------------------------------------- |
| `year`   | ✅   | number            | 西元年，例如 `2026`。                                         |
| `label`  | —    | string            | 年度顯示文字，例如 `"隔年（2027）"`；省略時顯示 `${year}年`。 |
| `events` | ✅   | `TimelineEvent[]` | 該年度的事件清單（順序不拘，前端會依起始時間排序）。          |

### 事件物件 `TimelineEvent`

| 欄位        | 必填       | 型別                   | 說明                                                                       |
| ----------- | ---------- | ---------------------- | -------------------------------------------------------------------------- |
| `id`        | ✅         | string                 | 全站唯一識別碼，建議 `計畫-年度-用途`，例如 `sposad-2026-brief`。          |
| `kind`      | ✅         | `"point"` \| `"range"` | `point` 單一時間點（圓點）；`range` 期間（長條）。                         |
| `precision` | ✅         | `"month"` \| `"day"`   | `month` 只到月；`day` 精確到日。                                           |
| `start`     | ✅         | `{ month, day? }`      | 起點。`precision: "day"` 時需填 `day`。                                    |
| `end`       | range 必填 | `{ month, day? }`      | 期間終點（`kind: "range"` 才需要）。                                       |
| `dateLabel` | ✅         | string                 | 顯示用日期字串，**照設計文案原樣填**，例如 `"3月"`、`"4/27(一)-7/6(一)"`。 |
| `title`     | ✅         | string                 | 事件名稱，例如 `"簡章公告"`。                                              |
| `note`      | —          | string                 | 補充說明；有填才會出現在 tooltip／列表，未填則不顯示。                     |

- `month` 為 1–12、`day` 為 1–31。
- `dateLabel` 純顯示用，前端不解析它；實際位置一律由 `start`／`end`／`precision` 計算，
  所以 `dateLabel` 與 `start`／`end` 要對得起來（例如 `"3-5月"` 對應 `start.month:3`、`end.month:5`）。

## 事件類型與時間精度

- `kind: "range"`：期間，畫成長條。
- `kind: "point"`：單一時間點，畫成圓點。
- `precision: "month"`：只有月份；期間以整月比例計算，時間點置於該月中央。
- `precision: "day"`：有日期；期間以日期比例計算（並套用最小可視寬度），時間點按日期比例放置。

**重疊自動分列**：同一年度若有多個期間在時間上重疊（例如「宣傳期 1–7 月」與
「報名 4/27–7/6」），前端會自動把它們排到不同列（lane），不會互相覆蓋；填寫時
不必自行處理排列。

## 位置計算規則（供驗收對照，填寫者可略）

年度軸固定 1 月到 12 月。

```text
# 月份級期間
left  = (startMonth - 1) / 12
width = (endMonth - startMonth + 1) / 12

# 月份級時間點
left  = (month - 0.5) / 12

# 日期級期間（dayOfYear 以平年 365 天計）
left  = dayOfYear(start) / 365
width = max(dayOfYear(end)/365 - left, 最小寬度)

# 日期級時間點
left  = dayOfYear(date) / 365
```

## 互動規則（前端已實作，填寫者可略）

- 桌機 hover／鍵盤 focus、行動裝置點擊，皆顯示 tooltip（含 `dateLabel`、`title`、`note`）。
- 時間軸下方一律附上**當年度事件列表**（首頁計畫卡與詳細頁皆有），避免只靠 hover
  才能取得資訊（行動裝置無 hover）。

## 填寫範本（可直接複製後修改）

單一年度：

```json
"timelines": [
  {
    "year": 2026,
    "events": [
      {
        "id": "<計畫>-2026-<用途>",
        "kind": "point",
        "precision": "month",
        "start": { "month": 3 },
        "dateLabel": "3月",
        "title": "事件名稱",
        "note": "可省略的補充說明。"
      },
      {
        "id": "<計畫>-2026-<用途>",
        "kind": "range",
        "precision": "day",
        "start": { "month": 4, "day": 27 },
        "end": { "month": 7, "day": 6 },
        "dateLabel": "4/27(一)-7/6(一)",
        "title": "期間名稱"
      }
    ]
  }
]
```

多年度（含隔年）：

```json
"timelines": [
  { "year": 2026, "events": [ /* … */ ] },
  {
    "year": 2027,
    "label": "隔年（2027）",
    "events": [ /* … */ ]
  }
]
```

## 已填內容（目前線上資料，可作為對照範例）

- **菁培（sposad）**：2026 年（簡章公告及受理報名 3–5 月／報名截止及國內初審 6–7 月／
  國內研習營 7–8 月／國內複審 12 月）＋隔年 2027（海外決選 1–5 月／出發 9 月）。
- **戰國策（idc）**：2026 年（校園巡迴展 3–5 月／專題講座 5 月／獎勵金申請 6–7 月／
  來自亞洲的設計力量 9 月／核發名單 11 月／IDC 頒獎典禮 12 月）。
- **大賽（tisdc）**：2026 年，含月份級（宣傳期 1–7 月）與日期級事件（報名／初選／
  入圍公告／實體決選／公告獲獎名單／頒獎典禮／得獎作品展）。

實際內容以 `apps/frontend/public/data/plans.json` 的 `timelines` 為準。
