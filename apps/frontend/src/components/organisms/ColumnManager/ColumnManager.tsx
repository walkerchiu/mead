'use client';

import React from 'react';
import {
  Box,
  IconButton,
  Popover,
  MenuItem,
  ListItemText,
  Switch,
  Typography,
  Divider,
} from '@mui/material';
import {
  ViewColumn as ColumnIcon,
  RestartAlt as ResetIcon,
  KeyboardArrowUp as UpIcon,
  KeyboardArrowDown as DownIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/atoms';

interface ColumnManagerProps {
  columns: Array<{ id: string; visible: boolean }>;
  columnLabels: Record<string, string>;
  onToggle: (columnId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onReset: () => void;
  children?: React.ReactNode;
}

export function ColumnManager({
  columns,
  columnLabels,
  onToggle,
  onMove,
  onReset,
  children,
}: ColumnManagerProps) {
  const tc = useTranslations('common');
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // 如果有 children，用 children 包裹模式（右鍵選單），否則渲染按鈕
  if (children) {
    return (
      <Box
        onContextMenu={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('thead') || target.closest('th')) {
            e.preventDefault();
            setAnchorEl(e.currentTarget as HTMLElement);
          }
        }}
      >
        {children}
        <ColumnPopover
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          columns={columns}
          columnLabels={columnLabels}
          onToggle={onToggle}
          onMove={onMove}
          onReset={onReset}
        />
      </Box>
    );
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<ColumnIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        {tc('columnManager.title')}
      </Button>
      <ColumnPopover
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        columns={columns}
        columnLabels={columnLabels}
        onToggle={onToggle}
        onMove={onMove}
        onReset={onReset}
      />
    </>
  );
}

function ColumnPopover({
  anchorEl,
  open,
  onClose,
  columns,
  columnLabels,
  onToggle,
  onMove,
  onReset,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  columns: Array<{ id: string; visible: boolean }>;
  columnLabels: Record<string, string>;
  onToggle: (columnId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onReset: () => void;
}) {
  const tc = useTranslations('common');

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Box sx={{ width: 280 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
          }}
        >
          <Typography variant="subtitle2">
            {tc('columnManager.title')}
          </Typography>
          <Button size="small" onClick={onReset} startIcon={<ResetIcon />}>
            {tc('columnManager.reset')}
          </Button>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {columns.map((col, idx) => (
            <MenuItem
              key={col.id}
              dense
              sx={{ gap: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Switch
                size="small"
                checked={col.visible}
                onChange={() => onToggle(col.id)}
                sx={{ mr: 0.5 }}
              />
              <ListItemText
                primary={
                  <Typography variant="body2">
                    {columnLabels[col.id] || col.id}
                  </Typography>
                }
                sx={{ flex: 1 }}
              />
              <Box sx={{ display: 'flex', ml: 0.5 }}>
                <IconButton
                  size="small"
                  disabled={idx === 0}
                  onClick={() => onMove(idx, idx - 1)}
                  sx={{ p: 0.25 }}
                >
                  <UpIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={idx === columns.length - 1}
                  onClick={() => onMove(idx, idx + 1)}
                  sx={{ p: 0.25 }}
                >
                  <DownIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </MenuItem>
          ))}
        </Box>
      </Box>
    </Popover>
  );
}
