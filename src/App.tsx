import { Dropzone } from './components/Dropzone'
import { FileTree } from './components/FileTree'
import { ValidationSummary } from './components/ValidationSummary'

import { useUploadStore } from './store/uploadStore'

import { buildFileTree } from './utils/buildFileTree'

function App() {
  const files = useUploadStore(
    (state) => state.files,
  )

  const clearFiles = useUploadStore(
    (state) => state.clearFiles,
  )

  const loading =
  useUploadStore(
    (state) => state.loading,
  )

  const tree = buildFileTree(files)

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold">
            File Transfer MVP
          </h1>

          <p className="mt-2 text-slate-400">
            React migration prototype for upload
            validation.
          </p>
        </div>

        <Dropzone />

        {loading && (
          <div className="rounded bg-blue-600 p-4">
            Uploading files...
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={clearFiles}
            className="rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
          >
            Clear
          </button>
        </div>

        <ValidationSummary files={files} />

        <FileTree tree={tree} />
      </div>
    </div>
  )
}

export default App
