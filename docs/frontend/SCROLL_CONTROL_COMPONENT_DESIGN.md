# 捲動控制組件設計規劃

符合 Material Design 3 & Atomic Design 原則。

---

## 目錄

- [需求分析](#需求分析)
  - [核心需求](#核心需求)
  - [使用場景](#使用場景)
- [組件設計](#組件設計)
  - [組件架構（Atomic Design）](#組件架構atomic-design)
  - [組件層級](#組件層級)
- [技術規格](#技術規格)
  - [1. ScrollButton (Atom)](#1-scrollbutton-atom)
  - [2. ScrollControl (Molecule)](#2-scrollcontrol-molecule)
- [國際化支援](#國際化支援)
  - [翻譯鍵值](#翻譯鍵值)
- [Storybook Stories](#storybook-stories)
  - [ScrollButton.stories.tsx](#scrollbuttonstoriestsx)
  - [ScrollControl.stories.tsx](#scrollcontrolstoriestsx)
- [使用範例](#使用範例)
  - [基本使用](#基本使用)
  - [自定義位置](#自定義位置)
  - [僅顯示部分按鈕](#僅顯示部分按鈕)
  - [在特定容器內捲動](#在特定容器內捲動)
- [測試策略](#測試策略)
  - [單元測試 (Vitest)](#單元測試-vitest)
- [實作檢查清單](#實作檢查清單)
  - [Atom 組件](#atom-組件)
  - [Molecule 組件](#molecule-組件)
  - [國際化](#國際化)
  - [測試](#測試)
  - [文檔](#文檔)
  - [整合](#整合)
- [效能考量](#效能考量)
  - [優化策略](#優化策略)
- [無障礙考量](#無障礙考量)
- [響應式設計](#響應式設計)
  - [斷點行為](#斷點行為)
- [未來擴展](#未來擴展)

## 需求分析

### 核心需求

1. **快速捲動**: 點擊按鈕快速向上/下捲動一段距離
2. **捲到頂部/底部**: 一鍵直接捲到頁面頂部或底部
3. **位置可自定義**: 用戶可自定義組件在畫面中的位置
4. **響應式設計**: 在不同螢幕尺寸下都能正常運作

### 使用場景

- 長頁面/長列表瀏覽
- 文檔閱讀
- 數據表格
- 無限捲動列表

---

## 組件設計

### 組件架構（Atomic Design）

```text
Atoms (原子組件)
├── ScrollButton (單一捲動按鈕)
└── Icon (圖示)

Molecules (分子組件)
└── ScrollControl (捲動控制組 - 本次實作)
```

### 組件層級

#### ScrollControl (Molecule)

```tsx
<ScrollControl
  position="right-bottom" // 位置
  showScrollUp // 顯示向上捲動
  showScrollDown // 顯示向下捲動
  showScrollToTop // 顯示捲到頂部
  showScrollToBottom // 顯示捲到底部
  offset={100} // 捲動偏移量（px）
  visibilityThreshold={300} // 顯示閾值（滾動多少 px 後顯示）
  customPosition={{ x: 20, y: 20 }} // 自定義位置
/>
```

---

## 技術規格

### 1. ScrollButton (Atom)

**檔案位置**: `src/components/atoms/ScrollButton/`

**Props 介面**:

```typescript
interface ScrollButtonProps {
  /** 按鈕方向 */
  direction: 'up' | 'down' | 'toTop' | 'toBottom';

  /** 點擊處理函數 */
  onClick: () => void;

  /** 是否禁用 */
  disabled?: boolean;

  /** 按鈕大小 */
  size?: 'small' | 'medium' | 'large';

  /** 自定義樣式 */
  sx?: SxProps<Theme>;

  /** 工具提示文字 */
  tooltip?: string;

  /** 是否顯示 */
  visible?: boolean;
}
```

**實作**:

```tsx
import { IconButton, Tooltip, Fade } from '@mui/material';
import {
  KeyboardArrowUpIcon,
  KeyboardArrowDownIcon,
  KeyboardDoubleArrowUpIcon,
  KeyboardDoubleArrowDownIcon,
} from '@mui/icons-material';

const iconMap = {
  up: KeyboardArrowUpIcon,
  down: KeyboardArrowDownIcon,
  toTop: KeyboardDoubleArrowUpIcon,
  toBottom: KeyboardDoubleArrowDownIcon,
};

export function ScrollButton({
  direction,
  onClick,
  disabled = false,
  size = 'medium',
  sx,
  tooltip,
  visible = true,
}: ScrollButtonProps) {
  const Icon = iconMap[direction];

  const sizeMap = {
    small: 40,
    medium: 48,
    large: 56,
  };

  return (
    <Fade in={visible} timeout={300}>
      <Tooltip title={tooltip} placement="left">
        <IconButton
          onClick={onClick}
          disabled={disabled}
          sx={{
            width: sizeMap[size],
            height: sizeMap[size],
            backgroundColor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            boxShadow: 2,
            ...sx,
          }}
          aria-label={tooltip}
        >
          <Icon fontSize={size === 'small' ? 'small' : 'medium'} />
        </IconButton>
      </Tooltip>
    </Fade>
  );
}
```

---

### 2. ScrollControl (Molecule)

**檔案位置**: `src/components/molecules/ScrollControl/`

**Props 介面**:

```typescript
type Position =
  | 'right-top'
  | 'right-center'
  | 'right-bottom'
  | 'left-top'
  | 'left-center'
  | 'left-bottom'
  | 'custom';

interface CustomPosition {
  x: number; // 距離左側的距離（px）
  y: number; // 距離頂部的距離（px）
}

interface ScrollControlProps {
  /** 組件位置（預設值） */
  position?: Position;

  /** 自定義位置（當 position='custom' 時使用） */
  customPosition?: CustomPosition;

  /** 是否顯示向上捲動按鈕 */
  showScrollUp?: boolean;

  /** 是否顯示向下捲動按鈕 */
  showScrollDown?: boolean;

  /** 是否顯示捲到頂部按鈕 */
  showScrollToTop?: boolean;

  /** 是否顯示捲到底部按鈕 */
  showScrollToBottom?: boolean;

  /** 每次捲動的偏移量（px，預設 500） */
  offset?: number;

  /** 顯示閾值（滾動多少 px 後顯示，預設 300） */
  visibilityThreshold?: number;

  /** 捲動行為（預設 'smooth'） */
  behavior?: ScrollBehavior;

  /** 按鈕大小 */
  size?: 'small' | 'medium' | 'large';

  /** 捲動容器（預設為 window） */
  container?: HTMLElement | null;

  /** 自定義樣式 */
  sx?: SxProps<Theme>;
}
```

**實作**:

```tsx
import { useEffect, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { ScrollButton } from '@/components/atoms/ScrollButton';
import { useTranslations } from 'next-intl';

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
      window.addEventListener('scroll', handleScroll, { passive: true });
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
```

---

## 國際化支援

### 翻譯鍵值

**檔案**: `messages/zh-TW.json`

```json
{
  "common": {
    "scrollControl": {
      "scrollUp": "向上捲動",
      "scrollDown": "向下捲動",
      "scrollToTop": "回到頂部",
      "scrollToBottom": "捲到底部"
    }
  }
}
```

**檔案**: `messages/en.json`

```json
{
  "common": {
    "scrollControl": {
      "scrollUp": "Scroll up",
      "scrollDown": "Scroll down",
      "scrollToTop": "Back to top",
      "scrollToBottom": "Scroll to bottom"
    }
  }
}
```

---

## Storybook Stories

### ScrollButton.stories.tsx

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollButton } from './ScrollButton';

const meta = {
  title: 'Atoms/ScrollButton',
  component: ScrollButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['up', 'down', 'toTop', 'toBottom'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
} satisfies Meta<typeof ScrollButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollUp: Story = {
  args: {
    direction: 'up',
    tooltip: '向上捲動',
    size: 'medium',
  },
};

export const ScrollDown: Story = {
  args: {
    direction: 'down',
    tooltip: '向下捲動',
    size: 'medium',
  },
};

export const ScrollToTop: Story = {
  args: {
    direction: 'toTop',
    tooltip: '回到頂部',
    size: 'medium',
  },
};

export const ScrollToBottom: Story = {
  args: {
    direction: 'toBottom',
    tooltip: '捲到底部',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    direction: 'up',
    tooltip: '向上捲動',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    direction: 'up',
    tooltip: '向上捲動',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    direction: 'up',
    tooltip: '向上捲動',
    disabled: true,
  },
};
```

### ScrollControl.stories.tsx

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollControl } from './ScrollControl';
import { Box, Typography } from '@mui/material';

const meta = {
  title: 'Molecules/ScrollControl',
  component: ScrollControl,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ height: '200vh', p: 4 }}>
        <Typography variant="h4" gutterBottom>
          向下捲動以查看捲動控制按鈕
        </Typography>
        <Typography paragraph>
          {Array.from(
            { length: 50 },
            (_, i) => `這是第 ${i + 1} 段文字。`,
          ).join(' ')}
        </Typography>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ScrollControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    position: 'right-bottom',
  },
};

export const RightTop: Story = {
  args: {
    position: 'right-top',
  },
};

export const LeftBottom: Story = {
  args: {
    position: 'left-bottom',
  },
};

export const WithAllButtons: Story = {
  args: {
    position: 'right-bottom',
    showScrollUp: true,
    showScrollDown: true,
    showScrollToTop: true,
    showScrollToBottom: true,
  },
};

export const CustomPosition: Story = {
  args: {
    position: 'custom',
    customPosition: { x: 100, y: 100 },
  },
};

export const SmallSize: Story = {
  args: {
    size: 'small',
  },
};

export const LargeSize: Story = {
  args: {
    size: 'large',
  },
};

export const FastScroll: Story = {
  args: {
    offset: 1000,
  },
};

export const SlowScroll: Story = {
  args: {
    offset: 200,
  },
};
```

---

## 使用範例

### 基本使用

```tsx
import { ScrollControl } from '@/components/molecules/ScrollControl';

export function MyPage() {
  return (
    <div>
      <h1>長頁面內容</h1>
      {/* ... 很多內容 ... */}

      <ScrollControl />
    </div>
  );
}
```

### 自定義位置

```tsx
<ScrollControl position="custom" customPosition={{ x: 50, y: 50 }} />
```

### 僅顯示部分按鈕

```tsx
<ScrollControl
  showScrollUp={false}
  showScrollDown={false}
  showScrollToTop={true}
  showScrollToBottom={false}
/>
```

### 在特定容器內捲動

```tsx
const containerRef = useRef<HTMLDivElement>(null);

<Box ref={containerRef} sx={{ height: 500, overflow: 'auto' }}>
  {/* 內容 */}
  <ScrollControl container={containerRef.current} />
</Box>;
```

---

## 測試策略

### 單元測試 (Vitest)

**檔案**: `ScrollControl.test.tsx`

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScrollControl } from './ScrollControl';

describe('ScrollControl', () => {
  it('應該渲染捲動控制按鈕', () => {
    render(<ScrollControl />);
    // 測試按鈕存在
  });

  it('應該在滾動超過閾值後顯示按鈕', async () => {
    render(<ScrollControl visibilityThreshold={100} />);

    // 模擬捲動
    window.scrollY = 200;
    fireEvent.scroll(window);

    await waitFor(() => {
      // 驗證按鈕可見
    });
  });

  it('點擊向上捲動按鈕應該觸發捲動', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    render(<ScrollControl />);

    // 找到並點擊向上按鈕
    // 驗證 scrollTo 被調用

    expect(scrollToSpy).toHaveBeenCalled();
  });

  it('應該根據 position prop 正確定位', () => {
    const { rerender } = render(<ScrollControl position="right-top" />);
    // 驗證位置樣式

    rerender(<ScrollControl position="left-bottom" />);
    // 驗證新位置樣式
  });
});
```

---

## 實作檢查清單

### Atom 組件

- [ ] 建立 `components/atoms/ScrollButton/` 目錄
- [ ] 實作 `ScrollButton.tsx`
- [ ] 建立 `ScrollButton.stories.tsx`
- [ ] 建立 `index.ts`
- [ ] 測試 Storybook 渲染

### Molecule 組件

- [ ] 建立 `components/molecules/ScrollControl/` 目錄
- [ ] 實作 `ScrollControl.tsx`
- [ ] 實作捲動邏輯
- [ ] 實作位置計算
- [ ] 建立 `ScrollControl.stories.tsx`
- [ ] 建立 `index.ts`

### 國際化

- [ ] 更新 `messages/zh-TW.json`
- [ ] 更新 `messages/en.json`
- [ ] 測試多語系切換

### 測試

- [ ] 建立 `ScrollControl.test.tsx`
- [ ] 編寫單元測試
- [ ] 執行測試並確保覆蓋率

### 文檔

- [ ] 更新 `docs/frontend/COMPONENT_LIBRARY.md`
- [ ] 新增使用範例
- [ ] 更新 Storybook 文檔

### 整合

- [ ] 更新 `components/atoms/index.ts`
- [ ] 更新 `components/molecules/index.ts`
- [ ] 在實際頁面中測試
- [ ] 響應式測試（手機、平板、桌面）

---

## 效能考量

### 優化策略

1. **節流處理**: 使用 `passive: true` 選項監聽 scroll 事件
2. **條件渲染**: 使用 `Fade` 組件平滑顯示/隱藏
3. **記憶化**: 使用 `useCallback` 避免不必要的重新渲染
4. **CSS Transform**: 使用 `transform` 而非 `top`/`left` 提升性能

---

## 無障礙考量

- ✅ 所有按鈕都有 `aria-label`
- ✅ 支援鍵盤操作（Tab 聚焦）
- ✅ 提供工具提示說明
- ✅ 禁用狀態有視覺提示
- ✅ 高對比度模式支援

---

## 響應式設計

### 斷點行為

- **手機 (< 600px)**: 使用 `small` 尺寸，間距縮小
- **平板 (600px - 960px)**: 使用 `medium` 尺寸
- **桌面 (> 960px)**: 使用 `medium` 或 `large` 尺寸

---

## 未來擴展

1. **動畫選項**: 支援不同的捲動動畫效果
2. **進度指示**: 顯示當前捲動位置的百分比
3. **快捷鍵**: 支援鍵盤快捷鍵（如 Home、End、PageUp、PageDown）
4. **主題定制**: 支援更多視覺樣式選項
5. **手勢支援**: 支援觸控手勢操作

---

**規劃完成** | 預計實作時間: 4-6 小時
