import { forwardRef } from 'react';
import { TextField } from '@/components/atoms';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemIcon from '@mui/material/ListItemIcon';
import { FieldError } from 'react-hook-form';
import type { TextFieldProps } from '@/components/atoms';

/**
 * SelectField Component - Atomic Design: Molecule
 *
 * Dropdown select component combining TextField Select and error handling。
 * Perfect integration with react-hook-form, supports single select, multi-select, grouping, icon and search featuress。
 *
 * @example
 * ```tsx
 * // Single select
 * <SelectField
 *   label="Country"
 *   options={[
 *     { value: 'tw', label: 'Taiwan' },
 *     { value: 'us', label: 'USA' },
 *   ]}
 *   {...register('country')}
 *   error={errors.country}
 * />
 *
 * // multi-select
 * <SelectField
 *   label="Interests"
 *   multiple
 *   options={[
 *     { value: 'music', label: 'Music' },
 *     { value: 'sports', label: 'Sports' },
 *   ]}
 *   {...register('interests')}
 *   error={errors.interests}
 * />
 *
 * // grouping options
 * <SelectField
 *   label="City"
 *   options={[
 *     { group: 'North', value: 'taipei', label: 'Taipei' },
 *     { group: 'North', value: 'taoyuan', label: 'Taoyuan' },
 *     { group: 'South', value: 'kaohsiung', label: 'HighXiong' },
 *   ]}
 * />
 *
 * // options with icon
 * <SelectField
 *   label="Weather"
 *   options={[
 *     { value: 'sunny', label: 'Sunny', icon: <icon>☀️</icon> },
 *     { value: 'rainy', label: 'Rainy', icon: <icon>🌧️</icon> },
 *   ]}
 * />
 *
 * // cansearchmenu
 * <SelectField
 *   label="Country"
 *   searchable
 *   options={countryOptions}
 *   placeholder="search countries"
 * />
 *
 * // full features (search + grouping + icon + multi-select)
 * <SelectField
 *   label="active"
 *   searchable
 *   multiple
 *   options={[
 *     { group: 'Outdoor', value: 'hiking', label: 'Hiking', icon: <icon>🥾</icon> },
 *     { group: 'Indoor', value: 'reading', label: 'Reading', icon: <icon>📖</icon> },
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
   * optionsicon（supports emoji、icon componentorany ReactNode）
   */
  icon?: React.ReactNode;
}

export interface SelectFieldProps extends Omit<
  TextFieldProps,
  'error' | 'helperText' | 'select' | 'type' | 'variant'
> {
  /**
   * Option items list
   */
  options: SelectOption[];

  /**
   * Field error（from react-hook-form）
   */
  error?: FieldError | string;

  /**
   * helper text（displayed in non-error state）
   */
  helperText?: string;

  /**
   * whethermulti-select
   */
  multiple?: boolean;

  /**
   * whether to show as chips in multi-select
   */
  renderChips?: boolean;

  /**
   * whether to show in multi-select checkbox
   */
  showCheckbox?: boolean;

  /**
   * placeholder text when empty
   */
  placeholder?: string;

  /**
   * whetheractivesearchFeatures（use Autocomplete）
   */
  searchable?: boolean;

  /**
   * searchWhenno results messagetext
   */
  noOptionsText?: string;

  /**
   * Input variant (always 'outlined' for consistency)
   */
  variant?: 'outlined';
}

/**
 * SelectField component
 *
 * handle react-hook-form  error object，
 * autoextractError messageanddisplay
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
      noOptionsText = 'nooptions',
      value,
      ...props
    },
    ref,
  ) {
    // handleError message
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const hasError = Boolean(errorMessage);

    // ifactivesearchFeatures，use Autocomplete
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
              variant="outlined"
              size={props.size}
              fullWidth={props.fullWidth}
              InputLabelProps={{
                ...params.InputLabelProps,
                shrink: true,
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

    // willoptionsby group Grouping
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

    // renderoptions
    const renderOptions = () => {
      if (hasGroups) {
        // hasGroupingoptions
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
                  {option.icon || (multiple && showCheckbox) ? (
                    <ListItemText primary={option.label} />
                  ) : (
                    option.label
                  )}
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
                  {option.icon || (multiple && showCheckbox) ? (
                    <ListItemText primary={option.label} />
                  ) : (
                    option.label
                  )}
                </MenuItem>
              )),
            ];
          })
          .flat();
      }

      // noGroupingoptions
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
          {option.icon || (multiple && showCheckbox) ? (
            <ListItemText primary={option.label} />
          ) : (
            option.label
          )}
        </MenuItem>
      ));
    };

    // multi-selectWhen renderValue
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

    // Check if there's an empty value option in options (like "All")
    const hasEmptyValueOption = options.some((opt) => opt.value === '');
    const hasValue = value !== undefined && value !== null;
    // Should shrink if: has placeholder, or has a selected value/defaultValue (including empty string option)
    const shouldShrink =
      Boolean(placeholder) ||
      Boolean(value) ||
      Boolean(props.defaultValue) ||
      hasEmptyValueOption;
    // Should display empty if: has placeholder, or has an empty value option
    const shouldDisplayEmpty = Boolean(placeholder) || hasEmptyValueOption;

    // Only pass value prop when explicitly provided, otherwise let defaultValue work (uncontrolled)
    const valueProps = hasValue
      ? { value: multiple && !Array.isArray(value) ? [value] : value }
      : {};

    return (
      <TextField
        ref={ref}
        select
        error={hasError}
        helperText={errorMessage || helperText}
        {...valueProps}
        variant="outlined"
        slotProps={{
          inputLabel: () => ({
            shrink: shouldShrink,
          }),
        }}
        SelectProps={{
          multiple,
          renderValue,
          displayEmpty: shouldDisplayEmpty,
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
