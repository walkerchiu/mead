import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Modal } from './Modal';
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material';

/**
 * Modal 元件提供多種常見的對話框樣式。
 *
 * **功能特性**：
 * - 多種變體（default、confirm、alert、warning、error、info、success）
 * - 自訂尺寸（xs、sm、md、lg、xl）
 * - 全螢幕模式
 * - 可捲動內容
 * - 自訂操作按鈕（含載入中狀態）
 * - 響應式設計（行動裝置上自動全螢幕）
 *
 * **常見使用情境**：
 * - 確認對話框
 * - 表單輸入對話框
 * - 警告／錯誤提示
 * - 資訊顯示
 * - 內容預覽
 */
const meta = {
  title: 'Shared/Organisms/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '以 MUI Dialog 建構的彈性 modal 元件，支援確認對話框、警示、表單等多種常見樣式。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Modal 是否開啟',
    },
    variant: {
      control: 'select',
      options: [
        'default',
        'confirm',
        'alert',
        'warning',
        'error',
        'info',
        'success',
      ],
      description: 'Modal 變體（影響圖示與樣式）',
    },
    maxWidth: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', false],
      description: 'Modal 的最大寬度',
      table: {
        defaultValue: { summary: 'sm' },
      },
    },
    fullScreen: {
      control: 'boolean',
      description: '以全螢幕顯示 Modal',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    scroll: {
      control: 'select',
      options: ['paper', 'body'],
      description: '捲動行為',
      table: {
        defaultValue: { summary: 'paper' },
      },
    },
    showCloseButton: {
      control: 'boolean',
      description: '在標題列顯示關閉按鈕',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Modal 是否佔滿寬度',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    loading: {
      control: 'boolean',
      description: '載入中狀態',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    dividers: {
      control: 'boolean',
      description: '在區段之間顯示分隔線',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 含標題與內容的基本 modal
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Modal
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Basic Modal"
          actions={[
            {
              label: 'Cancel',
              onClick: () => setOpen(false),
              variant: 'outlined',
            },
            {
              label: 'Confirm',
              onClick: () => setOpen(false),
              variant: 'contained',
            },
          ]}
        >
          <Typography>
            This is a basic modal with a title, content, and action buttons.
          </Typography>
        </Modal>
      </Box>
    );
  },
};

/**
 * 載入中狀態 modal
 */
export const LoadingState: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAction = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 3000);
    };

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Process Action
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Processing"
          loading={loading}
          maxWidth="xs"
          actions={[
            {
              label: 'Cancel',
              onClick: () => setOpen(false),
              variant: 'outlined',
              disabled: loading,
            },
            {
              label: 'Process',
              onClick: handleAction,
              variant: 'contained',
              loading: loading,
            },
          ]}
        >
          <Typography>點選「Process」即可檢視載入中狀態。</Typography>
        </Modal>
      </Box>
    );
  },
};

/**
 * 所有變體的互動比較
 */
export const AllVariants: Story = {
  render: () => {
    const [openVariant, setOpenVariant] = useState<string | null>(null);

    const variants = [
      { value: 'default', label: 'Default', color: 'primary' },
      { value: 'confirm', label: 'Confirm', color: 'primary' },
      { value: 'warning', label: 'Warning', color: 'warning' },
      { value: 'error', label: 'Error', color: 'error' },
      { value: 'info', label: 'Info', color: 'info' },
      { value: 'success', label: 'Success', color: 'success' },
    ] as const;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Modal Variants
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
          {variants.map(({ value, label, color }) => (
            <Box key={value}>
              <Button
                variant="contained"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                color={color as any}
                onClick={() => setOpenVariant(value)}
              >
                {label}
              </Button>
              <Modal
                open={openVariant === value}
                onClose={() => setOpenVariant(null)}
                title={`${label} Modal`}
                description={`This is a ${label.toLowerCase()} variant modal with appropriate styling and icon.`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                variant={value as any}
                maxWidth="xs"
                actions={[
                  {
                    label: 'Cancel',
                    onClick: () => setOpenVariant(null),
                    variant: 'outlined',
                  },
                  {
                    label: 'Confirm',
                    onClick: () => setOpenVariant(null),
                    variant: 'contained',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color: color as any,
                  },
                ]}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
};

/**
 * 尺寸比較
 */
export const SizeComparison: Story = {
  render: () => {
    const [openSize, setOpenSize] = useState<
      'xs' | 'sm' | 'md' | 'lg' | 'xl' | null
    >(null);

    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Box key={size}>
            <Button variant="outlined" onClick={() => setOpenSize(size)}>
              Open {size.toUpperCase()}
            </Button>
            <Modal
              open={openSize === size}
              onClose={() => setOpenSize(null)}
              title={`${size.toUpperCase()} Modal`}
              maxWidth={size}
              actions={[
                {
                  label: 'Close',
                  onClick: () => setOpenSize(null),
                  variant: 'contained',
                },
              ]}
            >
              <Typography>This is a {size} sized modal.</Typography>
            </Modal>
          </Box>
        ))}
      </Box>
    );
  },
};

/**
 * 全螢幕 modal
 */
export const Fullscreen: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Fullscreen Modal
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Fullscreen Modal"
          fullScreen
          actions={[
            {
              label: 'Close',
              onClick: () => setOpen(false),
              variant: 'contained',
            },
          ]}
        >
          <Box sx={{ py: 3 }}>
            <Typography variant="h5" gutterBottom>
              Full Screen Content
            </Typography>
            <Typography paragraph>
              This modal takes up the entire screen, useful for complex forms or
              detailed content.
            </Typography>
            {[...Array(10)].map((_, i) => (
              <Typography key={i} paragraph>
                Content section {i + 1}: Lorem ipsum dolor sit amet, consectetur
                adipiscing elit.
              </Typography>
            ))}
          </Box>
        </Modal>
      </Box>
    );
  },
};

/**
 * 供使用者輸入的表單對話框
 */
export const FormDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 2000);
    };

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Add New User
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Add New User"
          description="Please fill in the user information below."
          maxWidth="sm"
          loading={loading}
          actions={[
            {
              label: 'Cancel',
              onClick: () => setOpen(false),
              variant: 'outlined',
              disabled: loading,
            },
            {
              label: 'Submit',
              onClick: handleSubmit,
              variant: 'contained',
              loading: loading,
            },
          ]}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Name" fullWidth required />
            <TextField label="Email" type="email" fullWidth required />
            <TextField label="Phone" fullWidth />
            <TextField
              label="Role"
              select
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="user">User</option>
              <option value="hq">HQ</option>
              <option value="manager">Manager</option>
            </TextField>
          </Box>
        </Modal>
      </Box>
    );
  },
};

/**
 * 含說明的確認對話框
 */
export const ConfirmDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="contained" color="error" onClick={() => setOpen(true)}>
          Delete Item
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm Delete"
          description="Are you sure you want to delete this item? This action cannot be undone."
          variant="confirm"
          maxWidth="xs"
          actions={[
            {
              label: 'Cancel',
              onClick: () => setOpen(false),
              variant: 'outlined',
            },
            {
              label: 'Delete',
              onClick: () => setOpen(false),
              variant: 'contained',
              color: 'error',
            },
          ]}
        />
      </Box>
    );
  },
};

/**
 * 警告警示對話框
 */
export const WarningAlert: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button
          variant="contained"
          color="warning"
          onClick={() => setOpen(true)}
        >
          Show Warning
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Warning"
          description="This action may have unintended consequences. Please review carefully before proceeding."
          variant="warning"
          maxWidth="xs"
          actions={[
            {
              label: 'Cancel',
              onClick: () => setOpen(false),
              variant: 'outlined',
            },
            {
              label: 'Proceed',
              onClick: () => setOpen(false),
              variant: 'contained',
              color: 'warning',
            },
          ]}
        />
      </Box>
    );
  },
};

/**
 * 錯誤警示對話框
 */
export const ErrorAlert: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="contained" color="error" onClick={() => setOpen(true)}>
          Show Error
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Error"
          description="An error occurred while processing your request. Please try again later."
          variant="error"
          maxWidth="xs"
          actions={[
            {
              label: 'Close',
              onClick: () => setOpen(false),
              variant: 'contained',
              color: 'error',
            },
          ]}
        />
      </Box>
    );
  },
};

/**
 * 資訊警示對話框
 */
export const InfoAlert: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="contained" color="info" onClick={() => setOpen(true)}>
          Show Info
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Information"
          description="Your account has been successfully updated. The changes will take effect immediately."
          variant="info"
          maxWidth="xs"
          actions={[
            {
              label: 'Got it',
              onClick: () => setOpen(false),
              variant: 'contained',
              color: 'info',
            },
          ]}
        />
      </Box>
    );
  },
};

/**
 * 成功警示對話框
 */
export const SuccessAlert: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button
          variant="contained"
          color="success"
          onClick={() => setOpen(true)}
        >
          Show Success
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Success"
          description="Your changes have been saved successfully!"
          variant="success"
          maxWidth="xs"
          actions={[
            {
              label: 'Great!',
              onClick: () => setOpen(false),
              variant: 'contained',
              color: 'success',
            },
          ]}
        />
      </Box>
    );
  },
};

/**
 * 可捲動內容的 modal
 */
export const ScrollableContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Scrollable Modal
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Terms and Conditions"
          maxWidth="md"
          scroll="paper"
          dividers
          actions={[
            {
              label: 'Decline',
              onClick: () => setOpen(false),
              variant: 'outlined',
            },
            {
              label: 'Accept',
              onClick: () => setOpen(false),
              variant: 'contained',
            },
          ]}
        >
          <Typography paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </Typography>
          {[...Array(20)].map((_, i) => (
            <Typography key={i} paragraph>
              Section {i + 1}: Lorem ipsum dolor sit amet, consectetur
              adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Duis aute irure dolor in reprehenderit in
              voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </Typography>
          ))}
        </Modal>
      </Box>
    );
  },
};

/**
 * 含列表內容的 modal
 */
export const WithListContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);

    const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

    const handleToggle = (value: string) => {
      const currentIndex = selected.indexOf(value);
      const newSelected = [...selected];

      if (currentIndex === -1) {
        newSelected.push(value);
      } else {
        newSelected.splice(currentIndex, 1);
      }

      setSelected(newSelected);
    };

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Select Items
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Select Items"
          description="Choose one or more items from the list below."
          maxWidth="sm"
          actions={[
            {
              label: 'Cancel',
              onClick: () => setOpen(false),
              variant: 'outlined',
            },
            {
              label: `Select (${selected.length})`,
              onClick: () => setOpen(false),
              variant: 'contained',
              disabled: selected.length === 0,
            },
          ]}
        >
          <List>
            {items.map((item) => (
              <ListItem key={item} dense>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selected.indexOf(item) !== -1}
                      onChange={() => handleToggle(item)}
                    />
                  }
                  label={item}
                />
              </ListItem>
            ))}
          </List>
        </Modal>
      </Box>
    );
  },
};

/**
 * 含單選按鈕的 modal
 */
export const WithRadioButtons: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('option1');

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Choose Option
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Select an Option"
          maxWidth="xs"
          actions={[
            {
              label: 'Cancel',
              onClick: () => setOpen(false),
              variant: 'outlined',
            },
            {
              label: 'Confirm',
              onClick: () => setOpen(false),
              variant: 'contained',
            },
          ]}
        >
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Please select one option:</FormLabel>
            <RadioGroup
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <FormControlLabel
                value="option1"
                control={<Radio />}
                label="Option 1"
              />
              <FormControlLabel
                value="option2"
                control={<Radio />}
                label="Option 2"
              />
              <FormControlLabel
                value="option3"
                control={<Radio />}
                label="Option 3"
              />
            </RadioGroup>
          </FormControl>
        </Modal>
      </Box>
    );
  },
};

/**
 * 不含關閉按鈕的 modal
 */
export const NoCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Modal (No Close Button)
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="No Close Button"
          description="This modal doesn't have a close button in the title. You must use the action buttons."
          showCloseButton={false}
          disableBackdropClick
          disableEscapeKeyDown
          maxWidth="xs"
          actions={[
            {
              label: 'Cancel',
              onClick: () => setOpen(false),
              variant: 'outlined',
            },
            {
              label: 'Confirm',
              onClick: () => setOpen(false),
              variant: 'contained',
            },
          ]}
        />
      </Box>
    );
  },
};

/**
 * 實際範例：含連帶影響的刪除確認
 */
export const DeleteConfirmationExample: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [deleteRelated, setDeleteRelated] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
        alert(`Deleted with related items: ${deleteRelated}`);
      }, 2000);
    };

    return (
      <Box>
        <Button variant="contained" color="error" onClick={() => setOpen(true)}>
          Delete Project
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Delete Project"
          variant="warning"
          maxWidth="sm"
          loading={loading}
          actions={[
            {
              label: 'Cancel',
              onClick: () => setOpen(false),
              variant: 'outlined',
              disabled: loading,
            },
            {
              label: 'Delete',
              onClick: handleDelete,
              variant: 'contained',
              color: 'error',
              loading: loading,
            },
          ]}
        >
          <Box>
            <Typography paragraph>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The following items will be affected:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="• 15 tasks"
                  secondary="Will be permanently deleted"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• 8 team members"
                  secondary="Will lose access"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="• 23 files"
                  secondary="Will be moved to trash"
                />
              </ListItem>
            </List>
            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteRelated}
                  onChange={(e) => setDeleteRelated(e.target.checked)}
                />
              }
              label="Also delete related archived data"
            />
          </Box>
        </Modal>
      </Box>
    );
  },
};
