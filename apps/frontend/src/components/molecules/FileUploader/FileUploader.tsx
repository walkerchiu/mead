'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

interface FileUploaderProps {
  label: string;
  helperText?: string;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  required?: boolean;
  error?: boolean;
  errorText?: string;
}

export function FileUploader({
  label,
  helperText,
  files,
  onChange,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  required = false,
  error = false,
  errorText,
}: FileUploaderProps) {
  const t = useTranslations('components.fileUploader');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setUploadError(null);

      // 檢查檔案數量限制
      if (files.length + acceptedFiles.length > maxFiles) {
        setUploadError(t('maxFilesError', { max: maxFiles }));
        return;
      }

      // 檢查被拒絕的檔案
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles[0].errors.map((e: any) => {
          if (e.code === 'file-too-large') {
            return t('fileTooLargeError', { max: formatFileSize(maxSize) });
          }
          if (e.code === 'file-invalid-type') {
            return t('fileTypeError');
          }
          return e.message;
        });
        setUploadError(errors.join(', '));
        return;
      }

      // 轉換為 UploadedFile 格式，並處理相同檔名的情況
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      }));

      // 檢查是否有相同檔名的檔案，如果有則替換
      const updatedFiles = [...files];
      const duplicateNames: string[] = [];

      newFiles.forEach((newFile) => {
        const existingIndex = updatedFiles.findIndex(
          (f) => f.name === newFile.name,
        );
        if (existingIndex !== -1) {
          // 找到相同檔名，替換舊檔案
          updatedFiles[existingIndex] = newFile;
          duplicateNames.push(newFile.name);
        } else {
          // 新檔案，直接加入
          updatedFiles.push(newFile);
        }
      });

      // 如果有相同檔名，顯示警告訊息
      if (duplicateNames.length > 0) {
        setUploadError(
          t('duplicateFileWarning', {
            files: duplicateNames.join(', '),
            defaultValue: `已替換相同檔名的檔案: ${duplicateNames.join(', ')}`,
          }),
        );
      }

      onChange(updatedFiles);
    },
    [files, onChange, maxFiles, maxSize, t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === '*/*' ? undefined : { [accept]: [] },
    maxSize,
    multiple: maxFiles > 1,
  });

  const handleRemove = (fileId: string) => {
    onChange(files.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label}
        {required && <span style={{ color: 'red' }}> *</span>}
      </Typography>

      {helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 1 }}
        >
          {helperText}
        </Typography>
      )}

      {/* 上傳區域 */}
      {files.length < maxFiles && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            mb: 2,
            border: `2px dashed ${
              error ? 'error.main' : isDragActive ? 'primary.main' : 'grey.300'
            }`,
            bgcolor: isDragActive ? 'action.hover' : 'background.default',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main',
            },
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{ textAlign: 'center' }}>
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {isDragActive
                ? t('dropHere')
                : t('dragDrop', { max: maxFiles - files.length })}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {t('maxSize', { size: formatFileSize(maxSize) })}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* 錯誤訊息 */}
      {(uploadError || errorText) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError || errorText}
        </Alert>
      )}

      {/* 已上傳檔案列表 */}
      {files.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 2 }}>
          <List dense>
            {files.map((file, index) => (
              <ListItem
                key={file.id}
                divider={index < files.length - 1}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <AttachFileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
                {file.url && (
                  <Chip
                    label={t('uploaded')}
                    size="small"
                    color="success"
                    sx={{ mr: 1 }}
                  />
                )}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemove(file.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {files.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          {t('filesCount', { count: files.length, max: maxFiles })}
        </Typography>
      )}
    </Box>
  );
}
