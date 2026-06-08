'use client';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

export interface AnimatedSloganProps {
  /** slogan 文字 */
  text: string;
  /** 逐字進場的間隔（ms），預設 55 */
  staggerMs?: number;
  /** 單字進場動畫時長（ms），預設 480 */
  durationMs?: number;
  /** 外層樣式 */
  sx?: SxProps<Theme>;
}

/**
 * AnimatedSlogan — slogan 逐字「展延」進場動畫。
 *
 * 文字逐字由下淡入展開，呼應設計稿的 slogan 展延效果。以 React `key`
 * 重新掛載即可重播（例如切換計畫或 hover 時）。
 * 尊重 `prefers-reduced-motion`：偏好減少動態時直接顯示完整文字。
 */
export function AnimatedSlogan({
  text,
  staggerMs = 55,
  durationMs = 480,
  sx,
}: AnimatedSloganProps) {
  // 以 '\n' 明確斷行：每行一個 block，逐字進場延遲索引跨行連續累加。
  const lines = useMemo(() => text.split('\n'), [text]);
  const charSx = {
    display: 'inline-block',
    whiteSpace: 'pre',
    opacity: 0,
    animationName: 'sloganCharIn',
    animationDuration: `${durationMs}ms`,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    animationFillMode: 'both',
    '@keyframes sloganCharIn': {
      from: {
        opacity: 0,
        transform: 'translateY(0.5em)',
        filter: 'blur(4px)',
      },
      to: { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
    },
    '@media (prefers-reduced-motion: reduce)': {
      opacity: 1,
      animation: 'none',
    },
  } as const;

  let charIndex = 0;

  return (
    <Box component="span" aria-label={text.replace(/\n/g, ' ')} sx={sx}>
      {lines.map((line, li) => (
        <Box key={li} component="span" sx={{ display: 'block' }}>
          {Array.from(line).map((char, ci) => {
            const delay = charIndex * staggerMs;
            charIndex += 1;
            if (char === ' ') {
              return (
                <Box
                  key={ci}
                  component="span"
                  aria-hidden
                  sx={{ display: 'inline-block', width: '0.32em' }}
                />
              );
            }
            return (
              <Box
                key={ci}
                component="span"
                aria-hidden
                sx={{ ...charSx, animationDelay: `${delay}ms` }}
              >
                {char}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
