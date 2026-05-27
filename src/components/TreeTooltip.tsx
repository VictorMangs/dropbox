import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";
import type { TreeNode } from "../types/upload";

interface Props {
  node: TreeNode;
  position: {
    x: number;
    y: number;
  };
}

export function TreeTooltip({ node, position }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  // Measure tooltip after render
  useLayoutEffect(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    setSize({
      width: rect.width,
      height: rect.height,
    });
  }, [node]);

  const padding = 12;

  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;

  // Detect overflow risk
  const wouldOverflowRight = position.x + size.width + padding > viewportWidth;

  const wouldOverflowBottom =
    position.y + size.height + padding > viewportHeight;

  // Flip logic (preferred UX improvement)
  const left = wouldOverflowRight
    ? position.x - size.width - padding
    : position.x + padding;

  const top = wouldOverflowBottom
    ? position.y - size.height - padding
    : position.y + padding;

  return createPortal(
    <div
      ref={ref}
      className="fixed z-50 w-72 rounded border border-slate-700 bg-slate-900 p-3 text-xs shadow-xl pointer-events-none"
      style={{
        left: Math.max(padding, left),
        top: Math.max(padding, top),
      }}
    >
      <div className="font-semibold text-white">{node.name}</div>

      <div className="mt-2 space-y-1 text-slate-300">
        <div>Type: {node.type}</div>

        <div>Status: {node.validation}</div>

        {node.validationMessage && <div>Message: {node.validationMessage}</div>}

        {node.extension && <div>Extension: {node.extension}</div>}

        {typeof node.size === "number" && (
          <div>Size: {formatSize(node.size)}</div>
        )}

        {node.type === "folder" && (
          <>
            <div>Files: {node.fileCount}</div>
            <div>Allowed: {node.allowedCount}</div>
            <div>Cyber: {node.cyberCount}</div>
            <div>Blocked: {node.blockedCount}</div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
