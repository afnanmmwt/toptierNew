import { THEME_ENUM } from "@src/constants/theme.constant";
import { Direction, Mode, LayoutType } from "@src/@types/theme";

export type ThemeConfig = {
  direction: Direction;
  mode: Mode;
  layout: LayoutType;
};

/**
 * Since some configurations need to be match with specific themes,
 * we recommend to use the configuration that generated from demo.
 */
export const themeConfig: ThemeConfig = {
  direction: THEME_ENUM.DIR_LTR,
  mode: THEME_ENUM.MODE_LIGHT,
  layout: THEME_ENUM.LAYOUT_DEFAULT,
};
