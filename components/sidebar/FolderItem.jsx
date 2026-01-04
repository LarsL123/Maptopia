"use client";

import React from "react";

export default function FolderItem({ label, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div>
      <div
        className="flex items-center gap-2 px-2 py-1 hover:bg-gray-200 rounded cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-600">{isOpen ? "▼" : "▶"}</span>
        <span className="text-sm font-medium text-gray-700">📁 {label}</span>
      </div>
      {isOpen && <div className="ml-6 mt-1 space-y-1">{children}</div>}
    </div>
  );
}
