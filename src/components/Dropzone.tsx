import { useDropzone } from 'react-dropzone'

import { useUploadStore } from '../store/uploadStore'

import { createSession } from '../api/uploadApi'

import {
  processUploads,
} from '../services/uploadOrchestrator'

import {
  saveSessionId,
} from '../utils/sessionStorage'

import {
  createFileChunks,
} from '../utils/createFileChunks'

import type {
  UploadQueueItem,
} from '../types/upload'

declare module 'react' {
  interface InputHTMLAttributes<T>
    extends HTMLAttributes<T> {
    directory?: string

    webkitdirectory?: string
  }
}

export function Dropzone() {
  const setFiles = useUploadStore(
    (state) => state.setFiles,
  )

  const setSessionId =
    useUploadStore(
      (state) =>
        state.setSessionId,
    )

  const setLoading =
    useUploadStore(
      (state) =>
        state.setLoading,
    )

  const setUploadQueue =
    useUploadStore(
      (state) =>
        state.setUploadQueue,
    )

  const updateQueueItem =
    useUploadStore(
      (state) =>
        state.updateQueueItem,
    )
  
  const getQueueItem =
    useUploadStore.getState
  
  const getSchedulerPaused =
    () =>
      useUploadStore
        .getState()
        .schedulerPaused

  const onDrop = async (
    acceptedFiles: File[],
  ) => {
    try {
      setLoading(true)

      const session =
        await createSession()

      setSessionId(session.id)

      saveSessionId(session.id)

      const queue:
        UploadQueueItem[] =
        acceptedFiles.map(
          (file) => ({
            id:
              crypto.randomUUID(),

            file,

            relativePath:
              file.webkitRelativePath ||
              file.name,

            progress: 0,

            status: 'pending',

            priority: 'normal',

            createdAt: new Date().toISOString(),

            retryCount: 0,

            chunks: createFileChunks(file),
          }),
        )

      setUploadQueue(queue)

      await processUploads({
        queue,

        sessionId:
          session.id,

        updateQueueItem,

        setFiles,

        getQueueItem: (id) =>
          getQueueItem()
            .uploadQueue.find(
              (item) =>
                item.id === id,
            ),
        
        getSchedulerPaused,
        
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
  })

  return (
    <div
      {...getRootProps()}
      className="cursor-pointer rounded-lg border-2 border-dashed border-slate-600 p-12 text-center transition hover:border-blue-400"
    >
      <input
        {...getInputProps()}
        webkitdirectory="true"
        directory=""
        multiple
      />

      {isDragActive ? (
        <p>
          Drop files here...
        </p>
      ) : (
        <div>
          <p className="text-lg font-semibold">
            Drag and drop folders
            here
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Or click to browse
          </p>
        </div>
      )}
    </div>
  )
}