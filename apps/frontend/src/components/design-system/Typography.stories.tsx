import type { Meta, StoryObj } from '@storybook/react';
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
 * 展示應用程式中使用的所有文字樣式，包括標題、正文、按鈕文字等。
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
        排版系統
      </MuiTypography>
      <MuiTypography variant="body1" color="text.secondary" paragraph>
        應用程式使用的完整排版系統，包括所有文字變體和樣式。
      </MuiTypography>

      {/* 標題 */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          標題 (Headings)
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample
            variant="h1"
            description="最大標題，用於頁面主標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h2"
            description="次級標題，用於主要區塊標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h3"
            description="三級標題，用於內容區塊標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h4"
            description="四級標題，用於子區塊標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h5"
            description="五級標題，用於組件標題"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="h6"
            description="六級標題，用於小節標題"
          />
        </Paper>
      </Box>

      {/* 正文 */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          正文 (Body)
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample
            variant="body1"
            description="主要正文文字，用於一般內容"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="body2"
            description="次要正文文字，用於輔助內容"
          />
        </Paper>
      </Box>

      {/* 副標題和標註 */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          副標題與標註
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
            description="小字標註，用於提示或說明文字"
          />
          <Divider sx={{ my: 2 }} />
          <TypographyExample
            variant="overline"
            description="大寫標籤文字，用於分類標籤"
          />
        </Paper>
      </Box>

      {/* 按鈕文字 */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          按鈕文字
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <TypographyExample variant="button" description="按鈕文字樣式" />
        </Paper>
      </Box>

      {/* 字重 */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          字重 (Font Weight)
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

      {/* 文字對齊 */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          文字對齊
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <MuiTypography align="left" gutterBottom>
            Left aligned text (預設)
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

      {/* 文字顏色 */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          文字顏色
        </MuiTypography>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MuiTypography color="text.primary">
              Primary text - 主要文字顏色
            </MuiTypography>
            <MuiTypography color="text.secondary">
              Secondary text - 次要文字顏色
            </MuiTypography>
            <MuiTypography color="text.disabled">
              Disabled text - 禁用文字顏色
            </MuiTypography>
            <MuiTypography color="primary">
              Primary color - 主色調
            </MuiTypography>
            <MuiTypography color="secondary">
              Secondary color - 輔助色
            </MuiTypography>
            <MuiTypography color="error">Error color - 錯誤色</MuiTypography>
            <MuiTypography color="warning">
              Warning color - 警告色
            </MuiTypography>
            <MuiTypography color="info">Info color - 資訊色</MuiTypography>
            <MuiTypography color="success">
              Success color - 成功色
            </MuiTypography>
          </Box>
        </Paper>
      </Box>

      {/* 使用範例 */}
      <Box sx={{ mb: 6 }}>
        <MuiTypography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
          實際使用範例
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
            作者：王小明 • 發布於 2026年2月6日
          </MuiTypography>
          <MuiTypography variant="body1" paragraph>
            這是文章的第一段落。Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </MuiTypography>
          <MuiTypography variant="h6" gutterBottom sx={{ mt: 3 }}>
            小節標題
          </MuiTypography>
          <MuiTypography variant="body2" paragraph>
            這是文章的第二段落，使用較小的字體。Ut enim ad minim veniam, quis
            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
          </MuiTypography>
          <MuiTypography variant="caption" color="text.secondary">
            * 這是一個註解或免責聲明
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
