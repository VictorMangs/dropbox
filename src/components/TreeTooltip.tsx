import { createPortal } from 'react-dom'
import type { TreeNode } from '../types/upload'

interface Props {
  node: TreeNode
  position: {
    x: number
    y: number
  }
}

export function TreeTooltip({
  node,
  position,
}: Props) {
  return createPortal(
    <div
      className="fixed z-50 w-72 rounded border border-slate-700 bg-slate-900 p-3 text-xs shadow-xl pointer-events-none"
      style={{
        top: position.y + 10,
        left: position.x + 10,
      }}
    >
      <div className="font-semibold text-white">
        {node.name}
      </div>

      <div className="mt-2 space-y-1 text-slate-300">
        <div>Type: {node.type}</div>

        <div>
          Status: {node.validation}
        </div>

        {node.validationMessage && (
          <div>
            Message: {node.validationMessage}
          </div>
)}

        {node.validationMessage && (
          <div>
            Message: {node.validationMessage}
          </div>
        )}

        {node.extension && (
          <div>
            Extension: {node.extension}
          </div>
        )}

        {typeof node.size === 'number' && (
          <div>
            Size: {formatSize(node.size)}
          </div>
        )}

        {node.type === 'folder' && (
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
  )
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}