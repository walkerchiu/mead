import { forwardRef, useState } from 'react';
import MuiAccordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';

/**
 * Accordion Component - Atomic Design: Molecule
 *
 * Accordion/collapsible panel component，for displaying expandable content blocks。
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Accordion
 *   items={[
 *     { title: 'Question 1', content: 'Answer 1' },
 *     { title: 'Question 2', content: 'Answer 2' },
 *   ]}
 * />
 *
 * // Default expanded
 * <Accordion
 *   defaultExpanded={0}
 *   items={[
 *     { title: 'Chapter 1', content: <Chapter1 /> },
 *     { title: 'Chapter 2', content: <Chapter2 /> },
 *   ]}
 * />
 *
 * // controlled mode
 * <Accordion
 *   expanded={expandedPanel}
 *   onChange={setExpandedPanel}
 *   items={items}
 * />
 * ```
 */

export interface AccordionItem {
  /**
   * Title
   */
  title: string | React.ReactNode;

  /**
   * Content
   */
  content: React.ReactNode;

  /**
   * Subtitle/Description
   */
  subtitle?: string | React.ReactNode;

  /**
   * Whether disabled
   */
  disabled?: boolean;

  /**
   * customicon
   */
  icon?: React.ReactNode;
}

export interface AccordionProps {
  /**
   * Accordion panel items list
   */
  items: AccordionItem[];

  /**
   * Currently expanded panel index (controlled)
   */
  expanded?: number | false;

  /**
   * default expanded panel index
   */
  defaultExpanded?: number | false;

  /**
   * callback on expand state change
   */
  onChange?: (expandedIndex: number | false) => void;

  /**
   * whether allow multiple panels expanded simultaneously
   */
  multiple?: boolean;

  /**
   * expandedicon
   */
  expandicon?: React.ReactNode;

  /**
   * whether to show divider
   */
  disableGutters?: boolean;

  /**
   * whetherElevation style（Shadow）
   */
  elevation?: number;

  /**
   * whetherIs square（no rounded corners）
   */
  square?: boolean;

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

/**
 * Accordion component
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      items,
      expanded: controlledExpanded,
      defaultExpanded = false,
      onChange,
      multiple = false,
      expandicon,
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
              expandIcon={expandicon || item.icon}
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
