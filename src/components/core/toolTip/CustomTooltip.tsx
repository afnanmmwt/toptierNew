"use client";
import React, { ReactNode } from "react";

type TooltipProps = {
  children: ReactNode;
  text?: string;
  title?: string;
  address?: string;
  city?: string;
  location?: string | ReactNode;
  price?: string | number;
  content?: ReactNode;
  width?: string;
  height?: string;
  stars?: string;
  bgColor?: string;
  textColor?: string;
  position?: "top" | "bottom" | "left" | "right";
};

export default function Tooltip({
  children,
  width = "w-56",
  height = "h-auto",
  bgColor = "bg-gray-800",
  textColor = "text-white",
  position = "top",
}: TooltipProps) {
  const positionClasses: Record<"top" | "bottom" | "left" | "right", string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`
          absolute ${positionClasses[position]}
          ${width} ${height}
          ${bgColor} ${textColor}
          text-sm rounded-lg px-3 py-2
          opacity-0 group-hover:opacity-100
          transition duration-300
          z-50
        `}
      >
        {/* Priority: content → structured fields → simple text */}
       
      </div>
    </div>
  );
}
