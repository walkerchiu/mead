import { styled } from '@mui/material/styles';
import { getChipStyles, type ChipSize, type ChipVariant } from './chipStyles';

const StyledChip = styled('div')<{
  chipVariant?: ChipVariant;
  chipSize?: ChipSize;
  disabled?: boolean;
  hasIcon?: boolean;
  hasDot?: boolean;
}>(({ theme, ...props }) =>
  getChipStyles({
    tokens: theme.palette.chipTokens,
    variant: props.chipVariant,
    size: props.chipSize,
    disabled: props.disabled,
    hasIcon: props.hasIcon,
    hasDot: props.hasDot,
  }),
);

export interface ChipProps {
  label: React.ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: React.ReactNode;
  dot?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Chip({
  label,
  variant = 'text',
  size = 'medium',
  icon,
  dot = false,
  disabled = false,
  className,
}: ChipProps) {
  return (
    <StyledChip
      chipVariant={variant}
      chipSize={size}
      disabled={disabled}
      hasIcon={Boolean(icon)}
      hasDot={dot}
      className={className}
    >
      {dot ? <span className="Chip-dot" /> : null}
      {icon ? <span className="Chip-icon">{icon}</span> : null}
      <span className="Chip-label">{label}</span>
    </StyledChip>
  );
}

export default Chip;
