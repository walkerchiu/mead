import { forwardRef } from 'react';
import MuiCard from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material/styles';

/**
 * Card 組件 - Atomic Design: Molecule
 *
 * 卡片組件，用於顯示包含圖片、標題、內容和操作的資訊卡片。
 *
 * @example
 * ```tsx
 * // 基本用法
 * <Card
 *   title="卡片標題"
 *   content="這是卡片內容"
 * />
 *
 * // 帶圖片
 * <Card
 *   image="/image.jpg"
 *   title="卡片標題"
 *   content="這是卡片內容"
 * />
 *
 * // 帶操作按鈕
 * <Card
 *   title="文章標題"
 *   content="文章摘要..."
 *   actions={[
 *     { label: '閱讀更多', onClick: handleRead },
 *     { label: '分享', variant: 'outlined', onClick: handleShare },
 *   ]}
 * />
 * ```
 */

export interface CardAction {
  /**
   * 按鈕文字
   */
  label: string;

  /**
   * 點擊時的回調
   */
  onClick?: () => void;

  /**
   * 按鈕變體
   */
  variant?: 'text' | 'outlined' | 'contained';

  /**
   * 按鈕顏色
   */
  color?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';

  /**
   * 是否禁用
   */
  disabled?: boolean;
}

export interface CardProps {
  /**
   * 卡片標題
   */
  title?: string | React.ReactNode;

  /**
   * 卡片副標題
   */
  subheader?: string | React.ReactNode;

  /**
   * 頭像
   */
  avatar?: React.ReactNode;

  /**
   * 圖片 URL
   */
  image?: string;

  /**
   * 圖片高度
   */
  imageHeight?: number;

  /**
   * 圖片替代文字
   */
  imageAlt?: string;

  /**
   * 卡片內容
   */
  content?: React.ReactNode;

  /**
   * 操作按鈕列表
   */
  actions?: CardAction[];

  /**
   * 右上角操作按鈕
   */
  headerAction?: React.ReactNode;

  /**
   * 是否可點擊
   */
  clickable?: boolean;

  /**
   * 點擊時的回調
   */
  onClick?: () => void;

  /**
   * 提升程度（陰影）
   */
  elevation?: number;

  /**
   * 變體
   */
  variant?: 'elevation' | 'outlined';

  /**
   * 自訂樣式
   */
  sx?: SxProps<Theme>;
}

/**
 * Card 組件
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    title,
    subheader,
    avatar,
    image,
    imageHeight = 140,
    imageAlt,
    content,
    actions,
    headerAction,
    clickable = false,
    onClick,
    elevation = 1,
    variant = 'elevation',
    sx,
    ...props
  },
  ref,
) {
  return (
    <MuiCard
      ref={ref}
      elevation={variant === 'elevation' ? elevation : 0}
      variant={variant}
      onClick={clickable ? onClick : undefined}
      sx={{
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': clickable
          ? {
              boxShadow: 4,
            }
          : {},
        ...sx,
      }}
      {...props}
    >
      {(title || subheader || avatar || headerAction) && (
        <CardHeader
          avatar={avatar}
          action={headerAction}
          title={title}
          subheader={subheader}
        />
      )}
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={imageAlt || 'card image'}
        />
      )}
      {content && (
        <CardContent>
          {typeof content === 'string' ? (
            <Typography variant="body2" color="text.secondary">
              {content}
            </Typography>
          ) : (
            content
          )}
        </CardContent>
      )}
      {actions && actions.length > 0 && (
        <CardActions>
          {actions.map((action, index) => (
            <Button
              key={index}
              size="small"
              variant={action.variant || 'text'}
              color={action.color || 'primary'}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}
        </CardActions>
      )}
    </MuiCard>
  );
});

export default Card;
