export type ValidationState =
  | 'allowed'
  | 'cyber'
  | 'blocked'

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