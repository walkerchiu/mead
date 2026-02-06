import type { CSSObject } from '@mui/material/styles';

export type LayoutTokens = {
  size?: number | string;
  borderRadius?: number | string;
  paddingX?: number | string;
  paddingY?: number | string;
  height?: number | string;
  iconSpacing?: number | string;
};

export const buildLayoutStyles = (layout: LayoutTokens): CSSObject => {
  const styles: CSSObject = {};
  if (layout.size !== undefined) {
    styles.width = layout.size;
    styles.height = layout.size;
    styles.minWidth = layout.size;
    styles.minHeight = layout.size;
  }
  if (layout.borderRadius !== undefined) {
    styles.borderRadius = layout.borderRadius;
  }
  if (layout.height !== undefined) {
    styles.minHeight = layout.height;
  }
  if (layout.paddingX !== undefined) {
    styles.paddingInline = layout.paddingX;
  }
  if (layout.paddingY !== undefined) {
    styles.paddingBlock = layout.paddingY;
  }
  if (layout.iconSpacing !== undefined) {
    styles.columnGap = layout.iconSpacing;
    styles['& .MuiButton-startIcon'] = { marginLeft: 0, marginRight: 0 };
    styles['& .MuiButton-endIcon'] = { marginLeft: 0, marginRight: 0 };
  }
  return styles;
};
