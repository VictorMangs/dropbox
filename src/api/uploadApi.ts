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

export async function uploadFile(
  sessionId: string,
  file: File,
  relativePath: string,
  onProgress?: (
    progress: number,
  ) => void,

  signal?: AbortSignal,
) {
  const formData = new FormData()

  formData.append('file', file)

  formData.append(
    'relativePath',
    relativePath,
  )

  try {
		const response =
			await axios.post(
				`${API_BASE}/upload-sessions/${sessionId}/files`,
				formData,
				{
          signal,
					onUploadProgress: (
						progressEvent,
					) => {
						if (
							!progressEvent.total
						) {
							return
						}

						const progress =
							Math.round(
								(progressEvent.loaded /
									progressEvent.total) *
									100,
							)

						onProgress?.(progress)
					},
				},
			)

		return response.data
	} catch (error) {
		if (
			axios.isAxiosError(error)
		) {
			throw new Error(
				error.response?.data
					?.message ||
					'Upload failed',
			)
		}

		throw error
	}
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

export async function validateFileExtension(
  sessionId: string,
  extension: string,
) {
  const response = await fetch(
    `${API_BASE}/upload-sessions/${sessionId}/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extension,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(
      'Failed to validate file',
    )
  }

  return response.json()
}