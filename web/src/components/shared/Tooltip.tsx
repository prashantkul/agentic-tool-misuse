import type { ReactNode } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: "top" | "bottom";
}

export default function Tooltip({ text, children, position = "top" }: TooltipProps) {
  const positionClasses =
    position === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
      : "top-full left-1/2 -translate-x-1/2 mt-2";

  const arrowClasses =
    position === "top"
      ? "top-full left-1/2 -translate-x-1/2 border-t-gray-900"
      : "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900";

  return (
    <span className="relative group/tooltip inline-flex">
      {children}
      <span
        className={`absolute ${positionClasses} w-56 px-3 py-2 text-xs leading-relaxed font-normal text-gray-100 bg-gray-900 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg`}
      >
        {text}
        <span
          className={`absolute ${arrowClasses} border-4 border-transparent`}
        />
      </span>
    </span>
  );
}
