import type { Meta, StoryObj } from '@storybook/nextjs';
import {
  Box,
  Typography as MuiTypography,
  Paper,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Typography 設計系統
 *
 * 顯示應用程式中使用的所有文字樣式，包含標題、內文、按鈕文字等。
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
        Typography 系統
      </MuiTypography>
      <MuiTypography variant="body1" color="text.secondary" paragraph>
        應用程式中所使用的完整 Typography 系統，涵蓋所有文字變體與樣式。
      </MuiTypography>

      {/* Headings */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          標題
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample
            variant="h1"
            description="最大的標題，用於頁面主標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h2"
            description="次級標題，用於主要區塊標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h3"
            description="第三級標題，用於內容區塊標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h4"
            description="第四級標題，用於子區塊標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h5"
            description="第五級標題，用於元件標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h6"
            description="第六級標題，用於次要區塊標題"
          />
        </Paper>
      </Box>

      {/* Body Text */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          內文
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample
            variant="body1"
            description="主要內文，用於一般內容"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="body2"
            description="次要內文，用於輔助內容"
          />
        </Paper>
      </Box>

      {/* subtitle and caption */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          副標題與輔助文字
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample
            variant="subtitle1"
            description="較大的副標題，用於卡片或列表項目"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="subtitle2"
            description="較小的副標題，用於次要資訊"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="caption"
            description="小型輔助文字，用於提示或說明文字"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="overline"
            description="大寫標籤文字，用於分類標籤"
          />
        </Paper>
      </Box>

      {/* Button Text */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          按鈕文字
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample variant="button" description="按鈕文字樣式" />
        </Paper>
      </Box>

      {/* font weight */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          字重
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
          文字對齊
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <MuiTypography align="left" gutterBottom>
            靠左對齊文字（預設）
          </MuiTypography>
          <MuiTypography align="center" gutterBottom>
            置中對齊文字
          </MuiTypography>
          <MuiTypography align="right" gutterBottom>
            靠右對齊文字
          </MuiTypography>
          <MuiTypography align="justify">
            左右對齊文字。Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
            aliqua.
          </MuiTypography>
        </Paper>
      </Box>

      {/* Text Colors */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          文字色彩
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MuiTypography color="text.primary">
              主要文字 - 主要文字色彩
            </MuiTypography>
            <MuiTypography color="text.secondary">
              次要文字 - 次要文字色彩
            </MuiTypography>
            <MuiTypography color="text.disabled">
              停用文字 - 停用文字色彩
            </MuiTypography>
            <MuiTypography color="primary">主要色 - 主要色彩</MuiTypography>
            <MuiTypography color="secondary">次要色 - 次要色彩</MuiTypography>
            <MuiTypography color="error">錯誤色 - 錯誤色彩</MuiTypography>
            <MuiTypography color="warning">警告色 - 警告色彩</MuiTypography>
            <MuiTypography color="info">資訊色 - 資訊色彩</MuiTypography>
            <MuiTypography color="success">成功色 - 成功色彩</MuiTypography>
          </Box>
        </Paper>
      </Box>

      {/* usage examples */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          實際應用範例
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <MuiTypography variant="h4" gutterBottom>
            文章標題
          </MuiTypography>
          <MuiTypography
            variant="subtitle1"
            color="text.secondary"
            gutterBottom
          >
            作者：John Smith • 發布於 2026 年 2 月 6 日
          </MuiTypography>
          <MuiTypography variant="body1" paragraph>
            這是文章的第一段。Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
            aliqua.
          </MuiTypography>
          <MuiTypography variant="h6" gutterBottom sx={{ mt: 3 }}>
            子區塊標題
          </MuiTypography>
          <MuiTypography variant="body2" paragraph>
            這是文章的第二段，使用較小的字型。Ut enim ad minim veniam, quis
            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            * 這是備註或免責聲明
          </MuiTypography>
        </Paper>
      </Box>
    </Box>
  );
};

const meta = {
  title: 'Shared/Design System/Typography',
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
