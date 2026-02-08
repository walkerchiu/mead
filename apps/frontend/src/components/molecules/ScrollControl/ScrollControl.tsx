'use client';

import { useEffect, useState, useCallback } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { ScrollButton } from '@/components/atoms/ScrollButton';
import { useTranslations } from 'next-intl';

export type Position =
  | 'right-top'
  | 'right-center'
  | 'right-bottom'
  | 'left-top'
  | 'left-center'
  | 'left-bottom'
  | 'custom';

export interface CustomPosition {
  /** Distance from left (px) */
  x: number;
  /** Distance from top (px) */
  y: number;
}

export interface ScrollControlProps {
  /** Component position (preset values) */
  position?: Position;

  /** Custom position (used when position='custom') */
  customPosition?: CustomPosition;

  /** Whether to show scroll up button */
  showScrollUp?: boolean;

  /** Whether to show scroll down button */
  showScrollDown?: boolean;

  /** Whether to show scroll to top button */
  showScrollToTop?: boolean;

  /** Whether to show scroll to bottom button */
  showScrollToBottom?: boolean;

  /** Scroll offset per click (px, default: 500) */
  offset?: number;

  /** Visibility threshold (px to scroll before showing, default: 300) */
  visibilityThreshold?: number;

  /** Scroll behavior (default: 'smooth') */
  behavior?: ScrollBehavior;

  /** Button size */
  size?: 'small' | 'medium' | 'large';

  /** Scroll container (default: window) */
  container?: HTMLElement | null;

  /** Custom styles */
  sx?: SxProps<Theme>;
}

export function ScrollControl({
  position = 'right-bottom',
  customPosition,
  showScrollUp = true,
  showScrollDown = true,
  showScrollToTop = true,
  showScrollToBottom = false,
  offset = 500,
  visibilityThreshold = 300,
  behavior = 'smooth',
  size = 'medium',
  container = null,
  sx,
}: ScrollControlProps) {
  const t = useTranslations('common.scrollControl');
  const [showControls, setShowControls] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // 獲取捲動容器
  const getScrollContainer = useCallback(() => {
    return container || window;
  }, [container]);

  // 獲取當前捲動位置
  const getScrollPosition = useCallback(() => {
    const scrollContainer = getScrollContainer();
    if (scrollContainer === window) {
      return window.scrollY;
    }
    return (scrollContainer as HTMLElement).scrollTop;
  }, [getScrollContainer]);

  // 獲取最大捲動距離
  const getMaxScrollPosition = useCallback(() => {
    const scrollContainer = getScrollContainer();
    if (scrollContainer === window) {
      return document.documentElement.scrollHeight - window.innerHeight;
    }
    const element = scrollContainer as HTMLElement;
    return element.scrollHeight - element.clientHeight;
  }, [getScrollContainer]);

  // 監聽捲動事件
  useEffect(() => {
    const scrollContainer = getScrollContainer();

    const handleScroll = () => {
      const currentPosition = getScrollPosition();
      const maxPosition = getMaxScrollPosition();

      // 判斷是否顯示控制按鈕
      setShowControls(currentPosition > visibilityThreshold);

      // 判斷是否在頂部/底部
      setIsAtTop(currentPosition <= 10);
      setIsAtBottom(currentPosition >= maxPosition - 10);
    };

    handleScroll(); // 初始檢查

    if (scrollContainer === window) {
      window.addEventListener('scroll', handleScroll, {
        passive: true,
      });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      scrollContainer.addEventListener('scroll', handleScroll, {
        passive: true,
      });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [
    getScrollContainer,
    getScrollPosition,
    getMaxScrollPosition,
    visibilityThreshold,
  ]);

  // 捲動到指定位置
  const scrollTo = useCallback(
    (targetPosition: number) => {
      const scrollContainer = getScrollContainer();
      if (scrollContainer === window) {
        window.scrollTo({ top: targetPosition, behavior });
      } else {
        (scrollContainer as HTMLElement).scrollTo({
          top: targetPosition,
          behavior,
        });
      }
    },
    [getScrollContainer, behavior],
  );

  // 向上捲動
  const scrollUp = () => {
    const currentPosition = getScrollPosition();
    scrollTo(Math.max(0, currentPosition - offset));
  };

  // 向下捲動
  const scrollDown = () => {
    const currentPosition = getScrollPosition();
    const maxPosition = getMaxScrollPosition();
    scrollTo(Math.min(maxPosition, currentPosition + offset));
  };

  // 捲到頂部
  const scrollToTop = () => {
    scrollTo(0);
  };

  // 捲到底部
  const scrollToBottom = () => {
    scrollTo(getMaxScrollPosition());
  };

  // 計算位置樣式
  const getPositionStyles = (): React.CSSProperties => {
    if (position === 'custom' && customPosition) {
      return {
        position: 'fixed',
        left: customPosition.x,
        top: customPosition.y,
        zIndex: 1000,
      };
    }

    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
    };

    const spacing = 20; // 與邊緣的間距

    switch (position) {
      case 'right-top':
        return { ...baseStyles, right: spacing, top: spacing };
      case 'right-center':
        return {
          ...baseStyles,
          right: spacing,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'right-bottom':
        return { ...baseStyles, right: spacing, bottom: spacing };
      case 'left-top':
        return { ...baseStyles, left: spacing, top: spacing };
      case 'left-center':
        return {
          ...baseStyles,
          left: spacing,
          top: '50%',
          transform: 'translateY(-50%)',
        };
      case 'left-bottom':
        return { ...baseStyles, left: spacing, bottom: spacing };
      default:
        return { ...baseStyles, right: spacing, bottom: spacing };
    }
  };

  return (
    <Box
      sx={{
        ...getPositionStyles(),
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pointerEvents: showControls ? 'auto' : 'none',
        ...sx,
      }}
    >
      {showScrollToTop && (
        <ScrollButton
          direction="toTop"
          onClick={scrollToTop}
          disabled={isAtTop}
          size={size}
          tooltip={t('scrollToTop')}
          visible={showControls && !isAtTop}
        />
      )}

      {showScrollUp && (
        <ScrollButton
          direction="up"
          onClick={scrollUp}
          disabled={isAtTop}
          size={size}
          tooltip={t('scrollUp')}
          visible={showControls}
        />
      )}

      {showScrollDown && (
        <ScrollButton
          direction="down"
          onClick={scrollDown}
          disabled={isAtBottom}
          size={size}
          tooltip={t('scrollDown')}
          visible={showControls}
        />
      )}

      {showScrollToBottom && (
        <ScrollButton
          direction="toBottom"
          onClick={scrollToBottom}
          disabled={isAtBottom}
          size={size}
          tooltip={t('scrollToBottom')}
          visible={showControls && !isAtBottom}
        />
      )}
    </Box>
  );
}
