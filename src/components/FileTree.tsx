import type { TreeNode, UploadRecord } from '../types/upload'

import { FileNode } from './FileNode'
import { ValidationBadge } from './ValidationBadge'

interface Props {
  tree: TreeNode[]
  unapprovedFiles?: UploadRecord[]
}


export function FileTree({ tree, unapprovedFiles = [] }: Props) {
  if (!tree.length && unapprovedFiles.length === 0) {
    return (
      <div className="rounded border border-slate-700 p-6 text-slate-400">
        Upload Preview
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {unapprovedFiles.length > 0 && (
        <div className="rounded border border-red-700 bg-red-900 bg-opacity-20 p-4">
          <div className="mb-3 font-semibold text-red-200">
            ⚠️ Unapproved Files - Cannot Transfer
          </div>
          <div className="space-y-2">
            {unapprovedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">
                  {file.relativePath}
                </span>
                <ValidationBadge state={file.validationState} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tree.length > 0 && (
        <div className="rounded border border-slate-700 p-4">
          {tree.map((node) => (
            <FileNode
              key={node.path}
              node={node}
            />
          ))}
        </div>
      )}
    </div>
  )
}