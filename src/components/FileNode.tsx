import { useState } from 'react'

import type { TreeNode } from '../types/upload'

import { ValidationBadge } from './ValidationBadge'

interface Props {
  node: TreeNode
}

export function FileNode({ node }: Props) {
  const [expanded, setExpanded] = useState(true)

  const isFolder = node.type === 'folder'

  return (
    <div className="ml-4 mt-2">
      <div className="flex items-center gap-2">
        {isFolder && (
          <button
            className="w-6 text-slate-400"
            onClick={() =>
              setExpanded(!expanded)
            }
          >
            {expanded ? '-' : '+'}
          </button>
        )}

        {!isFolder && (
          <div className="w-6" />
        )}

        <span>
          {isFolder ? '📁' : '📄'}
        </span>

        <span>{node.name}</span>

        <ValidationBadge
          state={node.validation}
        />
      </div>

      {expanded &&
        node.children?.map((child) => (
          <FileNode
            key={child.path}
            node={child}
          />
        ))}
    </div>
  )
}