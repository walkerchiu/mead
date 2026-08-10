import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  type ToneScale = {
    0: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };

  interface Palette {
    accent: PaletteColor;
  }

  interface PaletteOptions {
    accent?: PaletteColorOptions;
  }

  interface Color {
    950: string;
  }

  interface Palette {
    tones: {
      primary: ToneScale;
      secondary: ToneScale;
      accent: ToneScale;
      error: ToneScale;
      warning: ToneScale;
      info: ToneScale;
      success: ToneScale;
    };
  }

  interface PaletteOptions {
    tones?: {
      primary: ToneScale;
      secondary: ToneScale;
      accent: ToneScale;
      error: ToneScale;
      warning: ToneScale;
      info: ToneScale;
      success: ToneScale;
    };
  }

  type ButtonLayoutBase = {
    size?: number | string;
    borderRadius: number | string;
    paddingX?: number | string;
    paddingY?: number | string;
    height?: number | string;
    iconSpacing?: number | string;
  };

  type ButtonSizeOverrides = {
    small?: Partial<ButtonLayoutBase>;
    medium?: Partial<ButtonLayoutBase>;
    large?: Partial<ButtonLayoutBase>;
  };

  type ButtonLayoutTokens = ButtonLayoutBase & {
    sizes?: ButtonSizeOverrides;
  };

  type IconButtonLayoutTokens = {
    size?: number | string;
    borderRadius?: number | string;
    paddingX?: number | string;
    paddingY?: number | string;
    height?: number | string;
  };

  type SwitchSizeTokens = {
    width: number;
    height: number;
    padding: number;
    thumbSize: number;
    trackRadius: number;
  };

  type SwitchTokens = {
    sizes: {
      small: SwitchSizeTokens;
      medium: SwitchSizeTokens;
    };
    colors: {
      trackOff: string;
      trackOn: string;
      trackDisabled: string;
      thumb: string;
      thumbDisabled: string;
    };
  };

  type RadioSizeTokens = {
    size: number;
    dot: number;
    borderWidth: number;
  };

  type RadioTokens = {
    sizes: {
      large: RadioSizeTokens;
      medium: RadioSizeTokens;
      small: RadioSizeTokens;
    };
    colors: {
      unchecked: {
        border: string;
        bg: string;
        hoverBorder: string;
        hoverBg: string;
        pressedBorder: string;
        pressedBg: string;
        disabledBorder: string;
        disabledBg: string;
      };
      checked: {
        border: string;
        bg: string;
        dot: string;
        hoverBorder: string;
        hoverBg: string;
        hoverDot: string;
        pressedBorder: string;
        pressedBg: string;
        pressedDot: string;
        disabledBorder: string;
        disabledBg: string;
        disabledDot: string;
      };
    };
  };

  type TextFieldSizeTokens = {
    height: number;
    paddingX: number;
    borderRadius: number;
    fontSize: number;
    labelFontSize: number;
  };

  type TextFieldTokens = {
    sizes: {
      large: TextFieldSizeTokens;
      medium: TextFieldSizeTokens;
      small: TextFieldSizeTokens;
    };
    colors: {
      bg: string;
      hoverBg: string;
      focusBg: string;
      border: string;
      hoverBorder: string;
      pressedBorder: string;
      focusBorder: string;
      disabledBorder: string;
      disabledBg: string;
      text: string;
      disabledText: string;
      placeholder: string;
      label: string;
      focusLabel: string;
      disabledLabel: string;
      helper: string;
      errorBorder: string;
      errorBg: string;
      errorLabel: string;
      errorText: string;
    };
  };

  type SearchTokens = {
    sizes: {
      small: {
        height: number;
        paddingX: number;
        iconGap: number;
        iconSize: number;
        clearSize: number;
      };
      medium: {
        height: number;
        paddingX: number;
        iconGap: number;
        iconSize: number;
        clearSize: number;
      };
      large: {
        height: number;
        paddingX: number;
        iconGap: number;
        iconSize: number;
        clearSize: number;
      };
    };
    variants: {
      pill: {
        borderRadius: number;
      };
      rounded: {
        borderRadius: number;
      };
    };
    colors: {
      bg: string;
      border: string;
      hoverBorder: string;
      focusBorder: string;
      activeBorder: string;
      disabledBorder: string;
      disabledBg: string;
      text: string;
      placeholder: string;
      icon: string;
      clearBg: string;
      clearIcon: string;
    };
  };

  type NumberFieldTokens = {
    sizes: {
      medium: {
        height: number;
        borderRadius: number;
        paddingX: number;
        fontSize: number;
        unitWidth: number;
        stepperWidth: number;
        iconSize: number;
      };
      small: {
        height: number;
        borderRadius: number;
        paddingX: number;
        fontSize: number;
        unitWidth: number;
        stepperWidth: number;
        iconSize: number;
      };
    };
    colors: {
      bg: string;
      border: string;
      hoverBorder: string;
      focusBorder: string;
      text: string;
      placeholder: string;
      unitText: string;
      unitBg: string;
      stepper: string;
      disabledBg: string;
      disabledBorder: string;
      disabledText: string;
      disabledStepper: string;
    };
  };

  type SelectTokens = {
    sizes: {
      large: TextFieldSizeTokens;
      medium: TextFieldSizeTokens;
      small: TextFieldSizeTokens;
    };
    colors: {
      bg: string;
      hoverBg: string;
      focusBg: string;
      border: string;
      hoverBorder: string;
      focusBorder: string;
      pressedBorder: string;
      text: string;
      placeholder: string;
      label: string;
      focusLabel: string;
      icon: string;
      disabledBg: string;
      disabledBorder: string;
      disabledText: string;
      disabledIcon: string;
      errorBorder: string;
      errorLabel: string;
      errorText: string;
      helper: string;
      menuBg: string;
      menuBorder: string;
      menuShadow: string;
      optionText: string;
      optionHoverBg: string;
      optionSelectedBg: string;
      checkColor: string;
      checkboxBorder: string;
      checkboxBg: string;
      checkboxIndeterminate: string;
    };
  };

  type SegmentedControlTokens = {
    sizes: {
      medium: {
        height: number;
        borderRadius: number;
        paddingX: number;
        minItemWidth: number;
        iconSize: number;
        iconGap: number;
        fontSize: number;
        fontWeight: number;
      };
      small: {
        height: number;
        borderRadius: number;
        paddingX: number;
        minItemWidth: number;
        iconSize: number;
        iconGap: number;
        fontSize: number;
        fontWeight: number;
      };
    };
    colors: {
      bg: string;
      border: string;
      text: string;
      icon: string;
      hoverBg: string;
      activeBg: string;
      activeBorder: string;
      activeText: string;
      activeIcon: string;
      disabledBg: string;
      disabledBorder: string;
      disabledText: string;
      disabledIcon: string;
    };
  };

  type ChipSizeTokens = {
    height: number;
    paddingX: number;
    borderRadius: number;
    gap: number;
    fontSize: number;
    fontWeight: number;
    iconSize: number;
    iconContainer: number;
    dotSize: number;
  };

  type ChipVariantTokens = {
    bg: string;
    text: string;
    iconBg: string;
    iconColor: string;
  };

  type ChipTokens = {
    sizes: {
      small: ChipSizeTokens;
      medium: ChipSizeTokens;
      large: ChipSizeTokens;
    };
    variants: {
      success: ChipVariantTokens;
      warning: ChipVariantTokens;
      error: ChipVariantTokens;
      info: ChipVariantTokens;
      text: ChipVariantTokens;
      another: ChipVariantTokens;
    };
    disabled: ChipVariantTokens;
  };

  interface Palette {
    buttonTokens: {
      contained: ButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        text: string;
        disabledBg: string;
        disabledText: string;
      };
      outlined: ButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        text: string;
        disabledBorder: string;
        disabledText: string;
      };
      text: ButtonLayoutTokens & {
        text: string;
        hoverBg: string;
        pressedBg: string;
        disabledText: string;
      };
      elevated: ButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        text: string;
        disabledBg: string;
        disabledText: string;
        boxShadow: string;
      };
      tagContained: ButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        text: string;
        disabledBg: string;
        disabledText: string;
      };
      tagText: ButtonLayoutTokens & {
        text: string;
        hoverBg: string;
        pressedBg: string;
        disabledText: string;
      };
      iconGradient: ButtonLayoutTokens & {
        bg: string;
        boxShadow: string;
        hoverBg: string;
        pressedBg: string;
        disabledBg: string;
        disableBoxShadow: string;
        iconColor: string;
      };
    };
    iconButtonTokens: {
      default: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      tonal: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      outline: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledIcon: string;
      };
      toggle: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledIcon: string;
      };
    };
    actionButtonTokens: {
      default: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      defaultPillSm: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      defaultPill: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      standard: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      standardPillSm: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      standardPill: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      outline: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledBg: string;
        disabledIcon: string;
      };
      outlinePillSm: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledBg: string;
        disabledIcon: string;
      };
      outlinePill: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledBg: string;
        disabledIcon: string;
      };
    };
    switchTokens: SwitchTokens;
    radioTokens: RadioTokens;
    textFieldTokens: TextFieldTokens;
    searchTokens: SearchTokens;
    selectTokens: SelectTokens;
    chipTokens: ChipTokens;
  }

  interface PaletteOptions {
    buttonTokens?: {
      contained: ButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        text: string;
        disabledBg: string;
        disabledText: string;
      };
      outlined: ButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        text: string;
        disabledBorder: string;
        disabledText: string;
      };
      text: ButtonLayoutTokens & {
        text: string;
        hoverBg: string;
        pressedBg: string;
        disabledText: string;
      };
      elevated: ButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        text: string;
        disabledBg: string;
        disabledText: string;
        boxShadow: string;
      };
      tagContained: ButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        text: string;
        disabledBg: string;
        disabledText: string;
      };
      tagText: ButtonLayoutTokens & {
        text: string;
        hoverBg: string;
        pressedBg: string;
        disabledText: string;
      };
      iconGradient: ButtonLayoutTokens & {
        bg: string;
        boxShadow: string;
        hoverBg: string;
        pressedBg: string;
        disabledBg: string;
        disableBoxShadow: string;
        iconColor: string;
      };
    };
    iconButtonTokens?: {
      default: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      tonal: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      outline: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledIcon: string;
      };
      toggle: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledIcon: string;
      };
    };
    actionButtonTokens?: {
      default: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      defaultPillSm: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      defaultPill: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      standard: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      standardPillSm: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      standardPill: IconButtonLayoutTokens & {
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBg: string;
        disabledIcon: string;
      };
      outline: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledBg: string;
        disabledIcon: string;
      };
      outlinePillSm: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledBg: string;
        disabledIcon: string;
      };
      outlinePill: IconButtonLayoutTokens & {
        border: string;
        bg: string;
        hoverBg: string;
        pressedBg: string;
        icon: string;
        disabledBorder: string;
        disabledBg: string;
        disabledIcon: string;
      };
    };
    switchTokens?: SwitchTokens;
    radioTokens?: RadioTokens;
    textFieldTokens?: TextFieldTokens;
    searchTokens?: SearchTokens;
    selectTokens?: SelectTokens;
    chipTokens?: ChipTokens;
  }
}

declare module '@mui/material/styles/createPalette' {
  interface Color {
    950: string;
  }
}
