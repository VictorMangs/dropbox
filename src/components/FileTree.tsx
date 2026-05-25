import type { TreeNode } from '../types/upload'

import { FileNode } from './FileNode'

interface Props {
  tree: TreeNode[]
}


export function FileTree({ tree }: Props) {
  if (!tree.length) {
    return (
      <div className="rounded border border-slate-700 p-6 text-slate-400">
        No files uploaded.
      </div>
    )
  }

  return (
    <div className="rounded border border-slate-700 p-4">
      {tree.map((node) => (
        <FileNode
          key={node.path}
          node={node}
        />
      ))}
    </div>
  )
}