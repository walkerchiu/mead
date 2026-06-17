'use client';

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
  Skeleton,
  Chip,
  Tooltip,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import type { RoleFeatureRow } from '@/graphql/rbac';

export interface FeatureColumn {
  /** 功能 key（對應後端 featureKey） */
  key: string;
  /** 已 i18n 的功能顯示名稱 */
  label: string;
}

export interface FeatureMatrixProps {
  /** 角色列表（呈現為欄，X 軸）。 */
  rows: RoleFeatureRow[];
  /** 功能列表（呈現為列，Y 軸；順序即列順序）。 */
  features: FeatureColumn[];
  loading?: boolean;
  /**
   * 呼叫者自身最高 rank。rank 大於等於此值的角色（欄）不可編輯
   * （只能設定階層嚴格較低者）。HQ 呼叫者管理 customer 矩陣時可全編 → 傳 Number.POSITIVE_INFINITY。
   */
  callerRank: number;
  /** 呼叫者是否具備編輯權限（roles:manage）。否則整體唯讀。 */
  editable: boolean;
  /** 切換某角色對某功能的檢視／管理存取。 */
  onToggle: (
    roleId: string,
    featureKey: string,
    canRead: boolean,
    canWrite: boolean,
  ) => void;
}

/**
 * 功能權限矩陣：功能（列，Y 軸）× 角色（欄，X 軸），每個功能含「檢視 / 管理」兩子列。
 * HQ／customer scope 共用。
 *
 * - OWNER 永遠全開且鎖定（locked），不可調整。
 * - rank 階層：只能設定階層嚴格低於自身的角色；rank ≥ callerRank 的角色欄唯讀。
 * - 管理隱含檢視：勾「管理」自動勾「檢視」；取消「檢視」連帶取消「管理」。
 */
export function FeatureMatrix({
  rows,
  features,
  loading = false,
  callerRank,
  editable,
  onToggle,
}: FeatureMatrixProps) {
  const t = useTranslations('pages.hq.users.featureMatrix');

  if (loading) {
    return <Skeleton variant="rectangular" height={320} />;
  }

  const access = (role: RoleFeatureRow, key: string) =>
    role.features.find((f) => f.featureKey === key);

  const isRoleEditable = (role: RoleFeatureRow) =>
    editable && !role.locked && role.rank < callerRank;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label={t('ariaLabel')}>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2} sx={{ fontWeight: 600 }}>
              {t('featureColumn')}
            </TableCell>
            {rows.map((role) => (
              <TableCell
                key={role.roleId}
                align="center"
                sx={{ fontWeight: 600, borderLeft: 1, borderColor: 'divider' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.25,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {role.displayName}
                    </Typography>
                    {role.locked && (
                      <Tooltip title={t('lockedHint')}>
                        <LockIcon
                          fontSize="inherit"
                          sx={{ color: 'text.disabled' }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                  <Chip label={role.name} size="small" variant="outlined" />
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {features.map((f) => [
            // 檢視 子列
            <TableRow key={`${f.key}-read`} hover>
              <TableCell
                rowSpan={2}
                sx={{ fontWeight: 500, verticalAlign: 'middle' }}
              >
                {f.label}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>
                {t('view')}
              </TableCell>
              {rows.map((role) => {
                const a = access(role, f.key);
                const canRead = a?.canRead ?? false;
                const canWrite = a?.canWrite ?? false;
                return (
                  <TableCell
                    key={`${role.roleId}-${f.key}-read`}
                    align="center"
                    sx={{ borderLeft: 1, borderColor: 'divider' }}
                  >
                    <Checkbox
                      size="small"
                      checked={canRead}
                      disabled={!isRoleEditable(role)}
                      inputProps={{
                        'aria-label': `${role.displayName} ${f.label} ${t('view')}`,
                      }}
                      onChange={() =>
                        // 取消檢視 → 連帶取消管理；開檢視 → 管理維持原狀
                        onToggle(
                          role.roleId,
                          f.key,
                          !canRead,
                          !canRead ? canWrite : false,
                        )
                      }
                    />
                  </TableCell>
                );
              })}
            </TableRow>,
            // 管理 子列
            <TableRow key={`${f.key}-write`} hover>
              <TableCell sx={{ color: 'text.secondary' }}>
                {t('manage')}
              </TableCell>
              {rows.map((role) => {
                const a = access(role, f.key);
                const canRead = a?.canRead ?? false;
                const canWrite = a?.canWrite ?? false;
                return (
                  <TableCell
                    key={`${role.roleId}-${f.key}-write`}
                    align="center"
                    sx={{ borderLeft: 1, borderColor: 'divider' }}
                  >
                    <Checkbox
                      size="small"
                      checked={canWrite}
                      disabled={!isRoleEditable(role)}
                      inputProps={{
                        'aria-label': `${role.displayName} ${f.label} ${t('manage')}`,
                      }}
                      onChange={() =>
                        // 開管理 → 隱含開檢視
                        onToggle(
                          role.roleId,
                          f.key,
                          !canWrite ? true : canRead,
                          !canWrite,
                        )
                      }
                    />
                  </TableCell>
                );
              })}
            </TableRow>,
          ])}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
