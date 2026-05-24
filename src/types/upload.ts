export type ValidationState =
  | 'allowed'
  | 'cyber'
  | 'blocked'

export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface UploadRecord {
  id: string

  sessionId: string

  originalName: string

  relativePath: string

  extension: string

  storedPath: string

  validationState: ValidationState

  validationMessage: string

  createdAt: string
}

export interface UploadQueueItem {
  id: string

  file: File

  relativePath: string

  progress: number

  status: UploadStatus

  error?: string

  abortController?: AbortController
}

export interface UploadSession {
  id: string

  createdAt: string

  files: UploadRecord[]
}

export interface TreeNode {
  name: string

  path: string

  type: 'file' | 'folder'

  validation?: ValidationState

  children?: TreeNode[]
}