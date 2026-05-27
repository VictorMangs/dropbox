import { uploadFile } from "../api/uploadApi";

import type { UploadQueueItem } from "../types/upload";

const MAX_RETRIES = 3;

function getDynamicConcurrency(queueSize: number) {
  if (queueSize <= 3) {
    return 1;
  }

  if (queueSize <= 10) {
    return 3;
  }

  if (queueSize <= 25) {
    return 4;
  }

  return 5;
}

function getPriorityWeight(priority: string) {
  switch (priority) {
    case "high":
      return 3;

    case "normal":
      return 2;

    case "low":
      return 1;

    default:
      return 0;
  }
}

function applyPriorityAging(item: UploadQueueItem) {
  const ageMs = Date.now() - new Date(item.createdAt).getTime();

  const ageMinutes = ageMs / 1000 / 60;

  if (ageMinutes > 5 && item.priority === "low") {
    return 2;
  }

  return getPriorityWeight(item.priority);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processSingleUpload(
  item: UploadQueueItem,
  sessionId: string,
  updateQueueItem: (id: string, updates: Partial<UploadQueueItem>) => void,
) {
  const abortController = new AbortController();

  updateQueueItem(item.id, {
    status: "uploading",
    error: undefined,
    abortController,
  });

  try {
    await uploadFile(
      sessionId,
      item.file,
      item.relativePath,

      (progress) => {
        updateQueueItem(item.id, {
          progress,
        });
      },

      abortController.signal,
    );

    updateQueueItem(item.id, {
      status: "completed",
      progress: 100,
    });
  } catch (error) {
    if (abortController.signal.aborted) {
      updateQueueItem(item.id, {
        status: "cancelled",

        error: "Upload cancelled",
      });

      return;
    }

    const retries = item.retryCount + 1;

    if (retries <= MAX_RETRIES) {
      updateQueueItem(item.id, {
        status: "pending",
        retryCount: retries,

        error: `Retrying upload (${retries}/${MAX_RETRIES})`,
      });

      await delay(retries * 1000);

      return;
    }

    updateQueueItem(item.id, {
      status: "failed",

      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
}

export async function processUploads({
  queue,
  sessionId,
  updateQueueItem,
}: {
  queue: UploadQueueItem[];
  sessionId: string;
  updateQueueItem: (id: string, updates: Partial<UploadQueueItem>) => void;
}) {
  const pendingQueue = queue
    .filter((item) => !["completed", "cancelled"].includes(item.status))
    .sort((a, b) => applyPriorityAging(b) - applyPriorityAging(a));

  let currentIndex = 0;

  async function worker() {
    while (currentIndex < pendingQueue.length) {
      const item = pendingQueue[currentIndex];

      currentIndex += 1;

      await processSingleUpload(item, sessionId, updateQueueItem);
    }
  }

  const workers = Array.from(
    {
      length: getDynamicConcurrency(pendingQueue.length),
    },
    () => worker(),
  );

  await Promise.all(workers);
}
