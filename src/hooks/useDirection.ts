"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Direction } from "@src/@types/theme";
import { useAppDispatch, useAppSelector } from "@lib/redux/store";
import { setDirection as setDirectionAction } from "@lib/redux/base";

function useDirection(): [
  direction: Direction,
  setDirection: (dir: Direction) => void
] {
  const direction = useAppSelector(
    (state) => state.root.direction as Direction
  );
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  // Auto-set direction based on URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "ar") {
      dispatch(setDirectionAction("rtl"));
    } else {
      dispatch(setDirectionAction("ltr"));
    }
  }, [pathname, dispatch]);

  // Always update document direction
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.setAttribute("dir", direction);
  }, [direction]);

  const setDirectionHandler = (dir: Direction) => {
    dispatch(setDirectionAction(dir));
  };

  return [direction, setDirectionHandler];
}

export default useDirection;
