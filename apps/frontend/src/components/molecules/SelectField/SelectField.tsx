import { forwardRef } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemIcon from '@mui/material/ListItemIcon';
import { FieldError } from 'react-hook-form';
import type { TextFieldProps } from '@mui/material/TextField';

/**
 * SelectField 組件 - Atomic Design: Molecule
 *
 * 結合 TextField Select 和錯誤處理的下拉選單組件。
 * 與 react-hook-form 完美集成，支援單選、多選、分組、圖示和搜尋功能。
 *
 * @example
 * ```tsx
 * // 單選
 * <SelectField
 *   label="國家"
 *   options={[
 *     { value: 'tw', label: '台灣' },
 *     { value: 'us', label: '美國' },
 *   ]}
 *   {...register('country')}
 *   error={errors.country}
 * />
 *
 * // 多選
 * <SelectField
 *   label="興趣"
 *   multiple
 *   options={[
 *     { value: 'music', label: '音樂' },
 *     { value: 'sports', label: '運動' },
 *   ]}
 *   {...register('interests')}
 *   error={errors.interests}
 * />
 *
 * // 分組選項
 * <SelectField
 *   label="城市"
 *   options={[
 *     { group: '北部', value: 'taipei', label: '台北' },
 *     { group: '北部', value: 'taoyuan', label: '桃園' },
 *     { group: '南部', value: 'kaohsiung', label: '高雄' },
 *   ]}
 * />
 *
 * // 帶圖示的選項
 * <SelectField
 *   label="天氣"
 *   options={[
 *     { value: 'sunny', label: '晴天', icon: <Icon>☀️</Icon> },
 *     { value: 'rainy', label: '下雨', icon: <Icon>🌧️</Icon> },
 *   ]}
 * />
 *
 * // 可搜尋選單
 * <SelectField
 *   label="國家"
 *   searchable
 *   options={countryOptions}
 *   placeholder="搜尋國家"
 * />
 *
 * // 完整功能（搜尋 + 分組 + 圖示 + 多選）
 * <SelectField
 *   label="活動"
 *   searchable
 *   multiple
 *   options={[
 *     { group: '戶外', value: 'hiking', label: '登山', icon: <Icon>🥾</Icon> },
 *     { group: '室內', value: 'reading', label: '閱讀', icon: <Icon>📖</Icon> },
 *   ]}
 * />
 * ```
 */

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  /**
   * 選項圖示（支援 emoji、Icon 組件或任何 ReactNode）
   */
  icon?: React.ReactNode;
}

export interface SelectFieldProps extends Omit<
  TextFieldProps,
  'error' | 'helperText' | 'select'
> {
  /**
   * 選項列表
   */
  options: SelectOption[];

  /**
   * 欄位錯誤（來自 react-hook-form）
   */
  error?: FieldError | string;

  /**
   * 輔助文字（非錯誤狀態時顯示）
   */
  helperText?: string;

  /**
   * 是否多選
   */
  multiple?: boolean;

  /**
   * 多選時是否顯示為 Chips
   */
  renderChips?: boolean;

  /**
   * 多選時是否顯示 checkbox
   */
  showCheckbox?: boolean;

  /**
   * 空值時的提示文字
   */
  placeholder?: string;

  /**
   * 是否啟用搜尋功能（使用 Autocomplete）
   */
  searchable?: boolean;

  /**
   * 搜尋時無結果的提示文字
   */
  noOptionsText?: string;
}

/**
 * SelectField 組件
 *
 * 處理 react-hook-form 的 error 物件，
 * 自動提取錯誤訊息並顯示
 */
export const SelectField = forwardRef<HTMLDivElement, SelectFieldProps>(
  function SelectField(
    {
      options,
      error,
      helperText,
      multiple = false,
      renderChips = true,
      showCheckbox = true,
      placeholder,
      searchable = false,
      noOptionsText = '沒有選項',
      value,
      ...props
    },
    ref,
  ) {
    // 處理錯誤訊息
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = Boolean(errorMessage);

    // 如果啟用搜尋功能，使用 Autocomplete
    if (searchable) {
      return (
        <Autocomplete
          ref={ref}
          options={options}
          value={
            multiple
              ? options.filter(
                  (opt) => Array.isArray(value) && value.includes(opt.value),
                )
              : options.find((opt) => opt.value === value) || null
          }
          onChange={(_, newValue) => {
            if (multiple) {
              const values = Array.isArray(newValue)
                ? newValue.map((opt) => opt.value)
                : [];
              props.onChange?.({
                target: { value: values, name: props.name },
              } as unknown as React.ChangeEvent<HTMLInputElement>);
            } else {
              const val = newValue ? (newValue as SelectOption).value : '';
              props.onChange?.({
                target: { value: val, name: props.name },
              } as unknown as React.ChangeEvent<HTMLInputElement>);
            }
          }}
          multiple={multiple}
          disableCloseOnSelect={multiple}
          getOptionLabel={(option) => option.label}
          getOptionDisabled={(option) => option.disabled || false}
          groupBy={(option) => option.group || ''}
          isOptionEqualToValue={(option, val) => option.value === val.value}
          noOptionsText={noOptionsText}
          renderInput={(params) => (
            <TextField
              {...params}
              label={props.label}
              placeholder={placeholder}
              error={hasError}
              helperText={errorMessage || helperText}
              required={props.required}
              disabled={props.disabled}
              variant={props.variant}
              size={props.size}
              fullWidth={props.fullWidth}
              InputLabelProps={{
                ...params.InputLabelProps,
                ...props.InputLabelProps,
              }}
            />
          )}
          renderOption={(renderProps, option, { selected }) => {
            const { key, ...otherProps } = renderProps;
            return (
              <li key={key} {...otherProps}>
                {multiple && showCheckbox && (
                  <Checkbox checked={selected} sx={{ mr: 1 }} />
                )}
                {option.icon && (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {option.icon}
                  </Box>
                )}
                <Box>{option.label}</Box>
              </li>
            );
          }}
          renderTags={
            renderChips
              ? (tagValue, getTagProps) =>
                  tagValue.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option.label}
                        size="small"
                        {...tagProps}
                      />
                    );
                  })
              : undefined
          }
          disabled={props.disabled}
          fullWidth={props.fullWidth}
          sx={props.sx}
        />
      );
    }

    // 將選項按 group 分組
    const groupedOptions = options.reduce(
      (acc, option) => {
        const group = option.group || '';
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(option);
        return acc;
      },
      {} as Record<string, SelectOption[]>,
    );

    const hasGroups =
      Object.keys(groupedOptions).filter((key) => key !== '').length > 0;

    // 渲染選項
    const renderOptions = () => {
      if (hasGroups) {
        // 有分組的選項
        return Object.entries(groupedOptions)
          .map(([group, groupOptions]) => {
            if (group === '') {
              return groupOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {multiple && showCheckbox && (
                    <Checkbox
                      checked={
                        Array.isArray(value) && value.includes(option.value)
                      }
                    />
                  )}
                  {option.icon && (
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {option.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText primary={option.label} />
                </MenuItem>
              ));
            }

            return [
              <MenuItem
                key={`group-${group}`}
                disabled
                sx={{ fontWeight: 'bold', opacity: 0.6 }}
              >
                {group}
              </MenuItem>,
              ...groupOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  sx={{ pl: 4 }}
                >
                  {multiple && showCheckbox && (
                    <Checkbox
                      checked={
                        Array.isArray(value) && value.includes(option.value)
                      }
                    />
                  )}
                  {option.icon && (
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {option.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText primary={option.label} />
                </MenuItem>
              )),
            ];
          })
          .flat();
      }

      // 無分組的選項
      return options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {multiple && showCheckbox && (
            <Checkbox
              checked={Array.isArray(value) && value.includes(option.value)}
            />
          )}
          {option.icon && (
            <ListItemIcon sx={{ minWidth: 36 }}>{option.icon}</ListItemIcon>
          )}
          <ListItemText primary={option.label} />
        </MenuItem>
      ));
    };

    // 多選時的 renderValue
    const renderValue =
      multiple && renderChips
        ? (selected: unknown) => {
            const selectedArray = Array.isArray(selected) ? selected : [];
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedArray.map((val) => {
                  const option = options.find((opt) => opt.value === val);
                  return (
                    <Chip key={val} label={option?.label || val} size="small" />
                  );
                })}
              </Box>
            );
          }
        : undefined;

    return (
      <TextField
        ref={ref}
        select
        error={hasError}
        helperText={errorMessage || helperText}
        value={value ?? (multiple ? [] : '')}
        InputLabelProps={{
          shrink: placeholder ? true : undefined,
          ...props.InputLabelProps,
        }}
        SelectProps={{
          multiple,
          renderValue,
          displayEmpty: Boolean(placeholder),
          ...props.SelectProps,
        }}
        {...props}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {renderOptions()}
      </TextField>
    );
  },
);

export default SelectField;
