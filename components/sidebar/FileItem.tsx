"use client";

interface FileItemProps {
  label: string;
}

export default function FileItem({ label }: FileItemProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-200 rounded cursor-pointer">
      <span className="text-sm text-gray-600">📄 {label}</span>
    </div>
  );
}
