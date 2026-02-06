'use client';

import { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
export type ModalVariant =
  | 'default'
  | 'confirm'
  | 'alert'
  | 'warning'
  | 'error'
  | 'info'
  | 'success';

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warning';
  disabled?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
}

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback fired when the modal should close
   */
  onClose?: () => void;

  /**
   * Modal title
   */
  title?: ReactNode;

  /**
   * Modal content
   */
  children?: ReactNode;

  /**
   * Description text (optional, appears below title)
   */
  description?: string;

  /**
   * Custom actions (buttons)
   */
  actions?: ModalAction[];

  /**
   * Modal size
   */
  maxWidth?: ModalSize;

  /**
   * Whether to show the modal in fullscreen
   */
  fullScreen?: boolean;

  /**
   * Whether to enable scrolling inside the content
   */
  scroll?: 'paper' | 'body';

  /**
   * Modal variant (affects icon and default styling)
   */
  variant?: ModalVariant;

  /**
   * Show close button in title
   */
  showCloseButton?: boolean;

  /**
   * Whether clicking the backdrop closes the modal
   */
  disableBackdropClick?: boolean;

  /**
   * Whether pressing Escape closes the modal
   */
  disableEscapeKeyDown?: boolean;

  /**
   * Whether the modal takes full width
   */
  fullWidth?: boolean;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Whether to divide the content and actions with a divider
   */
  dividers?: boolean;

  /**
   * Custom icon for the modal
   */
  icon?: ReactNode;

  /**
   * MUI sx prop
   */
  sx?: SxProps<Theme>;
}

const variantIcons: Record<
  Exclude<ModalVariant, 'default' | 'confirm'>,
  ReactNode
> = {
  alert: <WarningIcon color="warning" sx={{ fontSize: 48 }} />,
  warning: <WarningIcon color="warning" sx={{ fontSize: 48 }} />,
  error: <ErrorIcon color="error" sx={{ fontSize: 48 }} />,
  info: <InfoIcon color="info" sx={{ fontSize: 48 }} />,
  success: <SuccessIcon color="success" sx={{ fontSize: 48 }} />,
};

/**
 * Modal component built on MUI Dialog with support for various common patterns.
 *
 * Features:
 * - Multiple variants (default, confirm, alert, warning, error, info, success)
 * - Customizable sizes (xs, sm, md, lg, xl)
 * - Fullscreen mode
 * - Scrollable content
 * - Custom actions with loading states
 * - Close button
 * - Responsive design
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  description,
  actions,
  maxWidth = 'sm',
  fullScreen = false,
  scroll = 'paper',
  variant = 'default',
  showCloseButton = true,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  fullWidth = true,
  loading = false,
  dividers = false,
  icon,
  sx,
}: ModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = (_event: unknown, reason?: string) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
      return;
    }
    onClose?.();
  };

  const variantIcon =
    icon ||
    (variant !== 'default' && variant !== 'confirm'
      ? variantIcons[variant]
      : null);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullScreen={fullScreen || isMobile}
      scroll={scroll}
      fullWidth={fullWidth}
      sx={sx}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {title && (
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {variantIcon && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {variantIcon}
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }}>{title}</Box>
          {showCloseButton && onClose && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent dividers={dividers}>
        {description && (
          <DialogContentText sx={{ mb: 2 }}>{description}</DialogContentText>
        )}
        {children}
      </DialogContent>

      {actions && actions.length > 0 && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'text'}
              color={action.color || 'primary'}
              disabled={action.disabled || loading}
              autoFocus={action.autoFocus}
              startIcon={
                action.loading ? <CircularProgress size={16} /> : undefined
              }
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
}
