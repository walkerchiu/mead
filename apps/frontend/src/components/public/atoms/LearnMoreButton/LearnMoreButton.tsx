'use client';

import { forwardRef } from 'react';

import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import ButtonBase from '@mui/material/ButtonBase';
import { useTranslations } from 'next-intl';

import { portalTokens } from '../../tokens';

export interface LearnMoreButtonProps {
  /** 按鈕文字，預設「了解更多」 */
  label?: string;
  /** 連結網址；提供時渲染為 `<a>`，於新分頁開啟 */
  href?: string;
  /** 點擊回呼（與 href 擇一使用） */
  onClick?: () => void;
  /** 尺寸 */
  size?: 'small' | 'medium';
  /** 整體傾斜角度（度），預設 0；計畫卡片時程列依 Figma 為 -4.86 */
  tilt?: number;
  /** 無障礙標籤，預設取 label */
  'aria-label'?: string;
}

/**
 * LearnMoreButton — 入口網「了解更多 ↗」白色圓角按鈕。
 *
 * 依 Figma node 1:141：白底圓角矩形（radius 8.7px）、黑色 Inter Medium
 * 文字、右側單純外連箭頭（無深色圓圈），可帶些微傾斜；作連結或一般按鈕。
 */
export const LearnMoreButton = forwardRef<
  HTMLButtonElement,
  LearnMoreButtonProps
>(function LearnMoreButton(
  { label, href, onClick, size = 'medium', tilt = 0, ...rest },
  ref,
) {
  const isLink = Boolean(href);
  const compact = size === 'small';
  const rotate = tilt ? `rotate(${tilt}deg)` : '';
  // 按鈕文字依當前語系；連結在新分頁開啟時提示螢幕報讀器
  const t = useTranslations('a11y');
  const buttonLabel = label ?? t('learnMore');
  const accessibleLabel =
    rest['aria-label'] ??
    (isLink ? t('externalLinkAriaLabel', { label: buttonLabel }) : buttonLabel);

  return (
    <ButtonBase
      ref={ref}
      component={isLink ? 'a' : 'button'}
      href={href}
      target={isLink ? '_blank' : undefined}
      rel={isLink ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      aria-label={accessibleLabel}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 0.75 : 1,
        px: compact ? 2 : 2.5,
        py: compact ? 0.75 : 1,
        bgcolor: portalTokens.color.surface,
        color: '#000000',
        // 依 Figma node 1:142 — rounded 8.727px（圓角矩形，非全膠囊）
        borderRadius: '9px',
        boxShadow: portalTokens.shadow.pill,
        fontFamily: 'Inter, "Noto Sans TC", "Noto Sans JP", sans-serif',
        fontSize: compact ? 13 : 14,
        fontWeight: 500,
        lineHeight: 1.8,
        whiteSpace: 'nowrap',
        transform: rotate || 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: `${rotate} translateY(-1px)`.trim(),
          boxShadow: '0 10px 26px -8px rgba(0, 0, 0, 0.34)',
        },
        '&:focus-visible': {
          outline: `2px solid ${portalTokens.color.brandOrange}`,
          outlineOffset: 2,
        },
      }}
    >
      {buttonLabel}
      {/* 依 Figma node 1:143「Vector 28」— 單純外連箭頭 */}
      <ArrowOutwardIcon sx={{ fontSize: compact ? 13 : 14 }} />
    </ButtonBase>
  );
});
