# Hero Decorative Word Breathing Design

## Goal

Hero 裝飾文字要呈現背景感的「呼吸」節奏。每個詞應該以穩定錯開的週期與透明度變化此起彼落，不應整片一起出現或一起消失。

## Scope

- 只調整 `DecorativeTextCloud` 的裝飾文字動畫節奏。
- 不改 hero 色塊座標、文字座標、hover 照片、資料結構或 i18n 內容。
- 保留既有計畫切換時的淡出／淡入緩衝。

## Design

每個裝飾詞仍使用 CSS 動畫，但由 `renderWord` 依照詞的 index 產生穩定的動畫參數：

- `animationDuration`：每個詞不同，避免同週期同步。
- `animationDelay`：使用負延遲，讓首屏載入時各詞已分散在不同相位。
- `--word-min-opacity` / `--word-max-opacity`：每個詞有略不同的明暗深度，形成自然層次。

`portalTwinkle` 改為讀 CSS 變數，透明度曲線維持慢進、停留、慢退。計畫切換時，`portalWordFadeOut` / `portalWordFadeIn` 仍負責舊詞與新詞的接力；新詞淡入後再進入各自錯開的呼吸相位。

## Acceptance

- 同一組裝飾詞的 `animationDuration` 不全相同。
- 同一組裝飾詞的 `animationDelay` 不全相同。
- 裝飾詞帶有不同的 opacity CSS 變數。
- `portalTwinkle` 不再硬編碼所有詞同一組 0/1 透明度，而是讀 per-word CSS 變數。
- `prefers-reduced-motion` 繼續停用動畫。
