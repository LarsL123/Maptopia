"use client";

interface FileItemProps {
  label: string;
  checked?: boolean;
  onToggle?: () => void;
}

export default function FileItem({ label, checked, onToggle }: FileItemProps) {
  const isToggle = checked !== undefined;

  return (
    <div
      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-200 rounded cursor-pointer"
      onClick={onToggle}
    >
      {isToggle && (
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer"
        />
      )}
      <span className="text-sm text-gray-600">📄 {label}</span>
    </div>
  );
}
