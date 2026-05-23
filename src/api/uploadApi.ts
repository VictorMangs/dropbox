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

export async function uploadFile(
  sessionId: string,
  file: File,
  relativePath: string,
) {
  const formData = new FormData()

  formData.append('file', file)

  formData.append(
    'relativePath',
    relativePath,
  )

  const response = await fetch(
    `${API_BASE}/upload-sessions/${sessionId}/files`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!response.ok) {
    throw new Error(
      'Failed to upload file',
    )
  }

  return response.json()
}

export async function getSession(
  sessionId: string,
) {
  const response = await fetch(
    `${API_BASE}/upload-sessions/${sessionId}`,
  )

  if (!response.ok) {
    throw new Error(
      'Failed to fetch upload session',
    )
  }

  return response.json()
}