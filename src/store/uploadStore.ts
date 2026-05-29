import { create } from "zustand";

import type { UploadRecord, UploadQueueItem } from "../types/upload";
import { clearSessionId } from "../utils/sessionStorage";
import { getSession, validateFileExtension } from "../api/uploadApi";
import { processUploads } from "../services/uploadOrchestrator";
import { toast } from "sonner";

interface UploadStore {
  sessionId: string | null;

  files: UploadRecord[];

  uploadQueue: UploadQueueItem[];

  loading: boolean;

  showCyberDisclaimer: boolean;

  setShowCyberDisclaimer: (show: boolean) => void;

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

  showCyberDisclaimer: false,

  setShowCyberDisclaimer: (showCyberDisclaimer) =>
    set(() => ({ showCyberDisclaimer })),

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
      for (const item of state.uploadQueue) {
        item.abortController?.abort();
      }

      return {
        sessionId: null,
        files: [],
        uploadQueue: [],
        showCyberDisclaimer: false,
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
    set((state) => {
      const target = state.uploadQueue.find((item) => item.id === id);

      target?.abortController?.abort();

      return {
        uploadQueue: state.uploadQueue.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "cancelled",
              }
            : item,
        ),
      };
    }),

  cancelAllUploads: () =>
    set((state) => {
      for (const item of state.uploadQueue) {
        item.abortController?.abort();
      }

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
          const fileName = item.file.name;

          const lastDot = fileName.lastIndexOf(".");

          const extension =
            lastDot > 0 ? fileName.slice(lastDot).toLowerCase() : "";

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

      if (!state.sessionId) {
        throw new Error("No active upload session");
      }

      const sessionId = state.sessionId;

      await processUploads({
        queue: state.uploadQueue,
        sessionId: sessionId,
        updateQueueItem: state.updateQueueItem,
      });

      const updatedSession = await getSession(sessionId);

      state.setFiles(updatedSession.files);

      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success(
        "File upload is successfully queued and will be processed shortly.",
      );

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
        item.validationState === "cyber" || item.validationState === "allowed",
    );

    if (cyberFiles.length === 0) return;

    try {
      state.setLoading(true);

      if (!state.sessionId) {
        throw new Error("No active upload session");
      }

      const sessionId = state.sessionId;

      await processUploads({
        queue: cyberFiles,
        sessionId: sessionId,
        updateQueueItem: state.updateQueueItem,
      });

      const updatedSession = await getSession(sessionId);

      state.setFiles(updatedSession.files);
      await new Promise((resolve) => setTimeout(resolve, 500));

      state.setShowCyberDisclaimer(true);
    } catch (error) {
      console.error(error);
    } finally {
      state.setLoading(false);
    }
  },
}));
