import { create } from "zustand";

import type { UploadRecord, UploadQueueItem } from "../types/upload";
import { clearSessionId, saveSessionId } from "../utils/sessionStorage";
import {
  createSession,
  getSession,
  validateFileExtension,
} from "../api/uploadApi";
import { processUploads } from "../services/uploadOrchestrator";

interface UploadStore {
  sessionId: string | null;

  files: UploadRecord[];

  uploadQueue: UploadQueueItem[];

  loading: boolean;

  setSessionId: (sessionId: string) => void;

  setFiles: (files: UploadRecord[]) => void;

  setLoading: (loading: boolean) => void;

  clearFiles: () => void;

  setUploadQueue: (queue: UploadQueueItem[]) => void;

  updateQueueItem: (id: string, updates: Partial<UploadQueueItem>) => void;

  retryQueueItem: (id: string) => void;

  cancelQueueItem: (id: string) => void;

  cancelAllUploads: () => void;

  startTransfer: () => Promise<void>;

  startCyberTransfer: () => Promise<void>;

  validateQueuedFiles: () => Promise<void>;

  removeUnapprovedFiles: () => void;

  resetTransferState: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  sessionId: null,

  files: [],

  uploadQueue: [],

  loading: false,

  setSessionId: (sessionId) =>
    set(() => ({
      sessionId,
    })),

  setFiles: (files) =>
    set(() => ({
      files,
    })),

  setLoading: (loading) =>
    set(() => ({
      loading,
    })),

  clearFiles: () => {
    clearSessionId();

    set((state) => {
      state.uploadQueue.forEach((item) => {
        item.abortController?.abort();
      });

      return {
        sessionId: null,
        files: [],
        uploadQueue: [],
      };
    });
  },

  setUploadQueue: (uploadQueue) =>
    set(() => ({
      uploadQueue,
    })),

  resetTransferState: () => {
    set({
      uploadQueue: [],
      loading: false,
      sessionId: null,
    });
  },

  updateQueueItem: (id, updates) =>
    set((state) => ({
      uploadQueue: state.uploadQueue.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item,
      ),
    })),

  retryQueueItem: (id) =>
    set((state) => ({
      uploadQueue: state.uploadQueue.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "pending",
              progress: 0,
              error: undefined,
            }
          : item,
      ),
    })),

  cancelQueueItem: (id) =>
    set((state) => ({
      uploadQueue: state.uploadQueue.map((item) => {
        if (item.id !== id) {
          return item;
        }

        item.abortController?.abort();

        return {
          ...item,
          status: "cancelled",
        };
      }),
    })),

  cancelAllUploads: () =>
    set((state) => {
      state.uploadQueue.forEach((item) => {
        item.abortController?.abort();
      });

      return {
        uploadQueue: state.uploadQueue.map((item) =>
          item.status === "completed"
            ? item
            : {
                ...item,
                status: "cancelled",
              },
        ),
      };
    }),

  removeUnapprovedFiles: () =>
    set((state) => ({
      uploadQueue: state.uploadQueue.filter(
        (item) => item.validationState !== "blocked",
      ),
    })),

  validateQueuedFiles: async () => {
    const state = useUploadStore.getState();

    if (state.uploadQueue.length === 0 || state.sessionId === null) {
      return;
    }

    try {
      state.setLoading(true);

      const validationResults = await Promise.all(
        state.uploadQueue.map(async (item) => {
          const extension = "." + item.file.name.split(".").pop()?.toLowerCase();

          const validation = await validateFileExtension(
            state.sessionId!,
            extension,
          );

          return {
            id: item.id,
            updates: {
              validationState: validation.state,
              validationMessage: validation.message,
            },
          };
        }),
      );

      for (const { id, updates } of validationResults) {
        state.updateQueueItem(id, updates);
      }
    } catch (error) {
      console.error(error);
    } finally {
      state.setLoading(false);
    }
  },

  startTransfer: async () => {
    const state = useUploadStore.getState();

    if (state.uploadQueue.length === 0) {
      return;
    }

    try {
      state.setLoading(true);

      const session = await createSession();

      state.setSessionId(session.id);
      saveSessionId(session.id);

      await processUploads({
        queue: state.uploadQueue,
        sessionId: session.id,
        updateQueueItem: state.updateQueueItem,
      });

      const updatedSession = await getSession(session.id);

      state.setFiles(updatedSession.files);

      await new Promise((resolve) => setTimeout(resolve, 500));

      queueMicrotask(() => {
        console.info("File upload is successfully queued and will be processed shortly.");
      });

      state.resetTransferState();
    } catch (error) {
      console.error(error);
    } finally {
      state.setLoading(false);
    }
  },

  startCyberTransfer: async () => {
    const state = useUploadStore.getState();

    // Prevent transfer if blocked files exist
    const hasBlocked = state.uploadQueue.some(
      (item) => item.validationState === "blocked",
    );

    if (hasBlocked) {
      console.warn("Blocked files present");

      return;
    }

   const cyberFiles = state.uploadQueue.filter(
      (item) =>
        item.validationState === "cyber" ||
        item.validationState === "allowed",
    );

    if (cyberFiles.length === 0) return;
    

    try {
      state.setLoading(true);

      const session = await createSession();

      state.setSessionId(session.id);

      saveSessionId(session.id);

      await processUploads({
        queue: cyberFiles,

        sessionId: session.id,

        updateQueueItem: state.updateQueueItem,
      });

      const updatedSession = await getSession(session.id);

      state.setFiles(updatedSession.files);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      queueMicrotask(() => {
        console.info("Cyber upload is successfully queued and will be processed shortly.");
      });

      state.resetTransferState();
    } catch (error) {
      console.error(error);
    } finally {
      state.setLoading(false);
    }
  },
}));
