'use client';

import React, { useState } from 'react';
import {
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  type ChipOwnProps,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { Button } from '@/components/atoms';

export interface StatusOption {
  value: string;
  label: string;
  color: ChipOwnProps['color'];
}

export interface StatusTransitionMenuProps {
  /** Current status value */
  currentStatus: string;
  /** All possible statuses */
  statuses: StatusOption[];
  /** Called when a transition is confirmed */
  onTransition: (targetStatus: string, feedback?: string) => Promise<void>;
  /** Whether transitions are disabled */
  disabled?: boolean;
  /** Whether the user can transition (hide menu if false) */
  canTransition?: boolean;
  /** Label for the feedback field */
  feedbackLabel?: string;
  /** Label for the confirm dialog title */
  confirmTitle?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Label for the confirm button */
  confirmLabel?: string;
}

/** Map Chip color names to MUI palette keys. */
const paletteKeyMap: Record<string, string> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
};

export function StatusTransitionMenu({
  currentStatus,
  statuses,
  onTransition,
  disabled = false,
  canTransition = true,
  feedbackLabel = '備註（選填）',
  confirmTitle = '確認狀態變更',
  cancelLabel = '取消',
  confirmLabel = '確認',
}: StatusTransitionMenuProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<StatusOption | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentOption = statuses.find((s) => s.value === currentStatus);
  const availableTransitions = statuses.filter(
    (s) => s.value !== currentStatus,
  );
  const hasTransitions =
    canTransition && !disabled && availableTransitions.length > 0;

  /** Resolve a chip color name to a concrete colour string via the theme palette. */
  const resolveColor = (color: ChipOwnProps['color']): string => {
    const key = paletteKeyMap[color ?? ''];
    if (key) {
      const value = (
        theme.palette as unknown as Record<string, { main?: string }>
      )[key];
      return value?.main ?? theme.palette.grey[500];
    }
    return theme.palette.grey[500];
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!hasTransitions) return;
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectStatus = (status: StatusOption) => {
    setTargetStatus(status);
    setFeedback('');
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirm = async () => {
    if (!targetStatus) return;
    setSubmitting(true);
    try {
      await onTransition(targetStatus.value, feedback || undefined);
      setDialogOpen(false);
      setTargetStatus(null);
      setFeedback('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (submitting) return;
    setDialogOpen(false);
    setTargetStatus(null);
    setFeedback('');
  };

  const currentColor = resolveColor(currentOption?.color);

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleButtonClick}
        disabled={disabled}
        startIcon={
          <CircleIcon
            sx={{ fontSize: '10px !important', color: currentColor }}
          />
        }
        endIcon={hasTransitions ? <ArrowDropDownIcon /> : undefined}
        sx={{
          cursor: hasTransitions ? 'pointer' : 'default',
          borderColor: currentColor,
          color: 'text.primary',
          '&:hover': hasTransitions
            ? { borderColor: currentColor, bgcolor: 'action.hover' }
            : { borderColor: currentColor, bgcolor: 'transparent' },
        }}
      >
        {currentOption?.label ?? currentStatus}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { mt: 0.5, minWidth: 160 },
          },
        }}
      >
        {availableTransitions.map((status) => (
          <MenuItem
            key={status.value}
            onClick={() => handleSelectStatus(status)}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CircleIcon
                sx={{ fontSize: 10, color: resolveColor(status.color) }}
              />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">{status.label}</Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmTitle}</DialogTitle>
        <DialogContent>
          {currentOption && targetStatus && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 1,
                mb: 2,
              }}
            >
              <Chip
                label={currentOption.label}
                color={currentOption.color}
                variant="outlined"
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                →
              </Typography>
              <Chip
                label={targetStatus.label}
                color={targetStatus.color}
                variant="filled"
                size="small"
              />
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={feedbackLabel}
            fullWidth
            multiline
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleDialogClose}
            disabled={submitting}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
