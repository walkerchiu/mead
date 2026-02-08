import { useMediaQuery as useMuiMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * useMediaQuery Hook
 *
 * 提供響應式設計的斷點判斷
 *
 * @returns {Object} 包含 isMobile, isTablet, isDesktop 的物件
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop } = useMediaQuery();
 *
 *   return (
 *     <Box>
 *       {isMobile && <MobileView />}
 *       {isTablet && <TabletView />}
 *       {isDesktop && <DesktopView />}
 *     </Box>
 *   );
 * }
 * ```
 */
export function useMediaQuery() {
  const theme = useTheme();

  // xs: 0-600px (手機)
  const isMobile = useMuiMediaQuery(theme.breakpoints.down('sm'));

  // sm-md: 600-960px (平板)
  const isTablet = useMuiMediaQuery(theme.breakpoints.between('sm', 'md'));

  // md+: 960px+ (桌面)
  const isDesktop = useMuiMediaQuery(theme.breakpoints.up('md'));

  // 額外的細分斷點（可選使用）
  const isSmallMobile = useMuiMediaQuery(theme.breakpoints.down('xs')); // < 600px
  const isLargeDesktop = useMuiMediaQuery(theme.breakpoints.up('lg')); // 1280px+
  const isExtraLargeDesktop = useMuiMediaQuery(theme.breakpoints.up('xl')); // 1920px+

  return {
    /** 是否為手機裝置 (< 600px) */
    isMobile,

    /** 是否為平板裝置 (600px - 960px) */
    isTablet,

    /** 是否為桌面裝置 (>= 960px) */
    isDesktop,

    /** 是否為小型手機 (< 600px) - 與 isMobile 相同 */
    isSmallMobile,

    /** 是否為大型桌面 (>= 1280px) */
    isLargeDesktop,

    /** 是否為超大桌面 (>= 1920px) */
    isExtraLargeDesktop,

    /** 是否非桌面裝置 (手機或平板) */
    isMobileOrTablet: isMobile || isTablet,

    /** 是否非手機裝置 (平板或桌面) */
    isTabletOrDesktop: isTablet || isDesktop,
  };
}

export default useMediaQuery;
