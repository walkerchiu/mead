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
      { label: '菁培計畫', href: '/plans/sposad' },
      { label: '設計戰國策', href: '/plans/idc' },
      { label: '台灣國際學生創意設計大賽', href: '/plans/tisdc' },
      { label: '歷年成果', href: '#' },
    ],
  },
  {
    title: '關於我們',
    links: [
      { label: '計畫緣起', href: '#' },
      { label: '教育部官網', href: 'https://www.edu.tw/' },
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

/** Figma node 1:47 色票 */
const C = {
  title: '#000000',
  link: '#888888',
  subline: '#bbbbbb',
  badgeBorder: '#444444',
  badgeText: '#aaaaaa',
  copyright: '#666666',
};

/** 版權文字共用樣式 */
const copyrightSx = { fontSize: 11, color: C.copyright } as const;

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
              {/* 依 Figma node 1:53 — Inter Regular 8.6px #bbb，對齊名稱左緣 */}
              <Typography
                component="p"
                sx={{
                  mt: 0.5,
                  ml: '50px',
                  fontSize: 8.6,
                  color: C.subline,
                  whiteSpace: 'nowrap',
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
                sx={{ fontSize: 11, fontWeight: 500, color: C.badgeText }}
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

          {/* 三欄連結 — 各斷點皆為固定寬（73px）窄欄。
              <834px 以 space-between 散佈於置中區塊（Figma 43:396 / 43:1142）；
              ≥834px 為固定寬群組、欄距 64px（Figma node 1:48） */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
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
                  // 依 Figma 欄框固定 72.97px、超出裁切（各斷點一致）
                  width: 73,
                  flexShrink: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* 欄標題 — 依 Figma node 1:62（Inter SemiBold 12px / 字距 1px） */}
                <Typography
                  component="p"
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '1px',
                    color: C.title,
                  }}
                >
                  {col.title}
                </Typography>
                {col.links.map((link) => {
                  // 內部路由（/plans/...）用 locale-aware 的 next-intl Link，
                  // 其餘（# 或外部 http）用一般連結。
                  const isInternal = link.href.startsWith('/');
                  return (
                    <Link
                      key={link.label}
                      {...(isInternal
                        ? { component: IntlLink, href: link.href }
                        : { href: link.href })}
                      underline="none"
                      sx={{
                        // 依 Figma node 1:63 — Inter Regular 13px #888，不換行
                        fontSize: 13,
                        color: C.link,
                        whiteSpace: 'nowrap',
                        '&:hover': { color: portalTokens.color.brandOrange },
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
