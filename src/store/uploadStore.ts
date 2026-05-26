import { create } from 'zustand'

import type { UploadRecord, UploadQueueItem } from '../types/upload'
import { clearSessionId, saveSessionId } from '../utils/sessionStorage'
import { createSession, getSession } from '../api/uploadApi'
import { processUploads } from '../services/uploadOrchestrator'

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

  startTransfer: () => Promise<void>

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

  startTransfer: async () => {
    const state = useUploadStore.getState()
    
    if (state.uploadQueue.length === 0) {
      return
    }

    try {
      state.setLoading(true)

      const session =
        await createSession()

      state.setSessionId(session.id)
      saveSessionId(session.id)

      await processUploads({
        queue: state.uploadQueue,
        sessionId: session.id,
        updateQueueItem:
          state.updateQueueItem,
      })

      const updatedSession =
        await getSession(session.id)

      state.setFiles(
        updatedSession.files,
      )
    } catch (error) {
      console.error(error)
    } finally {
      state.setLoading(false)
    }
  },
    
  }))