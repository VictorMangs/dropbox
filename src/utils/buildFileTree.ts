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

          type: isFile
            ? 'file'
            : 'folder',

          children: isFile
            ? undefined
            : [],
        }

        currentLevel.push(existing)
      }

      if (isFile) {
       existing.validation =
        uploadFile.validationState

        existing.validationMessage =
          uploadFile.validationMessage

        existing.extension =
          uploadFile.extension

        existing.size =
          uploadFile.size
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
  let worst: ValidationState =
    'allowed'

  let blockedCount = 0

  let cyberCount = 0

  let allowedCount = 0

  let totalFiles = 0

  for (const node of nodes) {
    if (
      node.type === 'folder' &&
      node.children
    ) {
      node.validation =
        propagateFolderValidation(
          node.children,
        )
    }

    if (
      node.type === 'file'
    ) {
      totalFiles += 1

      switch (
        node.validation
      ) {
        case 'blocked':
          blockedCount += 1
          break

        case 'cyber':
          cyberCount += 1
          break

        case 'allowed':
          allowedCount += 1
          break
      }
    }

    if (
      node.children
    ) {
      blockedCount +=
        node.blockedCount ??
        0

      cyberCount +=
        node.cyberCount ??
        0

      allowedCount +=
        node.allowedCount ??
        0

      totalFiles +=
        node.fileCount ??
        0
    }

    if (
      node.validation
    ) {
      worst =
        getWorstValidation(
          worst,
          node.validation,
        )
    }
  }

  for (const node of nodes) {
    if (
      node.type === 'folder'
    ) {
      node.blockedCount =
        blockedCount

      node.cyberCount =
        cyberCount

      node.allowedCount =
        allowedCount

      node.fileCount =
        totalFiles
    }
  }

  return worst
}