import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  Box,
  Typography as MuiTypography,
  Paper,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Typography Design System
 *
 * Displays all text styles used in the application, including headings, body text, button text, etc.
 */

const TypographySystem = () => {
  const theme = useTheme();

  const TypographyExample = ({
    variant,
    description,
  }: {
    variant: any;
    description: string;
  }) => {
    const style = theme.typography[variant];
    return (
      <Box sx={{ mb: 3 }}>
        <MuiTypography variant={variant} gutterBottom>
          {variant} - The quick brown fox jumps over the lazy dog
        </MuiTypography>
        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
          <MuiTypography variant="caption" color="text.secondary">
            {description}
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            {style.fontSize} / {style.fontWeight} / {style.lineHeight}
          </MuiTypography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200 }}>
      <MuiTypography variant="h4" gutterBottom>
        Typography System
      </MuiTypography>
      <MuiTypography variant="body1" color="text.secondary" paragraph>
        Complete typography system used in the application, including all text
        variants and styles.
      </MuiTypography>

      {/* Headings */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Headings
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample
            variant="h1"
            description="Largest heading, used for main page titles"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h2"
            description="Secondary heading, used for main section titles"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h3"
            description="Third-level heading, used for content section titles"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h4"
            description="Fourth-level heading, used for subsection titles"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h5"
            description="Fifth-level heading, used for component titles"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h6"
            description="Sixth-level heading, used for minor section titles"
          />
        </Paper>
      </Box>

      {/* Body Text */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Body Text
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample
            variant="body1"
            description="Primary body text, used for general content"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="body2"
            description="Secondary body text, used for supporting content"
          />
        </Paper>
      </Box>

      {/* subtitle and caption */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Subtitles and Captions
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample
            variant="subtitle1"
            description="Larger subtitle, used for cards or list items"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="subtitle2"
            description="Smaller subtitle, used for secondary information"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="caption"
            description="Small caption text, used for hints or explanatory text"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="overline"
            description="Uppercase label text, used for category labels"
          />
        </Paper>
      </Box>

      {/* Button Text */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Button Text
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample variant="button" description="Button text style" />
        </Paper>
      </Box>

      {/* font weight */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Font Weight
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MuiTypography sx={{ fontWeight: 300 }}>
              Light (300) - The quick brown fox jumps over the lazy dog
            </MuiTypography>
            <MuiTypography sx={{ fontWeight: 400 }}>
              Regular (400) - The quick brown fox jumps over the lazy dog
            </MuiTypography>
            <MuiTypography sx={{ fontWeight: 500 }}>
              Medium (500) - The quick brown fox jumps over the lazy dog
            </MuiTypography>
            <MuiTypography sx={{ fontWeight: 600 }}>
              Semi Bold (600) - The quick brown fox jumps over the lazy dog
            </MuiTypography>
            <MuiTypography sx={{ fontWeight: 700 }}>
              Bold (700) - The quick brown fox jumps over the lazy dog
            </MuiTypography>
          </Box>
        </Paper>
      </Box>

      {/* Text Alignment */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Text Alignment
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <MuiTypography align="left" gutterBottom>
            Left aligned text (default)
          </MuiTypography>
          <MuiTypography align="center" gutterBottom>
            Center aligned text
          </MuiTypography>
          <MuiTypography align="right" gutterBottom>
            Right aligned text
          </MuiTypography>
          <MuiTypography align="justify">
            Justified text. Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
            aliqua.
          </MuiTypography>
        </Paper>
      </Box>

      {/* Text Colors */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Text Colors
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MuiTypography color="text.primary">
              Primary text - Primary text color
            </MuiTypography>
            <MuiTypography color="text.secondary">
              Secondary text - Secondary text color
            </MuiTypography>
            <MuiTypography color="text.disabled">
              Disabled text - Disabled text color
            </MuiTypography>
            <MuiTypography color="primary">
              Primary color - Primary color
            </MuiTypography>
            <MuiTypography color="secondary">
              Secondary color - Secondary color
            </MuiTypography>
            <MuiTypography color="error">
              Error color - Error color
            </MuiTypography>
            <MuiTypography color="warning">
              Warning color - Warning color
            </MuiTypography>
            <MuiTypography color="info">Info color - Info color</MuiTypography>
            <MuiTypography color="success">
              Success color - Success color
            </MuiTypography>
          </Box>
        </Paper>
      </Box>

      {/* usage examples */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Real-world Usage Examples
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <MuiTypography variant="h4" gutterBottom>
            Article Title
          </MuiTypography>
          <MuiTypography
            variant="subtitle1"
            color="text.secondary"
            gutterBottom
          >
            Author: John Smith • Published on February 6, 2026
          </MuiTypography>
          <MuiTypography variant="body1" paragraph>
            This is the first paragraph of the article.Lorem ipsum dolor sit
            amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua.
          </MuiTypography>
          <MuiTypography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Subsection Title
          </MuiTypography>
          <MuiTypography variant="body2" paragraph>
            This is the second paragraph of the article, using smaller font.Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
            ut aliquip ex ea commodo consequat.
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            * This is a note or disclaimer
          </MuiTypography>
        </Paper>
      </Box>
    </Box>
  );
};

const meta = {
  title: 'Design System/Typography',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypographySystemStory: Story = {
  render: () => <TypographySystem />,
};
