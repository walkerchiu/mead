'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  Language as LanguageIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { usePathname } from '@/i18n/routing';
import { useNavRouter as useRouter } from '@/i18n/use-nav-router';
import { routing, type Locale } from '@/i18n/routing';
import { useState } from 'react';
import { UPDATE_MY_PROFILE_DETAILS_MUTATION } from '@/lib/graphql';
import { isAuthenticated } from '@/lib/auth';

/**
 * Language configuration with display names and flags
 */
const LANGUAGES: Record<
  Locale,
  { label: string; flag: string; nativeName: string }
> = {
  en: {
    label: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
  },
  'zh-TW': {
    label: 'Traditional Chinese',
    flag: '🇹🇼',
    nativeName: 'Traditional Chinese',
  },
};

export interface LanguageSwitcherProps {
  /**
   * Show language name instead of icon (default: false)
   */
  showLabel?: boolean;
  /**
   * Icon button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button color
   */
  color?: 'inherit' | 'primary' | 'secondary' | 'default';
  /**
   * MUI sx prop for styling
   */
  sx?: SxProps<Theme>;
}

/**
 * Language switcher component that allows users to change the application language.
 * Supports seamless locale switching without page reload using Next.js router.
 */
export function LanguageSwitcher({
  showLabel = false,
  size = 'medium',
  color = 'inherit',
  sx: _sx,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const t = useTranslations('components.languageSwitcher');
  const [updateProfileDetails] = useMutation(
    UPDATE_MY_PROFILE_DETAILS_MUTATION,
  );

  const currentLocale = (params.locale as Locale) || routing.defaultLocale;
  const currentLanguage = LANGUAGES[currentLocale];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (locale: Locale) => {
    handleMenuClose();

    if (locale === currentLocale) return;

    startTransition(() => {
      router.replace(pathname, { locale });
    });

    // 同步更新 profile.language（僅在已登入時）
    if (isAuthenticated()) {
      updateProfileDetails({
        variables: { input: { language: locale } },
      }).catch(() => {
        // 靜默失敗 — 語言切換本身已完成，profile 同步非關鍵
      });
    }
  };

  return (
    <>
      <Tooltip title={showLabel ? '' : t('tooltip')}>
        <IconButton
          onClick={handleMenuOpen}
          color={color}
          size={size}
          disabled={isPending}
          aria-label="change language"
          aria-controls="language-menu"
          aria-haspopup="true"
        >
          {showLabel ? (
            <>
              <LanguageIcon sx={{ mr: 1 }} />
              {currentLanguage.nativeName}
            </>
          ) : (
            <LanguageIcon />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {routing.locales.map((locale) => {
          const language = LANGUAGES[locale];
          const isActive = locale === currentLocale;

          return (
            <MenuItem
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              selected={isActive}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <span style={{ fontSize: '1.2rem' }}>{language.flag}</span>
              </ListItemIcon>
              <ListItemText
                primary={language.nativeName}
                secondary={language.label}
              />
              {isActive && (
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
