'use client';

import {
  IconButton,
  Tooltip,
  Fade,
  type SxProps,
  type Theme,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

export interface ScrollButtonProps {
  /** Button direction */
  direction: 'up' | 'down' | 'toTop' | 'toBottom';

  /** Click handler function */
  onClick: () => void;

  /** Whether the button is disabled */
  disabled?: boolean;

  /** Button size */
  size?: 'small' | 'medium' | 'large';

  /** Custom styles */
  sx?: SxProps<Theme>;

  /** Tooltip text */
  tooltip?: string;

  /** Whether the button is visible */
  visible?: boolean;
}

const iconMap = {
  up: KeyboardArrowUpIcon,
  down: KeyboardArrowDownIcon,
  toTop: KeyboardDoubleArrowUpIcon,
  toBottom: KeyboardDoubleArrowDownIcon,
};

export function ScrollButton({
  direction,
  onClick,
  disabled = false,
  size = 'medium',
  sx,
  tooltip,
  visible = true,
}: ScrollButtonProps) {
  const Icon = iconMap[direction];

  const sizeMap = {
    small: 40,
    medium: 48,
    large: 56,
  };

  return (
    <Fade in={visible} timeout={300}>
      <span>
        <Tooltip title={tooltip || ''} placement="left">
          <IconButton
            onClick={onClick}
            disabled={disabled}
            sx={{
              width: sizeMap[size],
              height: sizeMap[size],
              backgroundColor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              boxShadow: 2,
              ...sx,
            }}
            aria-label={tooltip}
          >
            <Icon fontSize={size === 'small' ? 'small' : 'medium'} />
          </IconButton>
        </Tooltip>
      </span>
    </Fade>
  );
}
