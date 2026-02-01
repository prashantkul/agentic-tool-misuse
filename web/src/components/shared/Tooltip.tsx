import { type ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: "top" | "bottom";
}

export default function Tooltip({ text, children, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const show = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 288;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));

    setCoords({
      top: position === "top" ? rect.top - 8 : rect.bottom + 8,
      left,
    });
    setVisible(true);
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        className="inline-flex"
      >
        {children}
      </span>
      {visible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: 288,
              transform: position === "top" ? "translateY(-100%)" : undefined,
            }}
            className="px-3 py-2.5 text-xs leading-relaxed font-normal text-gray-100 bg-gray-900 rounded-lg z-[9999] shadow-xl pointer-events-none"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
