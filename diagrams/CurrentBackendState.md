# Backend Architecture Overview

This is a NestJS + Prisma-based upload validation backend with:

* Upload session management
* File upload handling via multipart/form-data
* Extension-based validation pipeline
* CSV-driven whitelist/message configuration
* Persistent upload/file metadata storage
* Local file storage abstraction
* Please run with `./start.ps1` or follow the commands in that file

---

# Backend Entry Points

## `backend/src/main.ts`

Bootstraps the NestJS application.

Responsibilities:

* Creates NestJS application instance
* Enables CORS for frontend communication
* Enables graceful shutdown hooks
* Starts HTTP server on port `3000`

---

## `backend/src/app.module.ts`

Root NestJS application module.

Responsibilities:

* Registers application modules
* Imports `UploadModule`

This is the top-level dependency container for the backend.

---

# Upload Module

## `backend/src/upload/upload.module.ts`

Primary feature module for upload functionality.

Responsibilities:

* Registers:

  * Upload controller
  * Upload service
  * Validation service
  * Prisma service
  * Storage service
  * Messages service

Acts as the composition root for upload-related business logic.

---

# Controllers

## `backend/src/upload/upload.controller.ts`

HTTP API controller for upload/session endpoints.

Responsibilities:

### Session endpoints

* `POST /upload-sessions`

  * Creates upload session

* `GET /upload-sessions/:id`

  * Retrieves session + uploaded files

---

### Validation endpoint

* `POST /upload-sessions/:id/validate`

  * Validates file extension
  * Rejects missing extensions

---

### Upload endpoint

* `POST /upload-sessions/:id/files`

  * Handles multipart uploads
  * Uses NestJS `FileInterceptor`
  * Extracts:

    * uploaded file
    * relative path metadata
  * Rejects malformed uploads

---

### Key concept

Controller layer is intentionally thin:

* validates request shape
* delegates business logic to services

---

# Core Services

## `backend/src/upload/upload.service.ts`

**Primary backend orchestration service**

Responsibilities:

---

### Session management

* `createSession()`

  * Creates DB upload session record

* `getSession()`

  * Fetches session with uploaded files
  * Sorts files by relative path

---

### Validation orchestration

* `validateExtension()`

  * Delegates extension checks to `ValidationService`
  * Resolves user-facing messages from `MessagesService`

* `resolveValidation()`

  * Combines:

    * validation state
    * message IDs
    * human-readable messages

---

### Upload pipeline

* `uploadFile()`

Core upload flow:

1. Verify upload session exists
2. Extract file extension
3. Validate extension
4. Save file contents via `StorageService`
5. Persist metadata in database via Prisma

Stored metadata includes:

* original filename
* relative path
* extension
* validation state
* validation message
* storage path

---

### Key concept

This service acts as the backend orchestration layer:

* coordinates validation
* storage
* persistence
* response shaping

---

## `backend/src/upload/validation.service.ts`

**Extension classification engine**

Responsibilities:

### CSV loading on startup

Loads:

* `AllowedFileTypes.csv`
* `CyberFileTypes.csv`

---

### Validation rule preparation

* Normalizes extensions
* Supports semicolon-separated values
* Ensures consistent lowercase + dot-prefixed extensions

---

### Validation logic

Classifies extensions into:

* `allowed`
* `cyber`
* `blocked`

Rules:

* Allowed list has highest precedence
* Cyber list excludes already-allowed extensions
* Unknown extensions become blocked

---

### Startup safety

Fails application startup if required CSV files are missing or empty.

---

### Key concept

This is a configuration-driven validation engine:

* behavior is controlled by CSV data rather than hardcoded rules

---

## `backend/src/messages/messages.service.ts`

**Validation message lookup service**

Responsibilities:

### CSV loading on startup

Loads `Messages.csv`

---

### Message registry construction

Builds in-memory message map:

* message ID
* type
* action
* message text

---

### Message retrieval

* `getMessage(id)`

Returns validation message metadata.

---

### Key concept

Separates validation classification from user-facing messaging.

This allows:

* configurable UI messaging
* future localization
* policy-driven responses

---

# Infrastructure Services

## `backend/src/prisma/prisma.service.ts`

Prisma database integration layer.

Responsibilities:

* Establishes Prisma DB connection on startup
* Disconnects cleanly during shutdown
* Exposes Prisma client to application services

---

### Key concept

Centralized database lifecycle management for NestJS dependency injection.

---

## `backend/src/common/csv.util.ts`

Shared CSV parsing utility.

Responsibilities:

* Reads CSV files from disk
* Parses CSV data using PapaParse
* Returns structured row objects

Used by:

* `ValidationService`
* `MessagesService`

---

# Storage Layer

## `backend/src/storage/storage.service.ts`

Abstracted file storage layer.

Responsibilities (inferred from usage):

* Persists uploaded file buffers
* Organizes storage by session/path
* Returns stored file location/path

---

### Key concept

Storage concerns are isolated from upload orchestration.

This abstraction allows future migration to:

* S3
* Azure Blob
* Network shares
* Object storage systems

without rewriting upload logic.

---

# Persistence Model

## Prisma-backed entities

The backend persists:

### UploadSession

Represents a transfer session.

Likely contains:

* session ID
* creation timestamp

---

### FileRecord

Represents uploaded file metadata.

Stores:

* session relationship
* original filename
* relative path
* extension
* storage path
* validation state
* validation message

---

# Validation System

## Validation States

The backend classifies files into:

* `allowed`

  * standard transfer permitted

* `cyber`

  * requires cyber-routed transfer

* `blocked`

  * transfer prohibited

---

## Message System

Validation results also map to:

* message IDs
* user-facing messages
* action types

This creates a policy-driven validation framework.

---

# Backend Request Flow

## Validation Flow

1. Frontend requests validation
2. Controller receives extension
3. `UploadService` calls `ValidationService`
4. Validation state resolved
5. Message lookup performed
6. Structured validation response returned

---

## Upload Flow

1. Frontend uploads multipart file
2. Controller intercepts file
3. `UploadService` validates extension
4. `StorageService` saves binary data
5. Prisma persists metadata
6. Upload record returned to frontend

---

# Backend System Design Summary

### Major architectural layers:

1. Controller Layer

   * HTTP endpoints
   * request validation

2. Orchestration Layer

   * UploadService
   * workflow coordination

3. Validation Layer

   * extension classification
   * policy resolution

4. Storage Layer

   * file persistence abstraction

5. Persistence Layer

   * Prisma ORM
   * database records

6. Configuration Layer

   * CSV-driven policy/message data

---

# Key Architectural Characteristics

## Configuration-driven validation

Validation behavior is externally configurable via CSVs.

---

## Thin controllers

Controllers delegate business logic to services.

---

## Service-oriented design

Responsibilities are separated into focused services.

---

## Upload session model

Uploads are grouped into persistent sessions.

---

## Storage abstraction

File persistence is isolated from business logic.

---

## Frontend/backend separation

Frontend owns:

* queue orchestration
* UI state
* concurrency logic

Backend owns:

* validation authority
* persistence
* storage
* policy enforcement
