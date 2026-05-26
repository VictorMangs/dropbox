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

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })

  const isFolder = node.type === 'folder'

  return (
    <div className="ml-4 mt-2 relative">
      <div
        className="flex items-center gap-2"
        onMouseEnter={(e) => {
          setHovered(true)
          setPosition({
            x: e.clientX,
            y: e.clientY,
          })
        }}
        onMouseMove={(e) => {
          setPosition({
            x: e.clientX,
            y: e.clientY,
          })
        }}
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
      </div>

      {hovered && (
        <TreeTooltip
          node={node}
          position={position}
        />
      )}

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