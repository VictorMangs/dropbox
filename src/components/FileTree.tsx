import type {
  TreeNode,
} from '../types/upload'

import { FileNode } from './FileNode'

interface Props {
  tree: TreeNode[]
}

export function FileTree({
  tree,
}: Props) {
  if (!tree.length) {
    return (
      <div className="rounded border border-slate-700 p-6 text-slate-400">
        Upload Preview
      </div>
    )
  }

  return (
    <div className="rounded border border-slate-700 p-4">
      <div className="mb-4 text-lg font-semibold">
        Upload Preview
      </div>

      {tree.map((node) => (
        <FileNode
          key={node.path}
          node={node}
        />
      ))}
    </div>
  )
}