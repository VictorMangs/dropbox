const STORAGE_KEY =
  'upload-session-id'

export function saveSessionId(
  sessionId: string,
) {
  localStorage.setItem(
    STORAGE_KEY,
    sessionId,
  )
}

export function getSessionId() {
  return localStorage.getItem(
    STORAGE_KEY,
  )
}

export function clearSessionId() {
  localStorage.removeItem(
    STORAGE_KEY,
  )
}