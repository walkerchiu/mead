'use client';

import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { Link as IntlLink } from '@/i18n/routing';

import { portalTokens } from '../../tokens';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface PortalFooterProps {
  /** 網站名稱 */
  siteName?: string;
  /** 網站簡述 */
  tagline?: string;
  /** 連結欄位，未提供時使用預設三欄 */
  columns?: FooterColumn[];
  /** 版權文字 */
  copyright?: string;
}

/** 品牌副標 — 三大計畫名（依 Figma node 1:53） */
const BRAND_SUBLINE = '菁培計畫｜設計戰國策｜台灣國際學生創意設計大賽';

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: '計畫連結',
    links: [
      { label: '菁培計畫', href: 'https://www.animlab.yuntech.edu.tw/sposad/' },
      { label: '設計戰國策', href: 'https://www.moe-idc.org/' },
      { label: '台灣國際學生創意設計大賽', href: 'https://www.tisdc.org/' },
      { label: '歷年成果', href: '#' },
    ],
  },
  {
    title: '關於我們',
    links: [
      { label: '計畫緣起', href: '#' },
      { label: '教育部官網', href: 'https://www.edu.tw/Default.aspx' },
      { label: '隱私權政策', href: '#' },
      { label: '網站導覽', href: '#' },
      { label: '無障礙聲明', href: '#' },
    ],
  },
  {
    title: '聯絡資訊',
    links: [
      { label: '聯絡我們', href: '#' },
      { label: '常見問題', href: '#' },
      { label: '訂閱電子報', href: '#' },
    ],
  },
];

/** Figma node 1:47 色票 — 數值已就 WCAG 2.1 AA 對比 (≥4.5:1 normal text)
 *  與 footerBg #E3E3E3 加深。原 #888 (≈2.95:1) / #bbb (≈1.66:1) /
 *  #aaa (≈2.0:1) / 11px 都不符 AA。 */
const C = {
  title: '#000000',
  link: '#5C5C5C', // on #E3E3E3 ≈ 6.0:1 ✓
  subline: '#4A4A4A', // on #E3E3E3 ≈ 8.4:1 ✓
  badgeBorder: '#1E1E1E',
  badgeText: '#1E1E1E', // 高對比，無障礙標章須清楚
  copyright: '#5C5C5C',
};

/** 版權文字共用樣式（字級提升至 12 — 1.4.4 Resize Text 友善） */
const copyrightSx = { fontSize: 12, color: C.copyright } as const;

/**
 * PortalFooter — 入口網頁尾。
 *
 * - ≥834px（依 Figma node 1:47）：品牌識別與三欄連結並排，下方為版權列。
 * - <834px（依 Figma node 43:396 / 43:1142）：三欄連結在上，品牌識別在下，
 *   版權文字併入品牌區塊末行；頁尾內容約 460px 寬置中。
 */
export function PortalFooter({
  siteName = '教育部藝術設計計畫資訊網',
  tagline = '教育部藝術與設計人才培育計畫入口網，致力於推動台灣藝術設計教育發展。',
  columns = DEFAULT_COLUMNS,
  copyright = `Copyright ${new Date().getFullYear()} . All Rights Reserved.`,
}: PortalFooterProps) {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: portalTokens.color.footerBg,
        // <834px 邊距較寬（設計稿 402px 時內容約 306 寬、左右各 48）
        px: '48px',
        pb: 5,
        [portalTokens.mq.tabletUp]: {
          px: `${portalTokens.layout.gutter}px`,
          pb: 0,
        },
      }}
    >
      <Box
        sx={{
          // <834px 內容約 458px 置中；≥834px 約 772px 置中
          // （依 Figma node 1:48 — 品牌 360 + 三欄各 73 + 間距 64）
          maxWidth: 458,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          [portalTokens.mq.tabletUp]: {
            maxWidth: 772,
          },
        }}
      >
        {/* Footer Main — 品牌 + 三欄連結
            <834px 連結欄在品牌之上（column-reverse），≥834px 並排。
            連結欄與品牌間距依 Figma 43:396 / 43:1142 約 77px */}
        <Box
          sx={{
            pt: 6,
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '77px',
            [portalTokens.mq.tabletUp]: {
              pt: 8,
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            },
          }}
        >
          {/* 品牌識別 */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              [portalTokens.mq.tabletUp]: { width: 360 },
            }}
          >
            {/* 教育部識別 + 名稱 + 副標 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  component="img"
                  src="/images/moe-emblem.png"
                  alt="教育部"
                  sx={{ width: 40, height: 40, flexShrink: 0 }}
                />
                {/* 依 Figma node 1:51 — Inter Light 16.8px */}
                <Typography
                  component="p"
                  sx={{ fontSize: 16.8, fontWeight: 300, color: C.title }}
                >
                  {siteName}
                </Typography>
              </Box>
              {/* 依 Figma node 1:53 — 原本 8.6px nowrap 違反 1.4.4 / 1.4.10。
                  放寬到 12px 並允許換行，色彩加深確保 4.5:1。 */}
              <Typography
                component="p"
                sx={{
                  mt: 0.5,
                  ml: '50px',
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: C.subline,
                }}
              >
                {BRAND_SUBLINE}
              </Typography>
            </Box>

            {/* 簡述 — 依 Figma node 1:54（Inter Regular 13px / 1.8） */}
            <Typography
              component="p"
              sx={{
                fontSize: 13,
                lineHeight: 1.8,
                color: C.link,
                maxWidth: 320,
                whiteSpace: 'pre-line',
              }}
            >
              {tagline}
            </Typography>

            {/* 無障礙標章 — 依 Figma node 1:55 */}
            <Box
              sx={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                border: `1px solid ${C.badgeBorder}`,
                px: 1.25,
                py: 0.5,
              }}
            >
              <GppGoodOutlinedIcon sx={{ fontSize: 14, color: C.badgeText }} />
              <Typography
                component="span"
                sx={{ fontSize: 12, fontWeight: 500, color: C.badgeText }}
              >
                無障礙認證
              </Typography>
            </Box>

            {/* 版權 — <834px 併入品牌區塊末行（依 Figma node 47:2107） */}
            <Typography
              component="p"
              sx={{
                ...copyrightSx,
                [portalTokens.mq.tabletUp]: { display: 'none' },
              }}
            >
              {copyright}
            </Typography>
          </Box>

          {/* 三欄連結 — 整組外包 nav landmark（WCAG 1.3.1）。
              原本 width:73 + overflow:hidden + whiteSpace:nowrap 在 200% 縮放
              或 320px 寬下會把連結文字裁掉（違反 1.4.4 / 1.4.10）；改用
              min-width 並允許文字換行。欄距 ≥834px 仍維持寬鬆視覺。 */}
          <Box
            component="nav"
            aria-label="頁尾導覽"
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              [portalTokens.mq.tabletUp]: {
                flex: '0 0 auto',
                width: 'auto',
                justifyContent: 'flex-start',
                gap: 8,
              },
            }}
          >
            {columns.map((col) => (
              <Box
                key={col.title}
                sx={{
                  minWidth: 73,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* 欄標題 — 改 h3（h1 在 PortalLandingPage、h2 在 PortalIntroSection /
                    PortalNarrativeSection / PlanCard），語意層級連續。
                    Figma 視覺仍為 Inter SemiBold 12px / 字距 1px。 */}
                <Typography
                  component="h3"
                  sx={{
                    m: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '1px',
                    color: C.title,
                  }}
                >
                  {col.title}
                </Typography>
                {col.links.map((link) => {
                  // 內部路由（/plans/...）用 locale-aware 的 next-intl Link；
                  // 外部官網（http/https）於新分頁開啟；# 佔位渲為 disabled
                  // button + sr-only「即將上線」，避免讀屏使用者誤觸卻一無所獲。
                  const isPlaceholder = link.href === '#';
                  const isInternal = link.href.startsWith('/');
                  const isExternal = /^https?:\/\//.test(link.href);
                  if (isPlaceholder) {
                    return (
                      <Box
                        key={link.label}
                        component="button"
                        type="button"
                        disabled
                        aria-disabled="true"
                        sx={{
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          textAlign: 'left',
                          fontSize: 13,
                          fontFamily: 'inherit',
                          color: C.link,
                          cursor: 'not-allowed',
                          opacity: 0.65,
                        }}
                      >
                        {link.label}
                        <span className="visually-hidden">（即將上線）</span>
                      </Box>
                    );
                  }
                  return (
                    <Link
                      key={link.label}
                      {...(isInternal
                        ? { component: IntlLink, href: link.href }
                        : { href: link.href })}
                      {...(isExternal && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                        // 提示讀屏使用者連結會開啟新分頁（WCAG 3.2.5 / 2.4.4）
                        'aria-label': `${link.label}（在新分頁開啟）`,
                      })}
                      underline="none"
                      sx={{
                        fontSize: 13,
                        color: C.link,
                        '&:hover': { color: portalTokens.color.brandOrange },
                        '&:focus-visible': {
                          ...portalTokens.focusRing,
                          borderRadius: '2px',
                        },
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Footer Bottom — 版權，僅 ≥834px 顯示（<834px 已併入品牌區塊） */}
        <Box
          sx={{
            display: 'none',
            [portalTokens.mq.tabletUp]: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              py: 3,
            },
          }}
        >
          <Typography component="p" sx={copyrightSx}>
            {copyright}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
