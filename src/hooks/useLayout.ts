import { createContext, useContext } from "react";
import { LayoutType } from "@src/@types/theme";

export interface LayoutContextProps {
  type: LayoutType;
}

export const LayoutContext = createContext<LayoutContextProps | undefined>(
  undefined
);

const useLayout = (): LayoutContextProps => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};

export default useLayout;
