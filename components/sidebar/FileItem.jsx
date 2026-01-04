"use client";

export default function FileItem({ label }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-200 rounded cursor-pointer">
      <span className="text-sm text-gray-600">📄 {label}</span>
    </div>
  );
}
