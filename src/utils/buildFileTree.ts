import type { TreeNode, UploadRecord, ValidationState } from "../types/upload";

type InternalTreeNode = TreeNode & {
  childrenMap?: Map<string, InternalTreeNode>;
};

function getWorstValidation(
  existing: ValidationState | undefined,
  incoming: ValidationState,
): ValidationState {
  const priority = {
    allowed: 0,
    pending: 1,
    cyber: 2,
    blocked: 3,
  };

  if (!existing) {
    return incoming;
  }

  return priority[incoming] > priority[existing] ? incoming : existing;
}

export function buildFileTree(
  files: UploadRecord[],
): TreeNode[] {
  const root: InternalTreeNode[] = [];

  const rootMap = new Map<string, InternalTreeNode>();

  for (const uploadFile of files) {
    const parts = uploadFile.relativePath.split("/");

    let currentChildren = root;

    let currentMap = rootMap;

    let currentPath = "";

    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];

      currentPath = currentPath
        ? `${currentPath}/${part}`
        : part;

      const isFile = index === parts.length - 1;

      let node = currentMap.get(part);

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
          childrenMap: isFile
            ? undefined
            : new Map<string, InternalTreeNode>(),
        };

        currentMap.set(part, node);

        currentChildren.push(node);
      }

      if (isFile) {
        node.validation = uploadFile.validationState;

        node.validationMessage =
          uploadFile.validationMessage;

        node.extension = uploadFile.extension;

        node.size = uploadFile.size;
      }

      if (
        node.type === "folder" &&
        node.children &&
        node.childrenMap
      ) {
        currentChildren =
          node.children as InternalTreeNode[];

        currentMap = node.childrenMap;
      }
    }
  }

  propagateFolderValidation(root);

  stripInternalMaps(root);

  return root;
}

function stripInternalMaps(
  nodes: InternalTreeNode[],
) {
  for (const node of nodes) {
    delete node.childrenMap;

    if (node.children) {
      stripInternalMaps(
        node.children as InternalTreeNode[],
      );
    }
  }
}

function propagateFolderValidation(nodes: TreeNode[]): {
  validation: ValidationState;
  blockedCount: number;
  cyberCount: number;
  allowedCount: number;
  fileCount: number;
} {
  let worst: ValidationState = "allowed";

  let blockedCount = 0;
  let cyberCount = 0;
  let allowedCount = 0;
  let fileCount = 0;

  for (const node of nodes) {
    if (node.type === "file") {
      fileCount += 1;

      switch (node.validation) {
        case "blocked":
          blockedCount += 1;
          break;

        case "cyber":
          cyberCount += 1;
          break;

        case "allowed":
          allowedCount += 1;
          break;
      }

      if (node.validation) {
        worst = getWorstValidation(worst, node.validation);
      }

      continue;
    }

    if (node.type === "folder" && node.children) {
      const childSummary = propagateFolderValidation(node.children);

      node.validation = childSummary.validation;

      node.blockedCount = childSummary.blockedCount;

      node.cyberCount = childSummary.cyberCount;

      node.allowedCount = childSummary.allowedCount;

      node.fileCount = childSummary.fileCount;

      blockedCount += childSummary.blockedCount;

      cyberCount += childSummary.cyberCount;

      allowedCount += childSummary.allowedCount;

      fileCount += childSummary.fileCount;

      worst = getWorstValidation(worst, childSummary.validation);
    }
  }

  return {
    validation: worst,
    blockedCount,
    cyberCount,
    allowedCount,
    fileCount,
  };
}
