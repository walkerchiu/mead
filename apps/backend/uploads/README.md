# 上傳檔案目錄

此目錄用於暫存上傳的檔案。

## 注意事項

- ⚠️ 此目錄已加入 `.gitignore`,不會被版本控制
- 建議使用外部儲存服務（S3、SeaweedFS 等）
- 本地開發時檔案會儲存在此目錄
- 生產環境應使用雲端儲存，不依賴本地檔案系統

## 儲存配置

在 `.env` 檔案中設定:

```bash
# 儲存類型: local | seaweedfs | s3
STORAGE_TYPE=local

# 本地儲存路徑
UPLOAD_DIR=./uploads

# SeaweedFS 設定 (當 STORAGE_TYPE=seaweedfs)
SEAWEEDFS_MASTER=http://localhost:9333

# AWS S3 設定 (當 STORAGE_TYPE=s3)
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## 清理

定期清理舊檔案:

```bash
# 刪除 30 天前的檔案
find ./apps/backend/uploads -type f -mtime +30 -delete
```
