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

  const retryQueueItem =
    useUploadStore(
      (state) =>
        state.retryQueueItem,
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

  const sessionId =
    useUploadStore(
      (state) =>
        state.sessionId,
    )

  if (
    uploadQueue.length === 0
  ) {
    return null
  }

  const summary = {
    pending: 0,
    uploading: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  }

  for (const item of uploadQueue) {
    summary[item.status] += 1
  }

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

  const allCompleted =
    uploadQueue.length > 0 &&
    uploadQueue.every(
      (item) =>
        item.status ===
        'completed',
    )

  const hasFailures =
    uploadQueue.some(
      (item) =>
        item.status ===
        'failed',
    )

  return (
    <div className="space-y-4 rounded bg-slate-800 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Upload Progress
          </h2>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
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

          <div className="mt-2 text-sm text-slate-400">
            Active uploads:
            {' '}
            {activeUploads}
            {' / '}
            3
          </div>
        </div>

        <button
          onClick={
            cancelAllUploads
          }
          className="rounded bg-red-700 px-3 py-2 text-sm hover:bg-red-600"
        >
          Cancel All Uploads
        </button>
      </div>

      {allCompleted && (
        <div className="rounded bg-green-700 p-3 text-sm">
          All uploads completed successfully.
        </div>
      )}

      {hasFailures && (
        <div className="rounded bg-red-700 p-3 text-sm">
          Some uploads failed.
          Retry available.
        </div>
      )}

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

      {uploadQueue.map(
        (item) => (
          <div
            key={item.id}
            className="space-y-1 rounded bg-slate-900 p-3"
          >
            <div className="flex justify-between text-sm">
              <span className="break-all">
                {item.relativePath}
              </span>

              <span>
                {item.progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded bg-slate-700">
              <div
                className={`h-full transition-all ${
                  item.status ===
                  'cancelled'
                    ? 'bg-yellow-500'
                    : item.status ===
                        'failed'
                      ? 'bg-red-500'
                      : item.status ===
                          'completed'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                }`}
                style={{
                  width: `${item.progress}%`,
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-slate-400">
                {item.status}

                {item.error &&
                  ` - ${item.error}`}
              </div>

              {item.status ===
                'failed' && (
                <button
                  onClick={async () => {
                    retryQueueItem(
                      item.id,
                    )

                    const updated =
                      uploadQueue.find(
                        (
                          queueItem,
                        ) =>
                          queueItem.id ===
                          item.id,
                      )

                    if (
                      !updated ||
                      !sessionId
                    ) {
                      return
                    }

                    await processSingleUpload(
                      {
                        ...updated,
                        status:
                          'pending',
                        progress: 0,
                        error:
                          undefined,
                      },

                      sessionId,

                      updateQueueItem,
                    )
                  }}
                  className="rounded bg-red-700 px-2 py-1 text-xs hover:bg-red-600"
                >
                  Retry
                </button>
              )}

              {item.status ===
                'uploading' && (
                <button
                  onClick={() =>
                    cancelQueueItem(
                      item.id,
                    )
                  }
                  className="rounded bg-yellow-700 px-2 py-1 text-xs hover:bg-yellow-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  )
}