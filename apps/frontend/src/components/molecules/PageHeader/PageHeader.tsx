import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  type SxProps,
  type Theme,
} from '@mui/material';
import {
  ArrowBack,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  /**
   * Page title
   */
  title: string;

  /**
   * Page description
   */
  description?: string;

  /**
   * Page icon (emoji or React element)
   */
  icon?: React.ReactNode;

  /**
   * Whether to show back button
   * @default false
   */
  showBackButton?: boolean;

  /**
   * Back button click handler
   */
  onBack?: () => void;

  /**
   * Back button aria-label
   * @default 'Back'
   */
  backAriaLabel?: string;

  /**
   * Breadcrumb navigation
   */
  breadcrumbs?: BreadcrumbItem[];

  /**
   * Right side action area
   */
  actions?: React.ReactNode;

  /**
   * Whether to use card style (elevated surface)
   * @default true
   */
  elevated?: boolean;

  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

/**
 * PageHeader Component
 *
 * Provides a consistent page title area, including:
 * - Back navigation
 * - Breadcrumbs
 * - Title and description
 * - Action buttons
 *
 * Follows Material Design 3 and HQ UI best practices:
 * - Clear visual hierarchy
 * - Appropriate white space
 * - Accessibility support
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  showBackButton = false,
  onBack,
  backAriaLabel = 'Back',
  breadcrumbs,
  actions,
  elevated = true,
  sx,
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'flex-start' },
        justifyContent: 'space-between',
        gap: { xs: 2, md: 3 },
        ...sx,
      }}
    >
      {/* Left side: Navigation + Title */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Breadcrumb navigation */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 1.5 }}
            aria-label="breadcrumb"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              if (isLast || (!crumb.href && !crumb.onClick)) {
                return (
                  <Typography
                    key={index}
                    color={isLast ? 'text.primary' : 'text.secondary'}
                    fontSize="0.875rem"
                    fontWeight={isLast ? 500 : 400}
                  >
                    {crumb.label}
                  </Typography>
                );
              }

              return (
                <Link
                  key={index}
                  underline="hover"
                  color="text.secondary"
                  href={crumb.href}
                  onClick={(e) => {
                    if (crumb.onClick) {
                      e.preventDefault();
                      crumb.onClick();
                    }
                  }}
                  sx={{
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}

        {/* Title area */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: description ? 1 : 0,
            flexWrap: 'wrap',
          }}
        >
          {/* Back button */}
          {showBackButton && (
            <IconButton
              onClick={onBack}
              aria-label={backAriaLabel}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ArrowBack />
            </IconButton>
          )}

          {/* Icon */}
          {icon && (
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                lineHeight: 1,
              }}
            >
              {icon}
            </Box>
          )}

          {/* Title */}
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'text.primary',
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Description */}
        {description && (
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              lineHeight: 1.5,
              maxWidth: '48rem',
              mt: 0.5,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Right side: Action buttons */}
      {actions && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );

  // If using elevated style, wrap with Paper
  if (elevated) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          position: 'relative',
          zIndex: 0,
        }}
      >
        {content}
      </Paper>
    );
  }

  // Otherwise return content directly with padding
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        mb: 3,
      }}
    >
      {content}
    </Box>
  );
};

export default PageHeader;
