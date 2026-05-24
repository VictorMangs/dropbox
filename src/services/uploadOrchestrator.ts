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

  getQueueItem: (
    id: string,
  ) => UploadQueueItem | undefined
}

export async function processUploads({
  queue,
  sessionId,
  updateQueueItem,
  setFiles,
  getQueueItem,
}: ProcessUploadsParams) {
  const pendingQueue =
    queue.filter(
        (item) =>
        ![
          'completed',
          'paused',
          'cancelled',
        ].includes(
          item.status,
        )
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
        
        const latestItem =
          getQueueItem(item.id)

        if (
          !latestItem ||
          [
            'paused',
            'cancelled',
            'completed',
          ].includes(
            latestItem.status,
          )
        ) {
          continue
        }

        await processSingleUpload(
          item,
          sessionId,
          updateQueueItem,
          getQueueItem,
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

  getQueueItem: (
    id: string,
  ) => UploadQueueItem | undefined,
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

    const latestItem =
      getQueueItem(item.id)

    if (
      !latestItem ||
      latestItem.status ===
        'cancelled' ||
      latestItem.status ===
        'paused'
    ) {
      return
    }

    updateQueueItem(item.id, {
      status: 'completed',
      progress: 100,
    })
  } catch (error) {
    const latestItem =
  getQueueItem(item.id)

  if (
    abortController.signal
      .aborted
  ) {
    if (
      latestItem?.status ===
      'paused'
    ) {
      updateQueueItem(item.id, {
        error: 'Upload paused',
      })

      return
    }

    if (
      latestItem?.status ===
      'cancelled'
    ) {
      updateQueueItem(item.id, {
        error:
          'Upload cancelled',
      })

      return
    }
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