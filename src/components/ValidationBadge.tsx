import clsx from 'clsx'

import type { ValidationState } from '../types/upload'

interface Props {
  state?: ValidationState
}

export function ValidationBadge({
  state,
}: Props) {
  if (!state) {
    return null
  }

  return (
    <span
      className={clsx(
        'rounded px-2 py-1 text-xs font-semibold',
        {
          'bg-green-600': state === 'allowed',
          'bg-yellow-600': state === 'cyber',
          'bg-red-600': state === 'blocked',
        },
      )}
    >
      {state}
    </span>
  )
}