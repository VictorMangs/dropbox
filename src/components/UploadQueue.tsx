import {
  processSingleUpload,
} from '../services/uploadOrchestrator'

import { useUploadStore } from '../store/uploadStore'

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

  const pendingUploads =
    uploadQueue.filter(
      (item) =>
        item.status ===
        'pending',
    ).length

  const pausedUploads =
    uploadQueue.filter(
      (item) =>
        item.status ===
        'paused',
    ).length

  const failedUploads =
    uploadQueue.filter(
      (item) =>
        item.status ===
        'failed',
    ).length

  const summary = {
    completed: 0,
    failed: 0,
    paused: 0,
    cancelled: 0,
  }

  for (const item of uploadQueue) {
    if (
      item.status ===
      'completed'
    ) {
      summary.completed += 1
    }

    if (
      item.status ===
      'failed'
    ) {
      summary.failed += 1
    }

    if (
      item.status ===
      'paused'
    ) {
      summary.paused += 1
    }

    if (
      item.status ===
      'cancelled'
    ) {
      summary.cancelled += 1
    }
  }

  return (
    <div className="space-y-4 rounded bg-slate-800 p-4">
      <div className="flex gap-2">
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

      <div className="rounded bg-slate-900 p-4 text-sm">
        <div className="font-semibold">
          Scheduler Metrics
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            Pending:
            {' '}
            {pendingUploads}
          </div>

          <div>
            Active:
            {' '}
            {activeUploads}
          </div>

          <div>
            Paused:
            {' '}
            {pausedUploads}
          </div>

          <div>
            Failed:
            {' '}
            {failedUploads}
          </div>
        </div>
      </div>

      <div className="text-sm text-slate-400">
        Completed:
        {' '}
        {summary.completed}
        {' | '}
        Failed:
        {' '}
        {summary.failed}
        {' | '}
        Paused:
        {' '}
        {summary.paused}
        {' | '}
        Cancelled:
        {' '}
        {summary.cancelled}
      </div>

      <div className="space-y-3">
        {uploadQueue.map(
          (item) => (
            <div
              key={item.id}
              className="rounded bg-slate-900 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {
                      item.relativePath
                    }
                  </div>

                  <div className="text-sm text-slate-400">
                    {
                      item.status
                    }
                  </div>
                </div>

                <select
                  value={
                    item.priority
                  }
                  onChange={(
                    e,
                  ) =>
                    updateQueueItem(
                      item.id,
                      {
                        priority:
                          e.target
                            .value as any,
                      },
                    )
                  }
                  className="rounded bg-slate-700 px-2 py-1 text-xs"
                >
                  <option value="high">
                    High
                  </option>

                  <option value="normal">
                    Normal
                  </option>

                  <option value="low">
                    Low
                  </option>
                </select>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded bg-slate-700">
                <div
                  className={
                    item.status ===
                    'completed'
                      ? 'h-full bg-green-500'
                      : item.status ===
                            'failed'
                        ? 'h-full bg-red-500'
                        : item.status ===
                              'paused'
                          ? 'h-full bg-yellow-400'
                          : item.status ===
                                'cancelled'
                            ? 'h-full bg-yellow-500'
                            : 'h-full bg-blue-500'
                  }
                  style={{
                    width: `${item.progress}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex gap-2">
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
                      resumeQueueItem(
                        item.id,
                      )

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
                    Resume
                  </button>
                )}
              </div>

              {item.error && (
                <div className="mt-2 text-xs text-red-400">
                  {item.error}
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  )
}