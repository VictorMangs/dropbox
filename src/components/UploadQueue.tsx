import {
  useUploadStore,
} from '../store/uploadStore'

import {
  processSingleUpload,
} from '../services/uploadOrchestrator'

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
  }

  for (const item of uploadQueue) {
    summary[item.status] += 1
  }

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
    <div className="space-y-2 rounded bg-slate-800 p-4">
      <h2 className="text-lg font-semibold">
        Upload Progress
      </h2>

      <div className="mt-2 flex gap-4 text-sm text-slate-400">
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

      {uploadQueue.map(
        (item) => (
          <div
            key={item.id}
            className="space-y-1"
          >
            <div className="flex justify-between text-sm">
              <span>
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
                className="mt-1 rounded bg-red-700 px-2 py-1 text-xs hover:bg-red-600"
              >
                Retry
              </button>
            )}
          </div>
        ),
      )}
    </div>
  )
}