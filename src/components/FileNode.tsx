import { useState } from 'react'

import type { TreeNode } from '../types/upload'

import { ValidationBadge } from './ValidationBadge'
import { TreeTooltip } from './TreeTooltip'

interface Props {
  node: TreeNode
}

export function FileNode({ node }: Props) {
  const [expanded, setExpanded] = useState(true)
  const [hovered, setHovered] = useState(false)

  const isFolder = node.type === 'folder'

  return (
    <div className="ml-4 mt-2">
      <div
        className="relative flex items-center gap-2"
        onMouseEnter={() =>
          setHovered(true)
        }
        onMouseLeave={() =>
          setHovered(false)
        }
      >
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

        {hovered && (
          <TreeTooltip
            node={node}
          />
        )}
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