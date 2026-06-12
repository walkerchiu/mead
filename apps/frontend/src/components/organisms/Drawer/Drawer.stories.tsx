import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Drawer, DrawerState } from './Drawer';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

/**
 * Drawer - Atomic Design: Organism
 *
 * 彈性的 drawer／sidebar 元件，支援三種顯示狀態與三種行為模式。
 * 非常適合響應式應用程式中的導覽側邊欄、設定面板與可收合的內容區。
 *
 * ## 主要功能
 *
 * - **三種變體**：temporary（覆蓋）、persistent（推移內容）、permanent（恆常顯示）
 * - **三種狀態**：closed、mini（僅圖示）、open（完整寬度）
 * - **流暢轉場**：以 Material-UI 轉場呈現狀態變化動畫
 * - **響應式**：依變體自動調整版面
 * - **可自訂**：自訂寬度、頁首、頁尾與切換按鈕
 *
 * ## 何時使用
 *
 * - **temporary**：行動裝置導覽選單、類似 modal 的側邊面板
 * - **persistent**：可切換的桌面應用程式側邊欄
 * - **permanent**：桌面儀表板中恆常顯示的導覽
 *
 * ## 行為細節
 *
 * **狀態**：
 * - `closed`：完全隱藏（僅限 temporary 與 persistent）
 * - `mini`：收合檢視，僅顯示圖示（寬 56-80px）
 * - `open`：完全展開，顯示完整內容（寬 240-320px）
 *
 * **變體**：
 * - `temporary`：覆蓋於內容上，可點擊外部或關閉按鈕關閉
 * - `persistent`：將主內容推至一旁，可透過按鈕切換
 * - `permanent`：恆常顯示，可在 open 與 mini 狀態間切換
 *
 * ## 常見使用情境
 *
 * - 應用程式導覽側邊欄
 * - 儀表板側邊面板
 * - 設定與組態面板
 * - 文件大綱檢視器
 * - 多層級導覽選單
 */
const meta = {
  title: 'Shared/Organisms/Drawer',
  component: Drawer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '彈性的 drawer／sidebar 元件，支援三種行為模式（temporary、persistent、permanent）與三種顯示狀態（closed、mini、open）。非常適合響應式導覽與可收合的側邊面板。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['closed', 'mini', 'open'],
      description: 'Drawer 的顯示狀態',
      table: {
        defaultValue: { summary: 'open' },
      },
    },
    variant: {
      control: 'select',
      options: ['temporary', 'persistent', 'permanent'],
      description: 'Drawer 行為模式',
      table: {
        defaultValue: { summary: 'persistent' },
      },
    },
    anchor: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Drawer 出現的螢幕側邊',
      table: {
        defaultValue: { summary: 'left' },
      },
    },
    width: {
      control: 'number',
      description: '完全開啟時的寬度（px）',
      table: {
        defaultValue: { summary: '240' },
      },
    },
    miniWidth: {
      control: 'number',
      description: '迷你狀態時的寬度（px）',
      table: {
        defaultValue: { summary: '64' },
      },
    },
    showToggleButton: {
      control: 'boolean',
      description: '顯示用於切換狀態的按鈕',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample menu items
const SampleMenuContent = () => (
  <List>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <HomeIcon />
        </ListItemIcon>
        <ListItemText primary="Home" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Profile" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItemButton>
    </ListItem>
    <ListItem disablePadding>
      <ListItemButton>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </ListItem>
  </List>
);

/**
 * 預設 persistent drawer - 起始為關閉，切換即可開啟。
 *
 * persistent drawer 在開啟時會將主內容推至一旁。請使用 Controls 面板
 * 以將狀態變更為 'open' 或 'mini'。這是桌面應用程式最常見的變體。
 *
 * **注意**：請切換至上方的 Canvas 檢視以與此範例互動。
 */
export const Default: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
        <Typography>
          Persistent drawer example. Use the Controls below to change the state.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'closed',
    variant: 'persistent',
    header: <Typography variant="h6">我的應用程式</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      canvas: {
        sourceState: 'shown',
      },
    },
  },
};

/**
 * Mini（收合）狀態，僅顯示圖示。
 *
 * 在 mini 狀態下，drawer 顯示僅含圖示的窄欄，節省螢幕空間
 * 同時維持導覽的可存取性。非常適合在桌面上最大化內容區。
 *
 * **注意**：請切換至上方的 Canvas 檢視以查看完整範例。
 */
export const Mini: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
        <Typography>迷你（收合）抽屜，僅顯示圖示。</Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'mini',
    variant: 'persistent',
    header: <Typography variant="h6">我的應用程式</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * Temporary drawer（行動裝置樣式）- 起始為關閉。
 *
 * temporary drawer 會如同 modal 一般滑過內容之上。請使用下方的 Controls 設定
 * 狀態設為 'open' 即可看到它出現。可點擊外部關閉。非常適合行動裝置導覽選單。
 *
 * **注意**：請切換至上方的 Canvas 檢視以與此範例互動。
 */
export const Temporary: Story = {
  render: (args) => (
    <Box
      sx={{
        position: 'relative',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ p: 3, bgcolor: 'grey.50', height: '100%' }}>
        <Typography variant="h5">主要內容</Typography>
        <Typography>
          Temporary drawer example. Use the Controls below to open it.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'closed',
    variant: 'temporary',
    header: <Typography variant="h6">我的應用程式</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * Permanent drawer - 起始為 mini 狀態。
 *
 * permanent drawer 恆常顯示且無法完全關閉。它可切換
 * 於 open 與 mini 狀態之間。請使用下方的 Controls 切換至 'open' 狀態。
 * 最適合具備恆常導覽的桌面儀表板。
 *
 * **注意**：請切換至上方的 Canvas 檢視以與此範例互動。
 */
export const Permanent: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
        <Typography>
          Permanent drawer example. Use the Controls below to expand it.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'mini',
    variant: 'permanent',
    header: <Typography variant="h6">我的應用程式</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * 靠右錨定的 drawer - 起始為關閉。
 *
 * drawer 可錨定於螢幕右側而非左側。
 * 請使用下方的 Controls 將狀態設為 'open' 或 'mini'。
 * 適用於設定面板、篩選或次要導覽。
 */
export const RightAnchor: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
        <Typography>
          Right-anchored drawer example. Use the Controls below to open it.
        </Typography>
      </Box>
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
    </Box>
  ),
  args: {
    state: 'closed',
    variant: 'persistent',
    anchor: 'right',
    header: <Typography variant="h6">設定</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * 含自訂寬度的 drawer - 起始為 mini 狀態。
 *
 * 你可自訂 open 寬度與 mini 寬度以符合設計需求。
 * 此範例展示較寬的 drawer（open 320px、mini 80px）。請使用下方的 Controls 展開它。
 */
export const CustomWidth: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
        <Typography>
          Custom width drawer (320px open, 80px mini). Use the Controls below.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'mini',
    variant: 'persistent',
    width: 320,
    miniWidth: 80,
    header: <Typography variant="h6">寬版抽屜</Typography>,
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * 含自訂頁首與頁尾的 drawer - 起始為 mini 狀態。
 *
 * 加入自訂頁首內容（例如應用程式名稱、Logo）與頁尾內容（例如版本資訊、
 * copyright），以打造完整的品牌化導覽體驗。請使用下方的 Controls 展開。
 */
export const WithHeaderFooter: Story = {
  render: (args) => (
    <Box
      sx={{
        display: 'flex',
        height: '500px',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}
    >
      <Drawer {...args}>
        <SampleMenuContent />
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h5">主要內容</Typography>
        <Typography>
          Drawer with custom header and footer. Use the Controls below.
        </Typography>
      </Box>
    </Box>
  ),
  args: {
    state: 'mini',
    variant: 'persistent',
    header: (
      <Box>
        <Typography variant="h6">My App</Typography>
        <Typography variant="caption" color="text.secondary">
          v1.0.0
        </Typography>
      </Box>
    ),
    footer: (
      <Box>
        <Typography variant="caption">© 2026 My Company</Typography>
      </Box>
    ),
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * 三種 drawer 變體的並列比較。
 *
 * 此範例展示 temporary、
 * persistent 與 permanent drawer 之間的視覺與行為差異，協助你為使用情境選擇正確的變體。
 */
export const VariantComparison: Story = {
  render: () => {
    return (
      <Box sx={{ border: '1px solid #ddd', p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Drawer Variants Comparison
        </Typography>

        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Temporary */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Temporary
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Overlays content, dismissible
            </Typography>
            <Box
              sx={{
                width: 300,
                height: 400,
                border: '1px solid #ddd',
                position: 'relative',
              }}
            >
              <Drawer state="open" variant="temporary" showToggleButton={false}>
                <SampleMenuContent />
              </Drawer>
            </Box>
          </Box>

          {/* Persistent */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Persistent
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Pushes content, toggleable
            </Typography>
            <Box
              sx={{ display: 'flex', height: 400, border: '1px solid #ddd' }}
            >
              <Drawer
                state="open"
                variant="persistent"
                showToggleButton={false}
              >
                <SampleMenuContent />
              </Drawer>
              <Box sx={{ flexGrow: 1, p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2">主要內容</Typography>
              </Box>
            </Box>
          </Box>

          {/* Permanent */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Permanent
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Always visible, can mini
            </Typography>
            <Box
              sx={{ display: 'flex', height: 400, border: '1px solid #ddd' }}
            >
              <Drawer state="mini" variant="permanent" showToggleButton={false}>
                <SampleMenuContent />
              </Drawer>
              <Box sx={{ flexGrow: 1, p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2">主要內容</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 550,
      },
    },
  },
};

/**
 * 含狀態控制的互動範例 - 功能完整。
 *
 * 此範例起始為 mini 狀態。請點擊 drawer 內的切換按鈕（箭頭圖示）
 * 以在 open 與 mini 狀態間切換。這示範了 drawer 如何與
 * 你的應用程式狀態管理整合。目前狀態會顯示於主內容區。
 */
export const Interactive: Story = {
  render: (args) => {
    const [state, setState] = useState<DrawerState>('mini');

    return (
      <Box
        sx={{
          display: 'flex',
          height: '600px',
          border: '1px solid #ddd',
          overflow: 'hidden',
        }}
      >
        <Drawer
          {...args}
          state={state}
          onStateChange={setState}
          header={<Typography variant="h6">我的應用程式</Typography>}
        >
          <SampleMenuContent />
        </Drawer>

        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            主要內容區
          </Typography>
          <Typography paragraph>
            目前抽屜狀態：<strong>{state}</strong>
          </Typography>
          <Typography paragraph>
            點選抽屜中的切換按鈕（箭頭圖示）即可在各狀態 之間切換。
          </Typography>
          <Typography>
            在 <strong>persistent</strong> 模式下，抽屜會推開主要 內容。
          </Typography>
        </Box>
      </Box>
    );
  },
  args: {
    variant: 'persistent',
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 650,
      },
    },
  },
};

/**
 * 含 AppBar 與 permanent drawer 的完整應用程式版面 - 功能完整。
 *
 * 此範例展示結合頂端 AppBar 與 permanent
 * drawer 導覽。drawer 起始為 mini 狀態。請點擊切換按鈕（箭頭圖示）
 * 於 drawer 內以展開它。這是 HQ 儀表板與網頁應用程式常見的模式。
 */
export const ApplicationLayout: Story = {
  render: () => {
    const [state, setState] = useState<DrawerState>('mini');

    return (
      <Box
        sx={{
          display: 'flex',
          height: '600px',
          border: '1px solid #ddd',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <AppBar
          position="absolute"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Dashboard Application
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          state={state}
          variant="permanent"
          onStateChange={setState}
          header={
            <Box sx={{ mt: 8 }}>
              <Typography variant="h6">Navigation</Typography>
            </Box>
          }
        >
          <SampleMenuContent />
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Typography variant="h4" gutterBottom>
            Welcome to Dashboard
          </Typography>
          <Typography paragraph>
            Complete application layout with permanent drawer and top AppBar.
            Click the arrow icon in the drawer to toggle it.
          </Typography>
          <Typography>
            Current drawer state: <strong>{state}</strong>
          </Typography>
        </Box>
      </Box>
    );
  },
  parameters: {
    layout: 'padded',
    docs: {
      story: {
        inline: false,
        iframeHeight: 650,
      },
    },
  },
};
