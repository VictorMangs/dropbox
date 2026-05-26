import { useDropzone } from 'react-dropzone'

import { useUploadStore } from '../store/uploadStore'

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
  const setUploadQueue =
    useUploadStore(
      (state) =>
        state.setUploadQueue,
    )

  const onDrop = (
    acceptedFiles: File[],
  ) => {
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
        }),
      )

    setUploadQueue(queue)
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