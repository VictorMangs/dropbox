import {
  uploadFile,
  getSession,
} from '../api/uploadApi'

import type {
  UploadQueueItem,
} from '../types/upload'

const MAX_CONCURRENT_UPLOADS = 3

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
  const pendingQueue =
    queue.filter(
        (item) =>
        item.status !==
        'completed',
    )

    let currentIndex = 0

    async function worker() {
    while (
        currentIndex <
        pendingQueue.length
    ) {
        const item =
        pendingQueue[
            currentIndex
        ]

        currentIndex += 1

        await processSingleUpload(
        item,
        sessionId,
        updateQueueItem,
        )
    }
    }

    const workers = Array.from(
    {
        length:
        MAX_CONCURRENT_UPLOADS,
    },
    () => worker(),
    )

await Promise.all(workers)
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
  const abortController = new AbortController()

  updateQueueItem(item.id, {
    status: 'uploading',
    error: undefined,
    abortController,
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

      abortController.signal,
    )

    updateQueueItem(item.id, {
      status: 'completed',
      progress: 100,
    })
  } catch (error) {
    if (
      abortController.signal
        .aborted
    ) {
      updateQueueItem(item.id, {
        status: 'cancelled',
        error: 'Upload cancelled',
      })

      return
    }

    updateQueueItem(item.id, {
      status: 'failed',

      error:
        error instanceof Error
          ? error.message
          : 'Upload failed',
    })
  }
}