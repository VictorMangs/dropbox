import type {
  TreeNode,
  UploadRecord,
  ValidationState,
} from '../types/upload'

function getWorstValidation(
  existing: ValidationState | undefined,
  incoming: ValidationState,
): ValidationState {
  const priority = {
    allowed: 0,
    cyber: 1,
    blocked: 2,
  }

  if (!existing) {
    return incoming
  }

  return priority[incoming] > priority[existing]
    ? incoming
    : existing
}

export function buildFileTree(
  files: UploadRecord[],
): TreeNode[] {
  const root: TreeNode[] = []

  for (const uploadFile of files) {
    const parts =
      uploadFile.relativePath.split('/')

    let currentLevel = root
    let currentPath = ''

    parts.forEach((part, index) => {
      currentPath = currentPath
        ? `${currentPath}/${part}`
        : part

      const isFile = index === parts.length - 1

      let existing = currentLevel.find(
        (node) => node.name === part,
      )

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
        }

        currentLevel.push(existing)
      }

      if (isFile) {
        existing.validation =
          uploadFile.validationState
      }

      if (!isFile && existing.children) {
        currentLevel = existing.children
      }
    })
  }

  propagateFolderValidation(root)

  return root
}

function propagateFolderValidation(
  nodes: TreeNode[],
): ValidationState {
  let worst: ValidationState = 'allowed'

  for (const node of nodes) {
    if (node.type === 'folder' && node.children) {
      node.validation =
        propagateFolderValidation(node.children)
    }

    if (node.validation) {
      worst = getWorstValidation(
        worst,
        node.validation,
      )
    }
  }

  return worst
}