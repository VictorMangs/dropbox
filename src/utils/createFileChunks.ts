import { CHUNK_SIZE } from '../constants/upload'

import type {
  UploadChunk,
} from '../types/upload'

function randomId() {
  return crypto.randomUUID()
}

export function createFileChunks(
  file: File,
): UploadChunk[] {
  const chunks: UploadChunk[] =
    []

  let chunkIndex = 0

  for (
    let start = 0;
    start < file.size;
    start += CHUNK_SIZE
  ) {
    const end = Math.min(
      start + CHUNK_SIZE,
      file.size,
    )

    const blob =
      file.slice(start, end)

    chunks.push({
      id: randomId(),

      chunkIndex,

      totalChunks: Math.ceil(
        file.size /
          CHUNK_SIZE,
      ),

      startByte: start,

      endByte: end,

      blob,

      progress: 0,

      status: 'pending',
    })

    chunkIndex += 1
  }

  return chunks
}
