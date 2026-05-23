import { create } from 'zustand'

import type {
  UploadRecord,
} from '../types/upload'

interface UploadStore {
  sessionId: string | null

  files: UploadRecord[]

  loading: boolean

  setSessionId: (
    sessionId: string,
  ) => void

  setFiles: (
    files: UploadRecord[],
  ) => void

  setLoading: (
    loading: boolean,
  ) => void

  clearFiles: () => void
}

export const useUploadStore =
  create<UploadStore>((set) => ({
    sessionId: null,

    files: [],

    loading: false,

    setSessionId: (
      sessionId,
    ) =>
      set(() => ({
        sessionId,
      })),

    setFiles: (files) =>
      set(() => ({
        files,
      })),

    setLoading: (
      loading,
    ) =>
      set(() => ({
        loading,
      })),

    clearFiles: () =>
      set(() => ({
        sessionId: null,
        files: [],
      })),
  }))