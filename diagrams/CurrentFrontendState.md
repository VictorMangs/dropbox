# Frontend Architecture Overview

This is a React + Zustand-based file upload system with:

* Folder drag-and-drop ingestion
* Pre-upload validation (allowed / cyber / blocked)
* Queue-based upload orchestration with concurrency + retries
* Session-backed persistence via backend API
* Please run with `./start.ps1` or follow the commands in that file
---

# Entry Points

## `src/main.tsx`

Bootstraps the React application.

* Mounts `<App />` into the DOM root
* Wraps the app in `StrictMode`
* Imports global CSS (`index.css`)

---

## `src/App.tsx`

**Primary application shell and orchestration layer**

Responsibilities:

* Restores persisted upload session from `sessionStorage`
* Fetches backend session state (`getSession`)
* Initializes Zustand store state (`files`, `sessionId`, `loading`)
* Builds file tree preview from upload queue (`buildFileTree`)
* Renders major UI sections:

  * Dropzone (file input)
  * Action buttons (Clear, Remove Blocked)
  * Validation summary
  * Upload queue (progress + controls)
  * File tree preview
* Handles session recovery failure cleanup


---

# Styling

## `src/index.css`

Global base styles:

* Imports Tailwind
* Sets global body styling (dark theme, font, layout)
* Applies box-sizing reset

---

# API Layer

## `src/api/uploadApi.ts`

All backend communication.

### Core responsibilities:

* Session lifecycle:

  * `createSession()`
  * `getSession(sessionId)`
* File upload:

  * `uploadFile()` (axios with progress + abort support)
* Validation:

  * `validateFileExtension()`

### Key characteristics:

* Mix of `fetch` and `axios`
* Supports upload progress streaming
* Supports cancellation via `AbortSignal`

---

# Core Components

## `src/components/Dropzone.tsx`

Handles file ingestion.

Responsibilities:

* Drag-and-drop folder/file upload (`react-dropzone`)
* Creates upload session
* Builds initial upload queue
* Stores queue in Zustand
* Triggers validation pipeline (`validateQueuedFiles`)

Key behavior:

* Supports folder upload via `webkitdirectory`
* Generates queue items with metadata (path, file, timestamps)

---

## `src/components/UploadQueue.tsx`

**Main upload control + monitoring dashboard**

Responsibilities:

* Start standard transfer (`startTransfer`)
* Start cyber transfer (`startCyberTransfer`)
* Cancel all uploads
* Render per-file upload state:

  * progress bars
  * status
  * priority selector
  * cancel controls
* Shows:

  * Overall progress
  * Scheduler metrics (pending/active/failed)
  * Summary counts


---

## `src/components/ValidationSummary.tsx`

Displays pre-upload validation results.

Responsibilities:

* Aggregates file validation states:

  * allowed
  * cyber
  * blocked
* Shows:

  * Global validation status banner
  * Counts per category
* Lists:

  * Blocked files
  * Cyber-routed files

---

## `src/components/FileTree.tsx`

Renders hierarchical file structure preview.

Responsibilities:

* Displays upload structure (folders/files)
* Handles empty state (“Upload Preview”)
* Delegates rendering to `FileNode`

---

## `src/components/FileNode.tsx`

Recursive tree node renderer.

Responsibilities:

* Displays file/folder icon
* Expand/collapse folders
* Hover interaction for tooltip
* Displays validation badge
* Recursive children rendering

Special behavior:

* “cyber” files get highlighted styling
* Tracks hover position for tooltip rendering

---

## `src/components/TreeTooltip.tsx`

Floating metadata tooltip for file nodes.

Responsibilities:

* Portal-based tooltip rendering (`document.body`)
* Smart positioning (avoids viewport overflow)
* Displays file metadata:

  * type, status, extension, size
  * validation messages
  * folder aggregates (counts)

---

## `src/components/ValidationBadge.tsx`

Small status indicator.

Responsibilities:

* Displays:

  * allowed (green)
  * cyber (cyan)
  * blocked (red)
* Pure presentational component

---

# State Management

## `src/store/uploadStore.ts`

**Central Zustand store (core business logic hub)**

### Stores:

* sessionId
* files (server-side records)
* uploadQueue (client queue)
* loading state

---

### Core responsibilities:

#### Queue management

* setUploadQueue
* updateQueueItem
* retryQueueItem
* cancelQueueItem
* cancelAllUploads

#### File lifecycle

* clearFiles (clears session + aborts uploads)
* removeUnapprovedFiles (filters blocked files)

#### Transfer orchestration

* startTransfer (standard upload pipeline)
* startCyberTransfer (filtered “cyber/allowed” pipeline)

#### Validation pipeline

* validateQueuedFiles (calls backend per file extension)

#### Session persistence

* save/restore sessionId via sessionStorage utilities

#### Reset logic

* resetTransferState

---

### Key  concept:

This store is both:

* state container
* orchestration controller (business logic lives here, not in components)

---

# Upload Engine

## `src/services/uploadOrchestrator.ts`

**Core concurrency + retry upload engine**

Responsibilities:

### Single upload execution

* `processSingleUpload()`

  * sets uploading state
  * streams progress updates
  * handles:

    * success → completed
    * cancel → aborted
    * retry logic (max 3 attempts)
    * failure → failed state

---

### Batch processing

* `processUploads()`

Features:

* Priority sorting with aging logic:

  * high > normal > low
  * old low-priority files get boosted
* Dynamic concurrency scaling:

  * 1–5 workers based on queue size
* Worker pool pattern (parallel async loops)


---

# Types

## `src/types/upload.ts`

Shared domain models:

* ValidationState:

  * allowed | cyber | blocked

* UploadStatus:

  * pending | uploading | completed | failed | cancelled

* UploadPriority:

  * high | normal | low

* UploadQueueItem:

  * client-side upload unit (File + metadata + runtime state)

* UploadRecord:

  * backend persisted file metadata

* UploadSession:

  * session container returned from backend

* TreeNode:

  * hierarchical representation for file explorer UI

---

# Key System Design Summary

### Flow of data:

1. Dropzone → creates UploadQueueItem[]
2. Store → holds queue + session
3. ValidationSummary → pre-flight classification
4. UploadQueue → executes transfer
5. UploadOrchestrator → runs concurrency engine
6. API → uploads + validates + sessions
7. FileTree → renders final structure

---
