import {
  processSingleUpload,
} from '../services/uploadOrchestrator'

import {
  useUploadStore,
} from '../store/uploadStore'

export function UploadQueue() {
  const uploadQueue =
    useUploadStore(
      (state) =>
        state.uploadQueue,
    )

  const sessionId =
    useUploadStore(
      (state) =>
        state.sessionId,
    )

  const updateQueueItem =
    useUploadStore(
      (state) =>
        state.updateQueueItem,
    )

  const cancelQueueItem =
    useUploadStore(
      (state) =>
        state.cancelQueueItem,
    )

  const cancelAllUploads =
    useUploadStore(
      (state) =>
        state.cancelAllUploads,
    )

  const pauseQueueItem =
    useUploadStore(
      (state) =>
        state.pauseQueueItem,
    )

  const resumeQueueItem =
    useUploadStore(
      (state) =>
        state.resumeQueueItem,
    )

  const pauseAllUploads =
    useUploadStore(
      (state) =>
        state.pauseAllUploads,
    )

  const totalFiles =
    uploadQueue.length

  const completedFiles =
    uploadQueue.filter(
      (item) =>
        item.status ===
        'completed',
    ).length

  const overallProgress =
    totalFiles === 0
      ? 0
      : Math.round(
          (completedFiles /
            totalFiles) *
            100,
        )

  const activeUploads =
    uploadQueue.filter(
      (item) =>
        item.status ===
        'uploading',
    ).length

  const summary = {
    pending: 0,
    uploading: 0,
    paused: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  }

  for (const item of uploadQueue) {
    summary[item.status] += 1
  }

  if (
    uploadQueue.length === 0
  ) {
    return null
  }

  return (
    <div className="space-y-4 rounded-lg bg-slate-800 p-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={
            pauseAllUploads
          }
          className="rounded bg-yellow-700 px-3 py-2 text-sm hover:bg-yellow-600"
        >
          Pause All Uploads
        </button>

        <button
          onClick={
            cancelAllUploads
          }
          className="rounded bg-red-700 px-3 py-2 text-sm hover:bg-red-600"
        >
          Cancel All Uploads
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <span>
            Pending:
            {' '}
            {summary.pending}
          </span>

          <span>
            Uploading:
            {' '}
            {summary.uploading}
          </span>

          <span>
            Paused:
            {' '}
            {summary.paused}
          </span>

          <span>
            Completed:
            {' '}
            {summary.completed}
          </span>

          <span>
            Failed:
            {' '}
            {summary.failed}
          </span>

          <span>
            Cancelled:
            {' '}
            {summary.cancelled}
          </span>
        </div>

        <div className="text-sm text-slate-400">
          Active uploads:
          {' '}
          {activeUploads}
          {' / '}
          3
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>
              Overall Progress
            </span>

            <span>
              {overallProgress}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded bg-slate-700">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{
                width: `${overallProgress}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {uploadQueue.map(
          (item) => (
            <div
              key={item.id}
              className="rounded bg-slate-900 p-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {
                      item.relativePath
                    }
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    Status:
                    {' '}
                    {
                      item.status
                    }
                  </div>

                  {item.error && (
                    <div className="mt-1 text-xs text-red-400">
                      {
                        item.error
                      }
                    </div>
                  )}
                </div>

                <div className="text-sm">
                  {item.progress}
                  %
                </div>
              </div>

              <div className="mt-2 h-3 overflow-hidden rounded bg-slate-700">
                <div
                  className={`h-full transition-all ${
                    item.status ===
                    'completed'
                      ? 'bg-green-500'
                      : item.status ===
                            'failed'
                        ? 'bg-red-500'
                        : item.status ===
                              'cancelled'
                          ? 'bg-yellow-500'
                          : item.status ===
                                'paused'
                            ? 'bg-yellow-400'
                            : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${item.progress}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.status ===
                  'failed' && (
                  <button
                    onClick={async () => {
                      if (
                        !sessionId
                      ) {
                        return
                      }

                      await processSingleUpload(
                        {
                          ...item,
                          status:
                            'pending',
                        },

                        sessionId,

                        updateQueueItem,
                      )
                    }}
                    className="rounded bg-blue-700 px-2 py-1 text-xs hover:bg-blue-600"
                  >
                    Retry
                  </button>
                )}

                {item.status ===
                  'uploading' && (
                  <>
                    <button
                      onClick={() =>
                        pauseQueueItem(
                          item.id,
                        )
                      }
                      className="rounded bg-yellow-700 px-2 py-1 text-xs hover:bg-yellow-600"
                    >
                      Pause
                    </button>

                    <button
                      onClick={() =>
                        cancelQueueItem(
                          item.id,
                        )
                      }
                      className="rounded bg-red-700 px-2 py-1 text-xs hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {item.status ===
                  'paused' && (
                  <button
                    onClick={async () => {
                      if (
                        !sessionId
                      ) {
                        return
                      }

                      resumeQueueItem(
                        item.id,
                      )

                      await processSingleUpload(
                        {
                          ...item,
                          status:
                            'pending',
                        },

                        sessionId,

                        updateQueueItem,
                      )
                    }}
                    className="rounded bg-blue-700 px-2 py-1 text-xs hover:bg-blue-600"
                  >
                    Resume
                  </button>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}