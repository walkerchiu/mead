'use client';

import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Button,
} from '@mui/material';
import {
  Key as KeyIcon,
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout';
import { PageHeader, FormField } from '@/components/molecules';
import { usePersonalAccessTokens } from '@/hooks/usePersonalAccessTokens';
import { getErrorMessage } from '@/lib/error-utils';
import type { PersonalAccessToken } from '@/graphql/personal-access-tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date();
}

function TokenStatusChip({
  token,
  t,
}: {
  token: PersonalAccessToken;
  t: (key: string) => string;
}) {
  if (token.revokedAt) {
    return <Chip label={t('status.revoked')} color="error" size="small" />;
  }
  if (isExpired(token.expiresAt)) {
    return <Chip label={t('status.expired')} color="warning" size="small" />;
  }
  return <Chip label={t('status.active')} color="success" size="small" />;
}

function TokensSettingsPageContent() {
  const { enqueueSnackbar } = useSnackbar();
  const t = useTranslations('pages.settings.tokens');
  const tc = useTranslations('common');

  const { tokens, loading, createToken, creating, revokeToken, revoking } =
    usePersonalAccessTokens();

  // 建立 Token 對話框
  const [createOpen, setCreateOpen] = useState(false);

  // Token 顯示對話框
  const [showTokenOpen, setShowTokenOpen] = useState(false);
  const [createdToken, setCreatedToken] = useState('');
  const [copied, setCopied] = useState(false);

  // 撤銷確認對話框
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<PersonalAccessToken | null>(
    null,
  );

  // 建立表單 schema
  const createTokenSchema = z.object({
    name: z
      .string()
      .min(3, t('createDialog.nameMinLength'))
      .max(100, t('createDialog.nameMaxLength')),
    scopes: z.array(z.string()).min(1, t('createDialog.scopesRequired')),
    expiresInDays: z.number(),
  });

  type CreateTokenFormData = z.infer<typeof createTokenSchema>;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateTokenFormData>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      name: '',
      scopes: [],
      expiresInDays: 90,
    },
    mode: 'onChange',
  });

  // 模板未預設任何 PAT scope。請於 apps/backend/src/modules/personal-access-token/personal-access-token.service.ts
  // 的 ALLOWED_SCOPES 中新增您的 scope，再在此處同步加入選項。
  const scopeOptions: Array<{ value: string; label: string }> = [];

  const expireOptions = [
    { value: 30, label: t('expires.30days') },
    { value: 90, label: t('expires.90days') },
    { value: 180, label: t('expires.180days') },
  ];

  const handleCreate = async (data: CreateTokenFormData) => {
    try {
      const result = await createToken({
        name: data.name.trim(),
        scopes: data.scopes,
        expiresInDays: data.expiresInDays,
      });

      if (result) {
        setCreatedToken(result.token);
        setCreateOpen(false);
        setShowTokenOpen(true);
        reset();
        enqueueSnackbar(t('createSuccess'), { variant: 'success' });
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('createError'));
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(createdToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;

    try {
      await revokeToken(revokeTarget.id);
      enqueueSnackbar(t('revokeSuccess'), { variant: 'success' });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('revokeError'));
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }

    setRevokeOpen(false);
    setRevokeTarget(null);
  };

  const handleOpenCreate = () => {
    reset();
    setCreateOpen(true);
  };

  return (
    <AppShell>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <PageHeader
          breadcrumbs={[
            { label: tc('breadcrumb.dashboard'), href: '/dashboard' },
            { label: tc('breadcrumb.tokens') },
          ]}
          title={t('title')}
          description={t('description')}
          icon={<KeyIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />}
        />

        {/* Token List Card */}
        <Card elevation={2} sx={{ mt: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6">{t('listTitle')}</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                disabled={creating}
              >
                {t('createButton')}
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              {t('apiUsageHint')}
            </Alert>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('table.name')}</TableCell>
                    <TableCell>{t('table.token')}</TableCell>
                    <TableCell>{t('table.scopes')}</TableCell>
                    <TableCell>{t('table.lastUsed')}</TableCell>
                    <TableCell>{t('table.expires')}</TableCell>
                    <TableCell>{t('table.status')}</TableCell>
                    <TableCell>{t('table.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {tc('loading')}
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && tokens.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {t('emptyState')}
                      </TableCell>
                    </TableRow>
                  )}
                  {tokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell>{token.name}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          color="text.secondary"
                        >
                          {token.tokenPrefix}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {token.scopes.map((scope) => (
                          <Chip
                            key={scope}
                            label={scope}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        {token.lastUsedAt
                          ? formatDate(token.lastUsedAt)
                          : t('neverUsed')}
                      </TableCell>
                      <TableCell>{formatDate(token.expiresAt)}</TableCell>
                      <TableCell>
                        <TokenStatusChip token={token} t={t} />
                      </TableCell>
                      <TableCell>
                        {!token.revokedAt && !isExpired(token.expiresAt) && (
                          <Tooltip title={t('revokeButton')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setRevokeTarget(token);
                                setRevokeOpen(true);
                              }}
                              disabled={revoking}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* Create Token Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleSubmit(handleCreate)} noValidate>
          <DialogTitle>{t('createDialog.title')}</DialogTitle>
          <DialogContent>
            <FormField
              {...register('name')}
              margin="normal"
              required
              fullWidth
              label={t('createDialog.nameLabel')}
              placeholder={t('createDialog.namePlaceholder')}
              error={errors.name}
              helperText={errors.name?.message || t('createDialog.nameHelper')}
              inputProps={{ maxLength: 100 }}
              disabled={creating}
            />

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              {t('createDialog.scopesLabel')} *
            </Typography>
            <Controller
              name="scopes"
              control={control}
              render={({ field }) => (
                <FormControl error={!!errors.scopes} component="fieldset">
                  <FormGroup>
                    {scopeOptions.map((scope) => (
                      <FormControlLabel
                        key={scope.value}
                        control={
                          <Checkbox
                            checked={field.value.includes(scope.value)}
                            onChange={(e) => {
                              const newScopes = e.target.checked
                                ? [...field.value, scope.value]
                                : field.value.filter(
                                    (s: string) => s !== scope.value,
                                  );
                              field.onChange(newScopes);
                            }}
                            disabled={creating}
                          />
                        }
                        label={scope.label}
                      />
                    ))}
                  </FormGroup>
                  <FormHelperText>
                    {errors.scopes?.message || t('createDialog.scopesHelper')}
                  </FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="expiresInDays"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mt: 2 }} required>
                  <InputLabel>{t('createDialog.expiresLabel')}</InputLabel>
                  <Select
                    {...field}
                    label={t('createDialog.expiresLabel')}
                    disabled={creating}
                  >
                    {expireOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)} disabled={creating}>
              {tc('cancel')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isValid || creating}
            >
              {t('createDialog.submitButton')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Token Display Dialog */}
      <Dialog
        open={showTokenOpen}
        onClose={() => {
          setShowTokenOpen(false);
          setCreatedToken('');
          setCopied(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('tokenDialog.title')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('tokenDialog.warning')}
          </Alert>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'grey.50',
            }}
          >
            <Typography
              variant="body2"
              fontFamily="monospace"
              sx={{ wordBreak: 'break-all', mr: 1 }}
            >
              {createdToken}
            </Typography>
            <Tooltip
              title={copied ? t('tokenDialog.copied') : t('tokenDialog.copy')}
            >
              <IconButton onClick={handleCopy} size="small">
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>

          <Alert severity="info" sx={{ mt: 2 }}>
            {t('tokenDialog.usageExample')}
            <Typography
              component="pre"
              variant="body2"
              fontFamily="monospace"
              sx={{
                mt: 1,
                p: 1,
                bgcolor: 'grey.900',
                color: 'grey.100',
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.75rem',
              }}
            >
              {`curl ${API_URL}/api/your-endpoint \\
  -H "Authorization: Bearer ${createdToken || 'npt_xxx'}" \\
  -H "Content-Type: application/json"`}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setShowTokenOpen(false);
              setCreatedToken('');
              setCopied(false);
            }}
          >
            {t('tokenDialog.closeButton')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={revokeOpen}
        onClose={() => {
          setRevokeOpen(false);
          setRevokeTarget(null);
        }}
      >
        <DialogTitle>{t('revokeDialog.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('revokeDialog.message', { name: revokeTarget?.name || '' })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRevokeOpen(false);
              setRevokeTarget(null);
            }}
          >
            {tc('cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRevokeConfirm}
            disabled={revoking}
          >
            {t('revokeDialog.confirmButton')}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}

export default function TokensSettingsPage() {
  return (
    <ProtectedRoute>
      <TokensSettingsPageContent />
    </ProtectedRoute>
  );
}
