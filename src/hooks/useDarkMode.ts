import { useEffect } from "react";
import { THEME_ENUM } from "@src/constants/theme.constant";
import type { Mode } from "@src/@types/theme";
import { useAppSelector, useAppDispatch } from "@lib/redux/store";
import { setMode } from "@lib/redux/base";

function useDarkMode(): [
  isEnabled: boolean,
  onModeChange: (mode: Mode) => void
] {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.root.mode);

  const { MODE_DARK, MODE_LIGHT } = THEME_ENUM;

  const isEnabled = mode === MODE_DARK;

  const onModeChange = (mode: Mode) => {
    dispatch(setMode(mode));
  };
  useEffect(() => {
    if (window === undefined) {
      return;
    }
    const root = window.document.documentElement;
    root.classList.remove(isEnabled ? MODE_LIGHT : MODE_DARK);
    root.classList.add(isEnabled ? MODE_DARK : MODE_LIGHT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

  return [isEnabled, onModeChange];
}

export default useDarkMode;
