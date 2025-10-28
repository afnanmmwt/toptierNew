// src/components/PopupContainer.tsx
import { createPortal } from "react-dom";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const PopupContainer = ({ children }: Props) => {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
};

export default PopupContainer;
