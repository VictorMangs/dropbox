import { create } from 'zustand'

import type { UploadRecord, UploadQueueItem } from '../types/upload'
import { clearSessionId } from '../utils/sessionStorage'

interface UploadStore {
  sessionId: string | null

  files: UploadRecord[]

	uploadQueue: UploadQueueItem[]

  loading: boolean

  setSessionId: (
    sessionId: string,
  ) => void

  setFiles: (
    files: UploadRecord[],
  ) => void

  setLoading: (
    loading: boolean,
  ) => void

  clearFiles: () => void

	setUploadQueue: (
		queue: UploadQueueItem[],
	) => void

	updateQueueItem: (
		id: string,
		updates: Partial<UploadQueueItem>,
	) => void

	retryQueueItem: (
  	id: string,
	) => void

}

export const useUploadStore =
  create<UploadStore>((set) => ({
    sessionId: null,

    files: [],

		uploadQueue: [],

    loading: false,

    setSessionId: (
      sessionId,
    ) =>
      set(() => ({
        sessionId,
      })),

    setFiles: (files) =>
      set(() => ({
        files,
      })),

    setLoading: (
      loading,
    ) =>
      set(() => ({
        loading,
      })),

    clearFiles: () => {
			clearSessionId()

			set(() => ({
					sessionId: null,
					files: [],
			}))
			},

		setUploadQueue: (
			uploadQueue,
		) =>
			set(() => ({
				uploadQueue,
			})),

		updateQueueItem: (
			id,
			updates,
		) =>
			set((state) => ({
				uploadQueue:
					state.uploadQueue.map(
						(item) =>
							item.id === id
								? {
										...item,
										...updates,
									}
								: item,
					),
		})),
		
		retryQueueItem: (
			id,
		) =>
			set((state) => ({
				uploadQueue:
					state.uploadQueue.map(
						(item) =>
							item.id === id
								? {
										...item,
										status:
											'pending',
										progress: 0,
										error: undefined,
									}
								: item,
					),
			})),
		
  }))