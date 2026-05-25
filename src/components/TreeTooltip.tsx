import type {
  TreeNode,
} from '../types/upload'

interface Props {
  node: TreeNode
}

export function TreeTooltip({
  node,
}: Props) {
  return (
    <div className="absolute left-full top-0 z-50 ml-2 w-72 rounded border border-slate-700 bg-slate-900 p-3 text-xs shadow-xl">
      <div className="font-semibold text-white">
        {node.name}
      </div>

      <div className="mt-2 space-y-1 text-slate-300">
        <div>
          Type:
          {' '}
          {node.type}
        </div>

        <div>
          Validation:
          {' '}
          {node.validation}
        </div>

        {node.validationMessage && (
          <div>
            Message:
            {' '}
            {node.validationMessage}
          </div>
        )}

        {node.extension && (
          <div>
            Extension:
            {' '}
            {node.extension}
          </div>
        )}

        {typeof node.size ===
          'number' && (
          <div>
            Size:
            {' '}
            {formatSize(
              node.size,
            )}
          </div>
        )}

        {node.type ===
          'folder' && (
          <>
            <div>
              Files:
              {' '}
              {node.fileCount}
            </div>

            <div>
              Allowed:
              {' '}
              {node.allowedCount}
            </div>

            <div>
              Cyber:
              {' '}
              {node.cyberCount}
            </div>

            <div>
              Blocked:
              {' '}
              {node.blockedCount}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatSize(
  bytes: number,
) {
  if (
    bytes < 1024
  ) {
    return `${bytes} B`
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`
  }

  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(1)} MB`
}