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
  
  cancelQueueItem: (
    id: string,
  ) => void

  cancelAllUploads: () => void

  pauseQueueItem: (
    id: string,
  ) => void

  resumeQueueItem: (
    id: string,
  ) => void

  pauseAllUploads: () => void

  schedulerPaused: boolean

  setSchedulerPaused: (
    paused: boolean,
  ) => void

}

export const useUploadStore =
  create<UploadStore>((set) => ({
    sessionId: null,

    files: [],

		uploadQueue: [],

    loading: false,

    schedulerPaused: false,

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
    
    setSchedulerPaused: (
      schedulerPaused,
    ) =>
      set(() => ({
        schedulerPaused,
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
      
    cancelQueueItem: (
  id,
) =>
  set((state) => ({
    uploadQueue:
      state.uploadQueue.map(
        (item) => {
          if (
            item.id !== id
          ) {
            return item
          }

          item.abortController?.abort()

          return {
            ...item,
            status:
              'cancelled',
          }
        },
      ),
  })),

  cancelAllUploads: () =>
    set((state) => {
      state.uploadQueue.forEach(
        (item) => {
          item.abortController?.abort()
        },
      )

      return {
        uploadQueue:
          state.uploadQueue.map(
            (item) =>
              item.status ===
              'completed'
                ? item
                : {
                    ...item,
                    status:
                      'cancelled',
                  },
          ),
      }
    }),

    pauseQueueItem: (
      id,
    ) =>
      set((state) => ({
        uploadQueue:
          state.uploadQueue.map(
            (item) => {
              if (
                item.id !== id
              ) {
                return item
              }

              item.abortController?.abort()

              return {
                ...item,
                status: 'paused',
              }
            },
          ),
      })),
    
    resumeQueueItem: (
      id,
    ) =>
      set((state) => ({
        schedulerPaused: false,

        uploadQueue:
          state.uploadQueue.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    status:
                      'pending',
                    error: undefined,
                  }
                : item,
          ),
      })),

    pauseAllUploads: () =>
      set((state) => {
        state.uploadQueue.forEach(
          (item) => {
            if (
              item.status ===
              'uploading'
            ) {
              item.abortController?.abort()
            }
          },
        )

        return {
          schedulerPaused: true,

          uploadQueue:
            state.uploadQueue.map(
              (item) =>
                item.status ===
                'uploading'
                  ? {
                      ...item,
                      status:
                        'paused',
                    }
                  : item,
            ),
        }
      }),
    
  }))