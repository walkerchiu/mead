import { forwardRef, useState } from 'react';
import MuiAccordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';

/**
 * Accordion 組件 - Atomic Design: Molecule
 *
 * 手風琴/折疊面板組件，用於顯示可展開的內容區塊。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <Accordion
 *   items={[
 *     { title: '問題一', content: '答案一' },
 *     { title: '問題二', content: '答案二' },
 *   ]}
 * />
 *
 * // 預設展開
 * <Accordion
 *   defaultExpanded={0}
 *   items={[
 *     { title: '章節一', content: <Chapter1 /> },
 *     { title: '章節二', content: <Chapter2 /> },
 *   ]}
 * />
 *
 * // 受控模式
 * <Accordion
 *   expanded={expandedPanel}
 *   onChange={setExpandedPanel}
 *   items={items}
 * />
 * ```
 */

export interface AccordionItem {
  /**
   * 標題
   */
  title: string | React.ReactNode;

  /**
   * 內容
   */
  content: React.ReactNode;

  /**
   * 副標題/描述
   */
  subtitle?: string | React.ReactNode;

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 自訂圖示
   */
  icon?: React.ReactNode;
}

export interface AccordionProps {
  /**
   * 折疊面板項目列表
   */
  items: AccordionItem[];

  /**
   * 當前展開的面板索引（受控）
   */
  expanded?: number | false;

  /**
   * 預設展開的面板索引
   */
  defaultExpanded?: number | false;

  /**
   * 展開狀態變更時的回調
   */
  onChange?: (expandedIndex: number | false) => void;

  /**
   * 是否允許多個面板同時展開
   */
  multiple?: boolean;

  /**
   * 展開圖示
   */
  expandIcon?: React.ReactNode;

  /**
   * 是否顯示分隔線
   */
  disableGutters?: boolean;

  /**
   * 是否提升樣式（陰影）
   */
  elevation?: number;

  /**
   * 是否為方形（無圓角）
   */
  square?: boolean;

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

/**
 * Accordion 組件
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      items,
      expanded: controlledExpanded,
      defaultExpanded = false,
      onChange,
      multiple = false,
      expandIcon,
      disableGutters = false,
      elevation = 1,
      square = false,
      sx,
      ...props
    },
    ref,
  ) {
    const [internalExpanded, setInternalExpanded] = useState<number | false>(
      defaultExpanded,
    );
    const [multipleExpanded, setMultipleExpanded] = useState<Set<number>>(
      new Set(defaultExpanded !== false ? [defaultExpanded] : []),
    );

    const expanded =
      controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

    const handleChange =
      (index: number) =>
      (_event: React.SyntheticEvent, isExpanded: boolean) => {
        if (multiple) {
          const newSet = new Set(multipleExpanded);
          if (isExpanded) {
            newSet.add(index);
          } else {
            newSet.delete(index);
          }
          setMultipleExpanded(newSet);
        } else {
          const newExpanded = isExpanded ? index : false;
          if (controlledExpanded === undefined) {
            setInternalExpanded(newExpanded);
          }
          onChange?.(newExpanded);
        }
      };

    const isExpanded = (index: number) => {
      if (multiple) {
        return multipleExpanded.has(index);
      }
      return expanded === index;
    };

    return (
      <Box ref={ref} sx={sx} {...props}>
        {items.map((item, index) => (
          <MuiAccordion
            key={index}
            expanded={isExpanded(index)}
            onChange={handleChange(index)}
            disabled={item.disabled}
            disableGutters={disableGutters}
            elevation={elevation}
            square={square}
          >
            <AccordionSummary
              expandIcon={expandIcon || item.icon}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Box sx={{ flexGrow: 1 }}>
                {typeof item.title === 'string' ? (
                  <Typography>{item.title}</Typography>
                ) : (
                  item.title
                )}
                {item.subtitle && (
                  <Box sx={{ mt: 0.5 }}>
                    {typeof item.subtitle === 'string' ? (
                      <Typography variant="body2" color="text.secondary">
                        {item.subtitle}
                      </Typography>
                    ) : (
                      item.subtitle
                    )}
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>{item.content}</AccordionDetails>
          </MuiAccordion>
        ))}
      </Box>
    );
  },
);

export default Accordion;
