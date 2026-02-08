import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { Meta, StoryObj } from '@storybook/nextjs';
import type {} from '../../../../theme/palette'; // Use relative path for augmentation import in Storybook to avoid path alias issues in story TS context
import { ActionButton } from './ActionButton';

const meta = {
  title: 'Atoms/ActionButton',
  component: ActionButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'standard', 'outline'],
      description: 'Action button variant',
    },
    shape: {
      control: 'select',
      options: ['circle', 'pill'],
      description: 'Outline shape',
    },
    size: {
      control: 'select',
      options: ['sm', 'lg'],
      description: 'Size (sm=32, lg=40) for pill shape only',
    },
    children: {
      control: false,
      table: { disable: true },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether to disable',
    },
  },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: <EditIcon fontSize="small" />,
  },
};

const STATES = [
  { key: 'default', label: 'Default' },
  { key: 'hover', label: 'Hover' },
  { key: 'pressed', label: 'Pressed' },
  { key: 'disabled', label: 'Disabled' },
] as const;

const ROWS = [
  { label: 'Default', variant: 'default' as const },
  { label: 'Standard', variant: 'standard' as const },
  { label: 'Outline', variant: 'outline' as const },
];

type StateKey = (typeof STATES)[number]['key'];

const ActionButtonVariantsTable = ({ shape }: { shape: 'circle' | 'pill' }) => {
  const theme = useTheme();
  const tokens = theme.palette.actionButtonTokens;

  const getToken = (variant: 'default' | 'standard' | 'outline') =>
    tokens[variant];

  const getStateSx = (
    variant: 'default' | 'standard' | 'outline',
    state: StateKey,
  ) => {
    if (state === 'default' || state === 'disabled') {
      return {};
    }
    const token = getToken(variant);
    const bg = state === 'hover' ? token.hoverBg : token.pressedBg;
    const base: Record<string, string> = {
      backgroundImage: 'none',
      backgroundColor: bg,
      color: token.icon,
    };
    if ('border' in token) {
      base.borderColor = token.border;
    }
    return base;
  };

  const renderGroup = (
    variant: 'default' | 'standard' | 'outline',
    state: StateKey,
  ) => (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <ActionButton
        variant={variant}
        aria-label="edit"
        disabled={state === 'disabled'}
        sx={getStateSx(variant, state)}
        shape={shape}
        size={shape === 'pill' ? 'lg' : 'sm'}
      >
        <EditIcon fontSize="small" />
      </ActionButton>
      <ActionButton
        variant={variant}
        aria-label="delete"
        disabled={state === 'disabled'}
        sx={getStateSx(variant, state)}
        shape={shape}
        size={shape === 'pill' ? 'lg' : 'sm'}
      >
        <DeleteIcon fontSize="small" />
      </ActionButton>
      <ActionButton
        variant={variant}
        aria-label="next"
        disabled={state === 'disabled'}
        sx={getStateSx(variant, state)}
        shape={shape}
        size={shape === 'pill' ? 'lg' : 'sm'}
      >
        <ChevronRightIcon fontSize="small" />
      </ActionButton>
    </Stack>
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px repeat(4, minmax(140px, 1fr))',
        gap: 2,
        alignItems: 'center',
      }}
    >
      <Box />
      {STATES.map((state) => (
        <Typography key={state.key} variant="subtitle2">
          {state.label}
        </Typography>
      ))}
      {ROWS.map((row) => (
        <Box
          key={row.variant}
          sx={{
            display: 'contents',
          }}
        >
          <Typography variant="subtitle2">{row.label}</Typography>
          {STATES.map((state) => (
            <Box key={`${row.variant}-${state.key}`}>
              {renderGroup(row.variant, state.key)}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export const Variants: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => <ActionButtonVariantsTable shape="circle" />,
};

export const VariantsPill: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => <ActionButtonVariantsTable shape="pill" />,
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      <div style={{ fontSize: 12, color: '#637994' }}>Small (32)</div>
      <Stack direction="row" spacing={2} alignItems="center">
        <ActionButton
          variant="default"
          shape="pill"
          size="sm"
          aria-label="edit"
        >
          <EditIcon fontSize="small" />
        </ActionButton>
        <ActionButton
          variant="standard"
          shape="pill"
          size="sm"
          aria-label="edit"
        >
          <EditIcon fontSize="small" />
        </ActionButton>
        <ActionButton
          variant="outline"
          shape="pill"
          size="sm"
          aria-label="edit"
        >
          <EditIcon fontSize="small" />
        </ActionButton>
      </Stack>
      <div style={{ fontSize: 12, color: '#637994' }}>Large (40)</div>
      <Stack direction="row" spacing={2} alignItems="center">
        <ActionButton
          variant="default"
          shape="pill"
          size="lg"
          aria-label="edit"
        >
          <EditIcon fontSize="small" />
        </ActionButton>
        <ActionButton
          variant="standard"
          shape="pill"
          size="lg"
          aria-label="edit"
        >
          <EditIcon fontSize="small" />
        </ActionButton>
        <ActionButton
          variant="outline"
          shape="pill"
          size="lg"
          aria-label="edit"
        >
          <EditIcon fontSize="small" />
        </ActionButton>
      </Stack>
    </Stack>
  ),
};
