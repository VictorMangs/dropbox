import { Dropzone } from "./components/Dropzone";
import { FileTree } from "./components/FileTree";
import { ValidationSummary } from "./components/ValidationSummary";

import { useUploadStore } from "./store/uploadStore";

import { buildFileTree } from "./utils/buildFileTree";

import { useEffect } from "react";

import { getSession } from "./api/uploadApi";

import { getSessionId, clearSessionId } from "./utils/sessionStorage";

import { UploadQueue } from "./components/UploadQueue";

function App() {
  const removeUnapprovedFiles = useUploadStore(
    (state) => state.removeUnapprovedFiles,
  );
  const uploadQueue = useUploadStore((state) => state.uploadQueue);
  const clearFiles = useUploadStore((state) => state.clearFiles);
  const loading = useUploadStore((state) => state.loading);
  const setFiles = useUploadStore((state) => state.setFiles);
  const setSessionId = useUploadStore((state) => state.setSessionId);
  const setLoading = useUploadStore((state) => state.setLoading);
  
  useEffect(() => {
    async function restoreSession() {
      const storedSessionId = getSessionId();

      if (!storedSessionId) {
        return;
      }

      try {
        setLoading(true);

        const session = await getSession(storedSessionId);
        
        if (!session?.id) {
          throw new Error("Invalid session response");
        }

        setSessionId(session.id);

        setFiles(session.files);
      } catch (error) {
        console.error("Failed to restore session", error);

        clearSessionId();
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const tree = buildFileTree(
    uploadQueue.map((item) => ({
      id: item.id,
      
      sessionId: "", 

      originalName: item.file.name,

      relativePath: item.relativePath,

      extension: item.file.name.substring(item.file.name.lastIndexOf(".")),

      storedPath: "",

      validationState: item.validationState ?? "allowed",

      validationMessage: item.validationMessage ?? "",

      messageId: 0,

      createdAt: item.createdAt,

      size: item.file.size,
    })),
  );

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold">File Transfer MVP</h1>

          <p className="mt-2 text-slate-400">
            React migration prototype for upload validation.
          </p>
        </div>

        <Dropzone />

        <div className="flex justify-end gap-2">
          <button
            onClick={clearFiles}
            className="rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
          >
            Clear
          </button>

          <button
            onClick={removeUnapprovedFiles}
            className="rounded bg-slate-700 px-4 py-2 hover:bg-slate-600"
          >
            Remove All Blocked Files
          </button>
        </div>

        <ValidationSummary uploadQueue={uploadQueue} />
        
        <UploadQueue />


        {loading && (
          <div className="rounded bg-blue-600 p-4">Uploading files...</div>
        )}

        <FileTree tree={tree} />
      </div>
    </div>
  );
}

export default App;
