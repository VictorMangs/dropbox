import { useUploadStore } from '../store/uploadStore'

export function UploadQueue() {
  const uploadQueue =
    useUploadStore(
      (state) =>
        state.uploadQueue,
    )

  const loading =
    useUploadStore(
      (state) =>
        state.loading,
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

  const startTransfer =
    useUploadStore(
      (state) =>
        state.startTransfer,
    )

  const totalFiles =
    uploadQueue.length

  const hasStarted =
    uploadQueue.some(
      (item) =>
        item.status === 'uploading' ||
        item.status === 'completed' ||
        item.status === 'failed',
    )

  const files =
    useUploadStore(
      (state) =>
        state.files,
    )

  const unapprovedFiles =
    files.filter(
      (file) =>
        file.validationState === 'blocked' ||
        file.validationState === 'cyber',
    )

  const canTransfer =
    !hasStarted &&
    uploadQueue.length > 0 &&
    unapprovedFiles.length === 0

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

  const failedUploads =
    uploadQueue.filter(
      (item) =>
        item.status ===
        'failed',
    ).length

  const summary = {
    completed: 0,
    failed: 0,
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
      'cancelled'
    ) {
      summary.cancelled += 1
    }
  }

  return (
    <div className="space-y-4 rounded bg-slate-800 p-4">
      <div className="flex gap-2">
        <button
          onClick={startTransfer}
          disabled={loading || !canTransfer || uploadQueue.length === 0}
          className="rounded bg-green-700 px-3 py-2 text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Starting...' : 'Transfer'}
        </button>

        <button
          onClick={cancelAllUploads}
          disabled={activeUploads === 0}
          className="rounded bg-red-700 px-3 py-2 text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel All Uploads
        </button>

        {unapprovedFiles.length > 0 && (
          <div className="flex items-center gap-2 rounded bg-red-900 px-3 py-2 text-sm text-red-100">
            <span>⚠️</span>
            <span>
              {unapprovedFiles.length} unapproved {unapprovedFiles.length === 1 ? 'file' : 'files'}
            </span>
          </div>
        )}
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