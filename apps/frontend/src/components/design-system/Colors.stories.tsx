import type { Meta, StoryObj } from '@storybook/nextjs';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Colors Design System
 *
 * Displays all colors used in the application, including primary colors, secondary colors, state colors, etc.
 */

const ColorPalette = () => {
  const theme = useTheme();

  const ColorBox = ({
    color,
    name,
    value,
  }: {
    color: string;
    name: string;
    value?: string;
  }) => (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          width: '100%',
          height: 80,
          bgcolor: color,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          mb: 1,
        }}
      />
      <Typography variant="subtitle2">{name}</Typography>
      {value && (
        <Typography variant="caption" color="text.secondary">
          {value}
        </Typography>
      )}
    </Box>
  );

  const ColorShades = ({
    colorName,
    shades,
  }: {
    colorName: string;
    shades: any;
  }) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {colorName}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 2,
        }}
      >
        {Object.entries(shades).map(([shade, value]) => (
          <ColorBox
            key={shade}
            color={value as string}
            name={`${colorName}.${shade}`}
            value={value as string}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200 }}>
      <Typography variant="h4" gutterBottom>
        Color System
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Complete color system used in the application, based on Material-UI
        theme configuration.
      </Typography>

      {/* Primary Colors */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Primary Colors
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 3,
          }}
        >
          <ColorBox
            color={theme.palette.primary.main}
            name="Primary"
            value={theme.palette.primary.main}
          />
          <ColorBox
            color={theme.palette.secondary.main}
            name="Secondary"
            value={theme.palette.secondary.main}
          />
          <ColorBox
            color={theme.palette.error.main}
            name="Error"
            value={theme.palette.error.main}
          />
          <ColorBox
            color={theme.palette.warning.main}
            name="Warning"
            value={theme.palette.warning.main}
          />
          <ColorBox
            color={theme.palette.info.main}
            name="Info"
            value={theme.palette.info.main}
          />
          <ColorBox
            color={theme.palette.success.main}
            name="Success"
            value={theme.palette.success.main}
          />
        </Box>
      </Box>

      {/* Primary shades */}
      {theme.palette.primary && (
        <ColorShades
          colorName="Primary"
          shades={{
            light: theme.palette.primary.light,
            main: theme.palette.primary.main,
            dark: theme.palette.primary.dark,
          }}
        />
      )}

      {/* Secondary shades */}
      {theme.palette.secondary && (
        <ColorShades
          colorName="Secondary"
          shades={{
            light: theme.palette.secondary.light,
            main: theme.palette.secondary.main,
            dark: theme.palette.secondary.dark,
          }}
        />
      )}

      {/* Text Colors */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Text Colors
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 3,
          }}
        >
          <Box>
            <Box
              sx={{
                width: '100%',
                height: 80,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <Typography color="text.primary">Primary Text</Typography>
            </Box>
            <Typography variant="subtitle2">Text Primary</Typography>
            <Typography variant="caption" color="text.secondary">
              {theme.palette.text.primary}
            </Typography>
          </Box>
          <Box>
            <Box
              sx={{
                width: '100%',
                height: 80,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <Typography color="text.secondary">Secondary Text</Typography>
            </Box>
            <Typography variant="subtitle2">Text Secondary</Typography>
            <Typography variant="caption" color="text.secondary">
              {theme.palette.text.secondary}
            </Typography>
          </Box>
          <Box>
            <Box
              sx={{
                width: '100%',
                height: 80,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <Typography color="text.disabled">Disabled Text</Typography>
            </Box>
            <Typography variant="subtitle2">Text Disabled</Typography>
            <Typography variant="caption" color="text.secondary">
              {theme.palette.text.disabled}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Background Colors */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Background Colors
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 3,
          }}
        >
          <ColorBox
            color={theme.palette.background.default}
            name="Background Default"
            value={theme.palette.background.default}
          />
          <ColorBox
            color={theme.palette.background.paper}
            name="Background Paper"
            value={theme.palette.background.paper}
          />
        </Box>
      </Box>

      {/* Grayscale */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Grayscale
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 2,
          }}
        >
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => {
            const greyValue = (theme.palette.grey as any)[shade];
            return (
              <ColorBox
                key={shade}
                color={greyValue}
                name={`Grey ${shade}`}
                value={greyValue}
              />
            );
          })}
        </Box>
      </Box>

      {/* Usage Examples */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Usage Examples
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            sx={{
              p: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="h6">Primary Background</Typography>
            <Typography>This is text on primary background</Typography>
          </Paper>
          <Paper
            sx={{
              p: 3,
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
            }}
          >
            <Typography variant="h6">Secondary Background</Typography>
            <Typography>This is text on secondary background</Typography>
          </Paper>
          <Paper
            sx={{ p: 3, bgcolor: 'error.main', color: 'error.contrastText' }}
          >
            <Typography variant="h6">Error Background</Typography>
            <Typography>This is text on error background</Typography>
          </Paper>
          <Paper
            sx={{
              p: 3,
              bgcolor: 'success.main',
              color: 'success.contrastText',
            }}
          >
            <Typography variant="h6">Success Background</Typography>
            <Typography>This is text on success background</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

const meta = {
  title: 'Shared/Design System/Colors',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorSystem: Story = {
  render: () => <ColorPalette />,
};
