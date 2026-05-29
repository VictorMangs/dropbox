import { useDropzone } from "react-dropzone";

import { useUploadStore } from "../store/uploadStore";

import { createSession } from "../api/uploadApi";

import { saveSessionId } from "../utils/sessionStorage";

import type { UploadQueueItem } from "../types/upload";

declare module "react" {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;

    webkitdirectory?: string;
  }
}

export function Dropzone() {
  const setUploadQueue = useUploadStore((state) => state.setUploadQueue);

  const setSessionId = useUploadStore((state) => state.setSessionId);

  const validateQueuedFiles = useUploadStore(
    (state) => state.validateQueuedFiles,
  );
  
  const onDrop = async (acceptedFiles: File[]) => {
    try {
      const session = await createSession();

      setSessionId(session.id);
      saveSessionId(session.id);

      const queue: UploadQueueItem[] = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),

        file,

        relativePath: file.webkitRelativePath || file.name,

        progress: 0,

        status: "pending",

        priority: "normal",

        createdAt: new Date().toISOString(),

        retryCount: 0,

        validationState: "pending",
      }));

      setUploadQueue(queue);

      await validateQueuedFiles(queue);
    } catch (error) {
      console.error(error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

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
          <p className="text-lg font-semibold">Drag and drop folders here</p>

          <p className="mt-2 text-sm text-slate-400">Or click to browse</p>
        </div>
      )}
    </div>
  );
}
