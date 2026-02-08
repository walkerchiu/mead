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
 * Card Component - Atomic Design: Molecule
 *
 * Card component，for displaying information cards with images, titles, content, and actions。
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Card
 *   title="Card Title"
 *   content="This is card content"
 * />
 *
 * // With image
 * <Card
 *   image="/image.jpg"
 *   title="Card Title"
 *   content="This is card content"
 * />
 *
 * // With action button
 * <Card
 *   title="Article title"
 *   content="Article summary..."
 *   actions={[
 *     { label: 'Read more', onClick: handleRead },
 *     { label: 'Share', variant: 'outlined', onClick: handleShare },
 *   ]}
 * />
 * ```
 */

export interface CardAction {
  /**
   * Buttontext
   */
  label: string;

  /**
   * callback on click
   */
  onClick?: () => void;

  /**
   * ButtonVariant
   */
  variant?: 'text' | 'outlined' | 'contained';

  /**
   * ButtonColor
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
   * Whether disabled
   */
  disabled?: boolean;
}

export interface CardProps {
  /**
   * card title
   */
  title?: string | React.ReactNode;

  /**
   * card subtitle
   */
  subheader?: string | React.ReactNode;

  /**
   * avatar
   */
  avatar?: React.ReactNode;

  /**
   * image URL
   */
  image?: string;

  /**
   * image height
   */
  imageHeight?: number;

  /**
   * image alt text
   */
  imageAlt?: string;

  /**
   * cardContent
   */
  content?: React.ReactNode;

  /**
   * Action buttoncolumnList
   */
  actions?: CardAction[];

  /**
   * Top right action button
   */
  headerAction?: React.ReactNode;

  /**
   * whether clickable
   */
  clickable?: boolean;

  /**
   * callback on click
   */
  onClick?: () => void;

  /**
   * elevation（Shadow）
   */
  elevation?: number;

  /**
   * Variant
   */
  variant?: 'elevation' | 'outlined';

  /**
   * custom style
   */
  sx?: SxProps<Theme>;
}

/**
 * Card component
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
