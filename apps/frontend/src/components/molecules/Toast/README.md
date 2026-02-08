# Toast 組件

全站統一的通知提示組件。

## 設計規範

- **位置**：畫面底部中間
- **成功**：綠色 (filled Alert)
- **錯誤**：紅色 (filled Alert)
- **警告**：橘色 (filled Alert)
- **資訊**：藍色 (filled Alert)
- **自動隱藏**：預設 6 秒
- **手機適配**：底部距離 80px（避免被底部導航遮擋）

## 使用方法

### 基本使用

```tsx
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/molecules';

function MyComponent() {
  const { toast, showSuccess, showError, showWarning, showInfo, hideToast } =
    useToast();

  const handleSuccess = () => {
    showSuccess('操作成功！');
  };

  const handleError = () => {
    showError('操作失敗！');
  };

  return (
    <>
      <button onClick={handleSuccess}>成功</button>
      <button onClick={handleError}>失敗</button>

      {/* 放在組件底部 */}
      <Toast toast={toast} onClose={hideToast} />
    </>
  );
}
```

### API

#### useToast Hook

```tsx
const {
  toast, // Toast 狀態
  showToast, // 自定義 Toast
  showSuccess, // 顯示成功訊息（綠色）
  showError, // 顯示錯誤訊息（紅色）
  showWarning, // 顯示警告訊息（橘色）
  showInfo, // 顯示資訊訊息（藍色）
  hideToast, // 關閉 Toast
} = useToast();
```

#### Toast Component Props

```tsx
interface ToastProps {
  toast: ToastState; // Toast 狀態
  onClose: () => void; // 關閉回調
  autoHideDuration?: number; // 自動隱藏時間（毫秒），預設 6000
}
```

## 範例

### 表單提交成功

```tsx
const handleSubmit = async () => {
  try {
    await submitForm();
    showSuccess('表單提交成功！');
  } catch (error) {
    showError(error.message || '提交失敗，請稍後再試');
  }
};
```

### API 調用錯誤

```tsx
const handleDelete = async (id: string) => {
  try {
    await deleteItem(id);
    showSuccess('刪除成功');
  } catch (error) {
    if (error.code === 'PERMISSION_DENIED') {
      showError('您沒有權限執行此操作');
    } else {
      showError('刪除失敗，請稍後再試');
    }
  }
};
```

### 警告提示

```tsx
const handleAction = () => {
  if (needsConfirmation) {
    showWarning('此操作無法撤銷，請謹慎操作');
  }
};
```

## 注意事項

1. **每個頁面只需要一個 Toast 組件**
2. **統一使用此組件，不要自己創建 Snackbar**
3. **錯誤訊息應該要清楚明確，讓用戶知道發生什麼問題**
4. **成功訊息應該要簡潔，確認操作已完成即可**
