import type {
  UploadQueueItem,
} from '../types/upload'

import { ValidationBadge } from './ValidationBadge'

interface Props {
  uploadQueue: UploadQueueItem[]

  canTransfer: boolean
}

export function ValidationSummary({
  uploadQueue,
  canTransfer,
}: Props) {
  const summary = {
    allowed: 0,
    cyber: 0,
    blocked: 0,
  }

  for (const item of uploadQueue) {
    if (
      !item.validationState
    ) {
      continue
    }

    summary[
      item.validationState
    ] += 1
  }

  const unapprovedFiles =
    uploadQueue.filter(
      (item) =>
        item.validationState ===
          'blocked' ||
        item.validationState ===
          'cyber',
    )

  const validationStatus =
    uploadQueue.length === 0
      ? {
          label:
            'Ready To Transfer',

          className:
            'bg-slate-700',
        }
      : canTransfer
        ? {
            label:
              'Ready To Transfer',

            className:
              'bg-green-700',
          }
        : {
            label:
              'Transfer Blocked',

            className:
              'bg-red-700',
          }

  return (
    <div className="space-y-4">
      <div className="rounded border border-slate-700 bg-slate-800 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Validation Feedback
            </h2>

            <p className="text-sm text-slate-400">
              Files validated before
              transfer
            </p>
          </div>

          <div
            className={`rounded px-3 py-1 text-sm ${validationStatus.className}`}
          >
            {
              validationStatus.label
            }
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded bg-green-600 p-4">
            <div className="text-sm">
              Allowed
            </div>

            <div className="text-2xl font-bold">
              {
                summary.allowed
              }
            </div>
          </div>

          <div className="rounded bg-yellow-600 p-4">
            <div className="text-sm">
              Cyber
            </div>

            <div className="text-2xl font-bold">
              {summary.cyber}
            </div>
          </div>

          <div className="rounded bg-red-600 p-4">
            <div className="text-sm">
              Blocked
            </div>

            <div className="text-2xl font-bold">
              {
                summary.blocked
              }
            </div>
          </div>
        </div>
      </div>

      {unapprovedFiles.length >
        0 && (
        <div className="rounded border border-red-700 bg-red-900/20 p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-red-200">
            <span>⚠️</span>

            <span>
              {
                unapprovedFiles.length
              }{' '}
              problematic{' '}
              {unapprovedFiles.length ===
              1
                ? 'file'
                : 'files'}
            </span>
          </div>

          <div className="space-y-2">
            {unapprovedFiles.map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded bg-slate-900/50 px-3 py-2 text-sm"
                >
                  <span className="truncate text-slate-300">
                    {
                      item.relativePath
                    }
                  </span>

                  <ValidationBadge
                    state={
                      item.validationState
                    }
                  />
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}