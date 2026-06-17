import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { FeatureMatrix } from './FeatureMatrix';
import type { RoleFeatureRow } from '@/graphql/rbac';

// HQ scope 範例：4 個功能。
const HQ_FEATURES = [
  { key: 'user-management', label: '用戶管理' },
  { key: 'audit-logs', label: '稽核日誌' },
  { key: 'sessions', label: '會話管理' },
  { key: 'cron-jobs', label: '排程任務' },
];

const f = (key: string, r: boolean, w: boolean) => ({
  featureKey: key,
  canRead: r,
  canWrite: w,
});

const mockRows: RoleFeatureRow[] = [
  {
    roleId: 'r-owner',
    name: 'OWNER',
    displayName: '擁有者',
    rank: 5,
    locked: true,
    features: HQ_FEATURES.map((x) => f(x.key, true, true)),
  },
  {
    roleId: 'r-admin',
    name: 'ADMIN',
    displayName: '系統管理員',
    rank: 4,
    locked: false,
    features: HQ_FEATURES.map((x) => f(x.key, true, true)),
  },
  {
    roleId: 'r-manager',
    name: 'MANAGER',
    displayName: '管理者',
    rank: 3,
    locked: false,
    features: [
      f('user-management', true, true),
      f('audit-logs', true, false),
      f('sessions', true, true),
      f('cron-jobs', true, false),
    ],
  },
  {
    roleId: 'r-operator',
    name: 'OPERATOR',
    displayName: '操作者',
    rank: 2,
    locked: false,
    features: [
      f('user-management', true, true),
      f('audit-logs', true, false),
      f('sessions', true, false),
      f('cron-jobs', true, false),
    ],
  },
  {
    roleId: 'r-viewer',
    name: 'VIEWER',
    displayName: '檢視員',
    rank: 1,
    locked: false,
    features: HQ_FEATURES.map((x) => f(x.key, true, false)),
  },
];

const meta = {
  title: 'HQ Scope/Organisms/FeatureMatrix',
  component: FeatureMatrix,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '功能權限矩陣：角色（欄）× 功能（列，含檢視／管理兩格），HQ／customer scope 共用。OWNER 鎖定全開；只能設定階層較低的角色；管理隱含檢視。',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureMatrix>;

export default meta;
type Story = StoryObj<typeof meta>;

/** OWNER 視角（rank 5）：可編輯所有較低階角色，OWNER 自身鎖定。 */
export const AsOwner: Story = {
  args: {
    rows: mockRows,
    features: HQ_FEATURES,
    callerRank: 5,
    editable: true,
    onToggle: (roleId, featureKey, canRead, canWrite) =>
      console.log('toggle', { roleId, featureKey, canRead, canWrite }),
  },
};

/** ADMIN 視角（rank 4）：只能編輯 MANAGER 以下；OWNER/ADMIN 列唯讀。 */
export const AsAdmin: Story = {
  args: {
    rows: mockRows,
    features: HQ_FEATURES,
    callerRank: 4,
    editable: true,
    onToggle: (roleId, featureKey, canRead, canWrite) =>
      console.log('toggle', { roleId, featureKey, canRead, canWrite }),
  },
};

/** 無編輯權限（缺 roles:manage）：整體唯讀。 */
export const ReadOnly: Story = {
  args: {
    rows: mockRows,
    features: HQ_FEATURES,
    callerRank: 0,
    editable: false,
    onToggle: () => {},
  },
};

/** 互動範例：本地 state 反映 toggle，示範管理隱含檢視。 */
export const Interactive: Story = {
  render: (args) => {
    const [rows, setRows] = useState(mockRows);
    return (
      <FeatureMatrix
        {...args}
        rows={rows}
        onToggle={(roleId, featureKey, canRead, canWrite) =>
          setRows((prev) =>
            prev.map((r) =>
              r.roleId === roleId
                ? {
                    ...r,
                    features: r.features.map((ff) =>
                      ff.featureKey === featureKey
                        ? { ...ff, canRead, canWrite }
                        : ff,
                    ),
                  }
                : r,
            ),
          )
        }
      />
    );
  },
  args: {
    rows: mockRows,
    features: HQ_FEATURES,
    callerRank: 5,
    editable: true,
    onToggle: () => {},
  },
};
