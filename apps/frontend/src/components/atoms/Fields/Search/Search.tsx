import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import InputBase, { type InputBaseProps } from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getSearchStyles } from './searchStyles';

const StyledSearch = styled('div')<{
  'data-size'?: 'small' | 'medium' | 'large';
  'data-variant'?: 'pill' | 'rounded';
  'data-state'?: 'default' | 'hover' | 'focus' | 'active' | 'disabled';
}>(({ theme, ...props }) =>
  getSearchStyles({
    tokens: theme.palette.searchTokens,
    size: props['data-size'],
    variant: props['data-variant'],
    state: props['data-state'],
  }),
);

export interface SearchProps extends Omit<
  InputBaseProps,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'size'
> {
  size?: 'small' | 'medium' | 'large';
  variant?: 'pill' | 'rounded';
  state?: 'default' | 'hover' | 'focus' | 'active' | 'disabled';
  value: string;
  onChange: InputBaseProps['onChange'];
  onClear?: () => void;
  placeholder?: string;
}

export function Search({
  value,
  onChange,
  onClear,
  size = 'medium',
  variant = 'pill',
  state = 'default',
  disabled,
  placeholder = 'Search keyword',
  className: classNameProp,
  ...props
}: SearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const computedState = disabled
    ? 'disabled'
    : state !== 'default'
      ? state
      : value
        ? 'active'
        : isFocused
          ? 'focus'
          : 'default';

  const containerClassName = useMemo(() => {
    const classes = [] as string[];
    if (classNameProp) classes.unshift(classNameProp);
    return classes.join(' ');
  }, [classNameProp]);

  useEffect(() => {
    if (disabled && inputRef.current) {
      inputRef.current.blur();
    }
  }, [disabled]);

  const handleClear = () => {
    if (disabled) return;
    onClear?.();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <StyledSearch
      className={containerClassName}
      data-size={size}
      data-variant={variant}
      data-state={computedState}
    >
      <InputBase
        {...props}
        inputRef={inputRef}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        type="text"
        placeholder={placeholder}
        className="Search-inputRoot"
        inputProps={{
          'aria-label': 'search',
          className: 'Search-input',
        }}
      />
      {value && !disabled ? (
        <button
          type="button"
          className="Search-clear"
          aria-label="clear search"
          onClick={handleClear}
          disabled={disabled}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </button>
      ) : value && disabled ? (
        <span className="Search-clearPlaceholder" aria-hidden="true" />
      ) : null}
      <SearchIcon className="Search-icon" />
    </StyledSearch>
  );
}

export default Search;
