import type { Meta, StoryObj } from '@storybook/nextjs';
import { NotificationItem } from './NotificationItem';
import { Box, List } from '@mui/material';

// Helper function to log actions
const logAction = (actionName: string) => () => {
  console.log(`[Storybook] ${actionName}`);
};

const meta = {
  title: 'Shared/Atoms/NotificationItem',
  component: NotificationItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['INFO', 'WARNING', 'SUCCESS', 'ERROR'],
      description: 'Notification type',
    },
    title: {
      control: 'text',
      description: 'Notification title',
    },
    message: {
      control: 'text',
      description: 'Notification message',
    },
    isRead: {
      control: 'boolean',
      description: 'Whether the notification has been read',
    },
    createdAt: {
      control: 'text',
      description: 'Creation timestamp (ISO string)',
    },
    showDelete: {
      control: 'boolean',
      description: 'Whether to show the delete button',
    },
    avatar: {
      control: 'text',
      description: 'Avatar URL (optional, replaces type icon)',
    },
  },
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default notification item with INFO type
 */
export const Default: Story = {
  args: {
    type: 'INFO',
    title: 'System Update',
    message: 'A new version of the application is available.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    showDelete: true,
    onClick: logAction('notification-clicked'),
    onDelete: logAction('notification-deleted'),
  },
  render: (args) => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem {...args} />
    </List>
  ),
};

/**
 * All notification types
 */
export const AllTypes: Story = {
  render: () => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem
        type="INFO"
        title="Information"
        message="This is an informational notification."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 2).toISOString()}
        onClick={logAction('info-clicked')}
        onDelete={logAction('info-deleted')}
      />
      <NotificationItem
        type="WARNING"
        title="Warning"
        message="This action requires your attention."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 10).toISOString()}
        onClick={logAction('warning-clicked')}
        onDelete={logAction('warning-deleted')}
      />
      <NotificationItem
        type="SUCCESS"
        title="Success"
        message="Your operation completed successfully."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 30).toISOString()}
        onClick={logAction('success-clicked')}
        onDelete={logAction('success-deleted')}
      />
      <NotificationItem
        type="ERROR"
        title="Error"
        message="An error occurred while processing your request."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 60).toISOString()}
        onClick={logAction('error-clicked')}
        onDelete={logAction('error-deleted')}
      />
    </List>
  ),
};

/**
 * Different time ranges
 */
export const TimeRanges: Story = {
  render: () => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem
        type="INFO"
        title="Just now"
        message="Created 30 seconds ago."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 30).toISOString()}
        onClick={logAction('30s-clicked')}
        onDelete={logAction('30s-deleted')}
      />
      <NotificationItem
        type="INFO"
        title="Few minutes ago"
        message="Created 5 minutes ago."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 5).toISOString()}
        onClick={logAction('5m-clicked')}
        onDelete={logAction('5m-deleted')}
      />
      <NotificationItem
        type="INFO"
        title="An hour ago"
        message="Created 1 hour ago."
        isRead={true}
        createdAt={new Date(Date.now() - 1000 * 60 * 60).toISOString()}
        onClick={logAction('1h-clicked')}
        onDelete={logAction('1h-deleted')}
      />
      <NotificationItem
        type="INFO"
        title="Yesterday"
        message="Created 1 day ago."
        isRead={true}
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()}
        onClick={logAction('1d-clicked')}
        onDelete={logAction('1d-deleted')}
      />
      <NotificationItem
        type="INFO"
        title="Last week"
        message="Created 7 days ago."
        isRead={true}
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()}
        onClick={logAction('7d-clicked')}
        onDelete={logAction('7d-deleted')}
      />
    </List>
  ),
};

/**
 * Read vs Unread states
 */
export const ReadStates: Story = {
  render: () => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem
        type="SUCCESS"
        title="Unread Notification"
        message="This notification has not been read yet. Notice the bold text and unread indicator."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 5).toISOString()}
        onClick={logAction('unread-clicked')}
        onDelete={logAction('unread-deleted')}
      />
      <NotificationItem
        type="SUCCESS"
        title="Read Notification"
        message="This notification has been read. The background and text weight are different."
        isRead={true}
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()}
        onClick={logAction('read-clicked')}
        onDelete={logAction('read-deleted')}
      />
    </List>
  ),
};

/**
 * With and without delete button
 */
export const DeleteButton: Story = {
  render: () => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem
        type="INFO"
        title="With Delete Button"
        message="This notification can be deleted by clicking the X button."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 15).toISOString()}
        showDelete={true}
        onClick={logAction('with-delete-clicked')}
        onDelete={logAction('with-delete-deleted')}
      />
      <NotificationItem
        type="INFO"
        title="Without Delete Button"
        message="This notification cannot be deleted from the UI."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 20).toISOString()}
        showDelete={false}
        onClick={logAction('without-delete-clicked')}
      />
    </List>
  ),
};

/**
 * Long content handling
 */
export const LongContent: Story = {
  render: () => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem
        type="WARNING"
        title="Very Long Notification Title That Might Wrap to Multiple Lines"
        message="This is a very long notification message that contains a lot of text to demonstrate how the component handles lengthy content. The message should wrap properly and maintain good readability even with extensive content."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 45).toISOString()}
        onClick={logAction('long-clicked')}
        onDelete={logAction('long-deleted')}
      />
    </List>
  ),
};

/**
 * Mixed notification list (realistic scenario)
 */
export const MixedList: Story = {
  render: () => (
    <Box sx={{ width: 400 }}>
      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        <NotificationItem
          type="ERROR"
          title="Payment Failed"
          message="Your payment could not be processed. Please update your payment method."
          isRead={false}
          createdAt={new Date(Date.now() - 1000 * 60 * 2).toISOString()}
          onClick={logAction('payment-clicked')}
          onDelete={logAction('payment-deleted')}
        />
        <NotificationItem
          type="SUCCESS"
          title="Profile Updated"
          message="Your profile information has been successfully updated."
          isRead={false}
          createdAt={new Date(Date.now() - 1000 * 60 * 15).toISOString()}
          onClick={logAction('profile-clicked')}
          onDelete={logAction('profile-deleted')}
        />
        <NotificationItem
          type="INFO"
          title="New Feature Available"
          message="Check out our new dark mode feature in settings."
          isRead={true}
          createdAt={new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()}
          onClick={logAction('feature-clicked')}
          onDelete={logAction('feature-deleted')}
        />
        <NotificationItem
          type="WARNING"
          title="Password Expiring Soon"
          message="Your password will expire in 7 days. Please change it soon."
          isRead={true}
          createdAt={new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()}
          onClick={logAction('password-clicked')}
          onDelete={logAction('password-deleted')}
        />
        <NotificationItem
          type="INFO"
          title="Welcome"
          message="Welcome to our platform! Get started by completing your profile."
          isRead={true}
          createdAt={new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 3,
          ).toISOString()}
          onClick={logAction('welcome-clicked')}
          onDelete={logAction('welcome-deleted')}
        />
      </List>
    </Box>
  ),
};

/**
 * Real-world examples
 */
export const RealWorldExamples: Story = {
  render: () => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem
        type="SUCCESS"
        title="Order Confirmed"
        message="Your order #12345 has been confirmed and will be shipped soon."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 5).toISOString()}
        onClick={logAction('order-clicked')}
        onDelete={logAction('order-deleted')}
      />
      <NotificationItem
        type="INFO"
        title="New Comment"
        message="John Doe commented on your post: 'Great work!'"
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 20).toISOString()}
        onClick={logAction('comment-clicked')}
        onDelete={logAction('comment-deleted')}
      />
      <NotificationItem
        type="WARNING"
        title="Storage Almost Full"
        message="You're using 95% of your storage space. Consider upgrading your plan."
        isRead={true}
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()}
        onClick={logAction('storage-clicked')}
        onDelete={logAction('storage-deleted')}
      />
      <NotificationItem
        type="ERROR"
        title="Backup Failed"
        message="The scheduled backup could not be completed. Please try again."
        isRead={true}
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()}
        onClick={logAction('backup-clicked')}
        onDelete={logAction('backup-deleted')}
      />
    </List>
  ),
};

/**
 * Without handlers (non-interactive)
 */
export const NonInteractive: Story = {
  render: () => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem
        type="INFO"
        title="Static Notification"
        message="This notification has no click or delete handlers."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 10).toISOString()}
        showDelete={false}
      />
    </List>
  ),
};

/**
 * With avatar (user-generated notifications)
 */
export const WithAvatar: Story = {
  render: () => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem
        type="INFO"
        title="John Smith mentioned you"
        message="John Smith mentioned you in a comment: 'Great work on the project!'"
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 5).toISOString()}
        avatar="https://i.pravatar.cc/150?img=12"
        onClick={logAction('mention-clicked')}
        onDelete={logAction('mention-deleted')}
      />
      <NotificationItem
        type="SUCCESS"
        title="Sarah Johnson approved your request"
        message="Your pull request #123 has been approved and merged."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 15).toISOString()}
        avatar="https://i.pravatar.cc/150?img=47"
        onClick={logAction('approval-clicked')}
        onDelete={logAction('approval-deleted')}
      />
      <NotificationItem
        type="INFO"
        title="Mike Chen assigned you a task"
        message="Mike Chen assigned you to 'Update user documentation'."
        isRead={true}
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()}
        avatar="https://i.pravatar.cc/150?img=33"
        onClick={logAction('assignment-clicked')}
        onDelete={logAction('assignment-deleted')}
      />
      <NotificationItem
        type="WARNING"
        title="HQ Alert"
        message="System maintenance scheduled for tomorrow at 2:00 AM."
        isRead={true}
        createdAt={new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()}
        avatar="https://i.pravatar.cc/150?img=68"
        onClick={logAction('hq-clicked')}
        onDelete={logAction('hq-deleted')}
      />
    </List>
  ),
};

/**
 * Mixed with and without avatars
 */
export const MixedAvatars: Story = {
  render: () => (
    <List sx={{ width: 400, bgcolor: 'background.paper' }}>
      <NotificationItem
        type="INFO"
        title="Emily Davis started following you"
        message="Emily Davis is now following your updates."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 3).toISOString()}
        avatar="https://i.pravatar.cc/150?img=25"
        onClick={logAction('follow-clicked')}
        onDelete={logAction('follow-deleted')}
      />
      <NotificationItem
        type="SUCCESS"
        title="Backup Completed"
        message="Your scheduled backup completed successfully."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 10).toISOString()}
        onClick={logAction('backup-completed-clicked')}
        onDelete={logAction('backup-completed-deleted')}
      />
      <NotificationItem
        type="WARNING"
        title="Tom Wilson requested access"
        message="Tom Wilson requested access to your private repository."
        isRead={false}
        createdAt={new Date(Date.now() - 1000 * 60 * 30).toISOString()}
        avatar="https://i.pravatar.cc/150?img=58"
        onClick={logAction('access-clicked')}
        onDelete={logAction('access-deleted')}
      />
      <NotificationItem
        type="ERROR"
        title="Security Alert"
        message="Unusual login activity detected from a new device."
        isRead={true}
        createdAt={new Date(Date.now() - 1000 * 60 * 60).toISOString()}
        onClick={logAction('security-clicked')}
        onDelete={logAction('security-deleted')}
      />
    </List>
  ),
};
