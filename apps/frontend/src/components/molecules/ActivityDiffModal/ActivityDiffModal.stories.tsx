import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button } from '@/components/atoms';
import { ActivityDiffModal } from './ActivityDiffModal';

/**
 * Demo 依照 Storybook 工具列 globals.locale 自動切換語系。
 * 共用 `preview.tsx` 的 `NextIntlClientProvider`，不在 Story 內自行包一層，
 * 否則會覆寫全域 locale 導致 EN 切換失效。
 */
function Demo(
  props: Omit<
    React.ComponentProps<typeof ActivityDiffModal>,
    'open' | 'onClose'
  >,
) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Diff Modal
      </Button>
      <ActivityDiffModal
        {...props}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const meta: Meta<typeof Demo> = {
  title: 'Shared/Molecules/ActivityDiffModal',
  component: Demo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Shared Diff Modal that opens when an activity log entry is clicked. Built on top of the shared `Modal` organism and used across all *EditHistory-driven activity feeds.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    fieldLabel: { control: 'text', description: 'Translated field label' },
    oldValue: { control: 'text', description: 'Value before the change' },
    newValue: { control: 'text', description: 'Value after the change' },
    actorName: { control: 'text', description: 'Actor display name' },
    timestamp: { control: 'date', description: 'When the change happened' },
    mode: {
      control: 'inline-radio',
      options: ['text', 'markdown'],
      description:
        'text = plain text; markdown = monospaced, preserves formatting',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Demo>;

export const ShortText: Story = {
  args: {
    fieldLabel: 'Title',
    oldValue: 'AI Voice Assistant Development Plan',
    newValue: 'AI Voice Assistant Development Plan (MVP)',
    actorName: 'Walker Chiu',
    timestamp: new Date('2026-04-14T13:52:00+08:00'),
    mode: 'text',
  },
};

export const LongMarkdown: Story = {
  args: {
    fieldLabel: 'Content',
    oldValue: `# Weekly Summary

- Finished login page redesign
- Discussed routing plan with PM`,
    newValue: `# Weekly Summary

- Finished login page redesign
- Completed forgot-password flow (with email notification)
- Discussed routing plan with PM
- **New**: PAT management page launched`,
    actorName: 'Kawuu Lin',
    timestamp: new Date('2026-04-14T09:15:00+08:00'),
    mode: 'markdown',
  },
};

export const DateChange: Story = {
  args: {
    fieldLabel: 'Due Date',
    oldValue: '2026-05-30',
    newValue: '2026-06-15',
    actorName: 'Ken Ho',
    timestamp: new Date('2026-04-13T17:20:00+08:00'),
    mode: 'text',
  },
};

export const FromEmpty: Story = {
  args: {
    fieldLabel: 'Work Location',
    oldValue: null,
    newValue: 'KAOHSIUNG',
    actorName: 'Jacky Chang',
    timestamp: new Date('2026-04-14T11:05:00+08:00'),
    mode: 'text',
  },
};

export const ToEmpty: Story = {
  args: {
    fieldLabel: 'Note',
    oldValue: 'Legal needs to confirm contract clauses',
    newValue: '',
    actorName: 'Jacky Chen',
    timestamp: new Date('2026-04-12T15:42:00+08:00'),
    mode: 'text',
  },
};
