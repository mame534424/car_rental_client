"use client";

import React, { useEffect, useState } from "react";

type ToastProps = {
  message?: string | null;
  show?: boolean;
  durationMs?: number;
};

export function Toast({ message, show, durationMs = 1500 }: ToastProps) {
  const [visible, setVisible] = useState<boolean>(!!show && !!message);

  useEffect(() => {
    if (show && message) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), durationMs);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [show, message, durationMs]);

  if (!visible || !message) return null;

  return (
    <div className="fixed right-4 bottom-6 z-[9999] max-w-xs w-full">
      <div className="rounded-xl bg-[#0b1220] border border-slate-800 px-4 py-3 shadow-lg text-sm text-slate-200">
        <div className="font-medium">{message}</div>
      </div>
    </div>
  );
}

export default Toast;
