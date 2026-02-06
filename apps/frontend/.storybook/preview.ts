import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          // 1. 設計系統基礎（最優先）
          'Design System',
          [
            'Colors', // 顏色系統
            'Typography', // 字體排版
          ],

          // 2. Atoms - 原子組件（最小單位）
          'Atoms',
          [
            // 基礎輸入
            'Button', // 按鈕
            'TextField', // 文字輸入
            'CodeInput', // 驗證碼輸入
            'Switch', // 開關
            'Slider', // 滑塊

            // 視覺展示
            'Avatar', // 頭像
            'Badge', // 徽章
            'Icon', // 圖示
            'Progress', // 進度條
            'Divider', // 分隔線
            'Skeleton', // 骨架屏
          ],

          // 3. Molecules - 分子組件（組合型）
          'Molecules',
          [
            // 表單組件
            'FormField', // 表單欄位
            'PasswordField', // 密碼欄位
            'SelectField', // 選擇欄位
            'CheckboxGroup', // 多選組
            'RadioGroup', // 單選組

            // 反饋組件
            'ErrorDisplay', // 錯誤顯示
            'AlertMessage', // 警告訊息
            'SnackbarWithProgress', // 進度通知

            // 導航組件
            'Tabs', // 標籤頁
            'Stepper', // 步驟條
            'Pagination', // 分頁
            'LanguageSwitcher', // 語言切換
            'SettingsMenu', // 設定選單

            // 資料展示
            'Card', // 卡片
            'DataTable', // 資料表格
            'DataList', // 資料列表
            'Accordion', // 手風琴
          ],

          // 4. Organisms - 有機組件（複雜組合）
          'Organisms',
          [
            // 導航結構
            'MainAppBar', // 主導航列
            'Sidebar', // 側邊欄
            'Drawer', // 抽屜

            // 覆蓋層
            'Modal', // 模態框

            // 表單組合
            'LoginForm', // 登入表單
            'ForgotPasswordForm', // 忘記密碼表單
            'ResetPasswordForm', // 重設密碼表單
            'TwoFactorForm', // 雙因素認證表單
          ],

          // 5. Templates - 模板（頁面骨架）
          'Templates',
          [
            'AuthLayout', // 認證佈局
          ],

          // 6. Pages - 完整頁面
          'Pages',
          [
            'LoginPage', // 登入頁
            'ForgotPasswordPage', // 忘記密碼頁
            'ResetPasswordPage', // 重設密碼頁
            'LoginPageWithMSW', // 登入頁（帶模擬）
          ],

          // 7. Examples - 範例與測試
          'Example',
          ['Apollo + MSW Test'],
        ],
      },
    },
  },
};

export default preview;
