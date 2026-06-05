'use client';

import { useEffect, useState, type ReactNode } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { portalTokens } from '../../tokens';

export interface PortalIntroSectionProps {
  /** 上方小標，預設「教育部藝術設計三大計畫」 */
  eyebrow?: string;
  /** 主標題（可含橘色關鍵字節點），預設「為臺灣藝術設計開啟更多可能」 */
  heading?: ReactNode;
  /** 主標識別鍵 — 變動時觸發淡入淡出交疊過場（依設計師 spec） */
  headingKey?: string;
  /** 展開模式：true 時觸發 slogan exit on expand（依 IMPLEMENTATION.md §4.1） */
  exiting?: boolean;
}

interface HeadingLayer {
  id: number;
  key: string;
  node: ReactNode;
}

/** 模組級遞增 id —— 確保 layer key 唯一，避免重複 key 導致 React reconcile 出錯 */
let LAYER_ID = 0;

/** 主標切換過場時間（ms），需與 keyframes 動畫長度一致 */
const TRANSITION_MS = 420;

/**
 * Slogan 退場動畫總時長（ms）— 點擊計畫卡到大卡完整就位的整段過渡：
 *  - Phase A 0–27%（0–1000ms）：被點擊的卡 + 主標整句（黑字 + 橘字 + 小標）一起
 *    往上抽離（1.0s 的「整句往上飄」）。
 *  - Phase B 27–40%（1000–1500ms）：停 0.5s（橘字「抓住一下」的停頓）。
 *  - Phase C 40–67%（1500–2500ms）：黑字 + 小標 + 被點擊的卡繼續上升 1s、淡出視野。
 *                                     橘字保持在 phase A 落點不動。
 *  - Phase D 67–81%（2500–3000ms）：橘字單獨存在 0.5s（強調其「主角」身分，
 *                                     被點擊的卡仍停在 -120 等候）。
 *  - Phase E 81–89%（3000–3300ms）：被點擊的卡顏色變淺、放大到 3x、淡出 0.3s；
 *                                     同時段橘字也淡出。
 *  - Buffer 89–100%（3300–3700ms）：計畫大卡 slide 結尾（總尾段）。
 *  此值會被 PlanCarousel.EXIT_MS 引用，確保兩邊節奏完全同步。
 */
export const SLOGAN_EXIT_MS = 3700;

/**
 * PortalIntroSection — 入口網主標題區塊。
 *
 * 置中的小標 + 大標題，承接 hero 文字雲、引出下方計畫卡片。
 * hover 計畫卡片時主標切換為「讓 ___ 被看見」（關鍵字橘色）；切換採「舊標淡出
 * 上移、新標淡入下移」交疊過場（依 spec「淡入淡出 + 輕微位移」）。
 */
export function PortalIntroSection({
  eyebrow = '教育部藝術設計三大計畫',
  heading = '為臺灣藝術設計開啟更多可能',
  headingKey,
  exiting = false,
}: PortalIntroSectionProps) {
  const currentKey = headingKey ?? 'init';
  // layers：最後一個為當前 in-flow 主標，其餘為退場中的絕對定位覆蓋層
  const [layers, setLayers] = useState<HeadingLayer[]>(() => [
    { id: ++LAYER_ID, key: currentKey, node: heading },
  ]);

  // Render-time 衍生：
  //  - key 變動 → 加入新 layer 觸發 cross-fade
  //  - 同 key + 內容變動（如 keyword 切換） → 更新最後一層的 node，不啟動 cross-fade
  const last = layers[layers.length - 1];
  if (!last || last.key !== currentKey) {
    setLayers((prev) => [
      ...prev,
      { id: ++LAYER_ID, key: currentKey, node: heading },
    ]);
  } else if (last.node !== heading) {
    // 同 key 但 ReactNode 不同（如 keyword span 變了） → 只更新最後一層
    setLayers((prev) =>
      prev.map((l, i) => (i === prev.length - 1 ? { ...l, node: heading } : l)),
    );
  }

  // 過場結束後清掉舊 layer（setState 寫在 setTimeout 回呼裡，不在 effect 主體）
  useEffect(() => {
    if (layers.length <= 1) return;
    const t = window.setTimeout(() => {
      setLayers((prev) => (prev.length > 1 ? prev.slice(-1) : prev));
    }, TRANSITION_MS);
    return () => window.clearTimeout(t);
  }, [layers]);

  // 共用 ease — 與 PlanCarousel 退場動畫對齊
  const exitEase = 'cubic-bezier(0.22, 1, 0.36, 1)';
  return (
    <Box sx={{ textAlign: 'center', px: 3 }}>
      {/* 小標 — 依設計稿：14px / 500 / line-height 180% / letter-spacing 0 */}
      <Typography
        component="p"
        sx={{
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.8,
          letterSpacing: 0,
          color: '#1A1A1A',
          // 小標跟著黑字整句一起升起、暫停、再繼續上升淡出（同 keyframes）。
          ...(exiting && {
            animation: `sloganExitRiseFly ${SLOGAN_EXIT_MS}ms ${exitEase} forwards`,
            willChange: 'transform, opacity',
          }),
          '@keyframes sloganExitRiseFly': {
            '0%': { transform: 'translateY(0)', opacity: 1 },
            '27%': { transform: 'translateY(-120px)', opacity: 1 },
            '40%': { transform: 'translateY(-120px)', opacity: 1 },
            '67%': { transform: 'translateY(-380px)', opacity: 0 },
            '100%': { transform: 'translateY(-380px)', opacity: 0 },
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      >
        {eyebrow}
      </Typography>
      {/* 主標 — 依設計稿：24px / 500 / line-height 180% / letter-spacing 14%；
          keyword 橘字由內層 span 控制。
          語意上為 h2（h1 由 PortalLandingPage 的 visually-hidden 常駐主標承接），
          確保 expanded mode 下 PortalIntroSection unmount 仍有 h1 存在。 */}
      <Typography
        component="h2"
        sx={{
          position: 'relative',
          mt: '40px',
          fontSize: 24,
          fontWeight: 500,
          lineHeight: 1.8,
          letterSpacing: '0.14em',
          color: '#1A1A1A',
          [portalTokens.mq.tabletUp]: { mt: '77px' },
          // ★ Slogan exit on click（依使用者描述）：
          //  - 整句先一起向上抽離 0 → -120px（Phase A 0–38%）。
          //  - 在第二屏邊緣停 0.5s（Phase B 38–68%）。
          //  - 黑字（「讓」/「被看見」）繼續上升至 -380px 並淡出（Phase C 68–88%）。
          //  - 橘字（keyword）守在 -120px 不動，直到 Phase D（88–100%）才淡出。
          // 父層 h1 不套 transform，動畫掛在內層黑字 / 橘字 span 上，避免 nested
          // transform 互相覆寫造成橘字被父層的 -380 帶走。
          ...(exiting && {
            '& span[data-slogan-black]': {
              display: 'inline-block',
              animation: `sloganExitRiseFly ${SLOGAN_EXIT_MS}ms ${exitEase} forwards`,
              willChange: 'transform, opacity',
            },
            '& span[data-slogan-keyword]': {
              animation: `sloganExitKeywordGrip ${SLOGAN_EXIT_MS}ms ${exitEase} forwards`,
              willChange: 'transform, opacity',
            },
          }),
          // 黑字 / 小標：升 → 停 → 繼續升 + 淡出。
          '@keyframes sloganExitRiseFly': {
            '0%': { transform: 'translateY(0)', opacity: 1 },
            '27%': { transform: 'translateY(-120px)', opacity: 1 },
            '40%': { transform: 'translateY(-120px)', opacity: 1 },
            '67%': { transform: 'translateY(-380px)', opacity: 0 },
            '100%': { transform: 'translateY(-380px)', opacity: 0 },
          },
          // 橘字：升起跟著大家 → 停 → 繼續停（讓黑字先離開）→ 最後才淡出。
          // 「抓住一下才放手」— 強調 keyword 是這頁的主角。
          '@keyframes sloganExitKeywordGrip': {
            '0%': { transform: 'translateY(0)', opacity: 1 },
            '27%': { transform: 'translateY(-120px)', opacity: 1 },
            '81%': { transform: 'translateY(-120px)', opacity: 1 },
            '89%': { transform: 'translateY(-120px)', opacity: 0 },
            '100%': { transform: 'translateY(-120px)', opacity: 0 },
          },
          '@media (prefers-reduced-motion: reduce)': {
            '& span[data-slogan-black], & span[data-slogan-keyword]': {
              animation: 'none',
            },
          },
        }}
      >
        {layers.map((layer, idx) => {
          const isLast = idx === layers.length - 1;
          return (
            <Box
              component="span"
              key={layer.id}
              sx={{
                // 依故事第 2 幕：舊主標 fadeout + 下移、新主標 fadein + 從上滑下
                ...(isLast
                  ? {
                      display: 'inline-block',
                      animation: `portalHeadingIn ${TRANSITION_MS}ms ease both`,
                    }
                  : {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      animation: `portalHeadingOut ${TRANSITION_MS}ms ease forwards`,
                    }),
                // 新主標：從上方 -8 滑下到 0、淡入
                '@keyframes portalHeadingIn': {
                  from: { opacity: 0, transform: 'translateY(-8px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
                // 舊主標：從 0 下移到 +8、淡出
                '@keyframes portalHeadingOut': {
                  from: { opacity: 1, transform: 'translateY(0)' },
                  to: { opacity: 0, transform: 'translateY(8px)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            >
              {layer.node}
            </Box>
          );
        })}
      </Typography>
    </Box>
  );
}
