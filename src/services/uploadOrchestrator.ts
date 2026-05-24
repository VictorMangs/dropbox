import {
  uploadFile,
  getSession,
} from '../api/uploadApi'

import type {
  UploadQueueItem,
} from '../types/upload'

interface ProcessUploadsParams {
  queue: UploadQueueItem[]

  sessionId: string

  updateQueueItem: (
    id: string,
    updates: Partial<UploadQueueItem>,
  ) => void

  setFiles: (
    files: any[],
  ) => void
}

export async function processUploads({
  queue,
  sessionId,
  updateQueueItem,
  setFiles,
}: ProcessUploadsParams) {
  for (const item of queue) {
    if (
      item.status ===
      'completed'
    ) {
      continue
    }

    await processSingleUpload(
      item,
      sessionId,
      updateQueueItem,
    )
  }

  const hydratedSession =
    await getSession(sessionId)

  setFiles(
    hydratedSession.files,
  )
}

export async function processSingleUpload(
  item: UploadQueueItem,

  sessionId: string,

  updateQueueItem: (
    id: string,
    updates: Partial<UploadQueueItem>,
  ) => void,
) {
  updateQueueItem(item.id, {
    status: 'uploading',
    error: undefined,
  })

  try {
    await uploadFile(
      sessionId,
      item.file,
      item.relativePath,

      (progress) => {
        updateQueueItem(
          item.id,
          {
            progress,
          },
        )
      },
    )

    updateQueueItem(item.id, {
      status: 'completed',
      progress: 100,
    })
  } catch (error) {
    updateQueueItem(item.id, {
      status: 'failed',

      error:
        error instanceof Error
          ? error.message
          : 'Upload failed',
    })
  }
}