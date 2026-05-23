import { useDropzone } from 'react-dropzone'

import { useUploadStore } from '../store/uploadStore'


import {
  createSession,
  uploadFile,
  getSession,
} from '../api/uploadApi'

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
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


  const onDrop = async (
    acceptedFiles: File[],
  ) => {
    try {
      setLoading(true)

      const session =
        await createSession()

      setSessionId(session.id)

      for (const file of acceptedFiles) {
        const relativePath =
          file.webkitRelativePath ||
          file.name

        await uploadFile(
          session.id,
          file,
          relativePath,
        )
      }

      const hydratedSession =
        await getSession(session.id)

      setFiles(
        hydratedSession.files,
      )
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
        <p>Drop files here...</p>
      ) : (
        <div>
          <p className="text-lg font-semibold">
            Drag and drop folders here
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Or click to browse
          </p>
        </div>
      )}
    </div>
  )
}