export type ValidationState = "allowed" | "cyber" | "blocked";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "completed"
  | "failed"
  | "cancelled";

export type UploadPriority = "high" | "normal" | "low";

export interface UploadRecord {
  id: string;

  sessionId: string;

  originalName: string;

  relativePath: string;

  extension: string;

  storedPath: string;

  validationState: ValidationState;

  validationMessage: string;

  messageId: number;

  createdAt: string;

  size: number;
}

export interface UploadQueueItem {
  id: string;

  file: File;

  relativePath: string;

  progress: number;

  status: UploadStatus;

  error?: string;

  abortController?: AbortController;

  priority: UploadPriority;

  createdAt: string;

  retryCount: number;

  validationState?: ValidationState;

  validationMessage?: string;
}

export interface UploadSession {
  id: string;

  createdAt: string;

  files: UploadRecord[];
}

export interface TreeNode {
  name: string;

  path: string;

  type: "file" | "folder";

  validation?: ValidationState;

  validationMessage?: string;

  extension?: string;

  size?: number;

  blockedCount?: number;

  cyberCount?: number;

  allowedCount?: number;

  fileCount?: number;

  children?: TreeNode[];
}
