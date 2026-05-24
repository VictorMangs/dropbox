import axios from 'axios'

const API_BASE =
  'http://localhost:3000'

export async function createSession() {
  const response = await fetch(
    `${API_BASE}/upload-sessions`,
    {
      method: 'POST',
    },
  )

  if (!response.ok) {
    throw new Error(
      'Failed to create upload session',
    )
  }

  return response.json()
}

export async function uploadChunk(
  sessionId: string,

  fileId: string,

  chunk: Blob,

  chunkIndex: number,

  totalChunks: number,

  relativePath: string,

  onProgress?: (
    progress: number,
  ) => void,

  signal?: AbortSignal,
) {
  const formData =
    new FormData()

  formData.append(
    'chunk',
    chunk,
  )

  formData.append(
    'chunkIndex',
    chunkIndex.toString(),
  )

  formData.append(
    'totalChunks',
    totalChunks.toString(),
  )

  formData.append(
    'relativePath',
    relativePath,
  )

  formData.append(
    'fileId',
    fileId,
  )

  const response =
    await axios.post(
      `${API_BASE}/upload-sessions/${sessionId}/chunks`,
      formData,
      {
        signal,

        onUploadProgress: (
          event,
        ) => {
          if (
            !event.total
          ) {
            return
          }

          const progress =
            Math.round(
              (event.loaded /
                event.total) *
                100,
            )

          onProgress?.(
            progress,
          )
        },
      },
    )

  return response.data
}

