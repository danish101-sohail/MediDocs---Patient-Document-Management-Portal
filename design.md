# MediDocs - Patient Document Management Portal
## Design Document
---

## 1. Tech Stack Choices

### Q1. Frontend Framework: React with Vite
**Why React + Vite :**
- React is component-based which makes it easy to split the UI into small pieces (upload form, file list, alerts).
- Lots of learning resources and community help - good for an entry-level developer.
- Vite gives very fast local development (quick reloads) and is simple to set up.

### Why Tailwind CSS?
- Utility-first CSS that makes building layouts fast.
- Less time writing custom CSS for a small UI.
- Easy responsive design (mobile + desktop) without heavy setup.

---

### Q2. Backend Framework: Node.js with Express
**Why Express :**
- Small and easy to learn for REST APIs.
- Good middleware ecosystem (e.g., `multer` for file uploads).
- JavaScript on backend means less context switching if frontend is React.

**Pattern used:** Lightweight MVC-like separation (routes, controllers, models). This keeps code organized even for small apps.

---

### Q3. Database: SQLite
**Why SQLite :**
- No server to install - good for local development and demo.
- Stores metadata in a single file, easy to inspect and back up.
- When the app grows, migrating to PostgreSQL is straightforward.

---

### Q4. If supporting 1,000+ users — simple, realistic changes

- **Database:** Move from SQLite to PostgreSQL (better for concurrent users).
- **File Storage:** Store files in cloud object storage (AWS S3) instead of local disk.
- **Scale app instances:** Run multiple backend instances behind a load balancer (e.g., Nginx or cloud load balancer).
- **Auth & security:** Add authentication (JWT) and TLS/HTTPS for secure uploads/downloads.
- **Performance:** Add pagination on `GET /documents` and use caching (Redis) for heavy reads.
- **Operational:** Add logging and monitoring (Sentry / basic metrics) and regular backups.

---

## 2. Architecture Overview

### Simple flow (what happens when you use the app)
```

[React Frontend]  <--HTTP-->  [Express Backend]  <--SQL-->  [SQLite DB]
|
+--> local disk: uploads/ (PDF files)

````

- Frontend (React) sends requests to backend (Express).
- Backend saves PDF binaries to `uploads/` and metadata (filename, size, time) to SQLite.
- Backend serves the files for download and handles delete requests.

### Components (what each file/part does)
- **Frontend**
  - Upload form (validates PDF)
  - List of documents (shows filename, size, date)
  - Buttons for download and delete
- **Backend**
  - `POST /api/documents/upload` — accepts uploaded PDF and stores metadata
  - `GET /api/documents` — returns list of document metadata
  - `GET /api/documents/:id` — streams the PDF back to the client
  - `DELETE /api/documents/:id` — deletes file and metadata
- **Database**
  - `documents` table stores id, original_filename, filename, path, size, created_at

---

## 3. API Specification

All metadata endpoints return JSON. Downloads return the raw PDF file.

---

### 1) Upload a document

* **POST** `/api/documents/upload`
* Request: `multipart/form-data` with field `file` (the PDF)
* Example `curl`:

```bash
curl -F "file=@prescription.pdf" http://localhost:5000/api/documents/upload
```

* Success (201):

```json
{
  "message": "File uploaded successfully",
  "document": {
    "id": 1,
    "original_filename": "prescription.pdf",
    "filesize": 245678,
    "created_at": "2025-12-11T04:30:00.000Z"
  }
}
```

* Errors: 400 for missing/wrong file type or too large; 500 for server error.

---

### 2) List all documents

* **GET** `/api/documents`
* Example `curl`:

```bash
curl http://localhost:5000/api/documents
```

* Success (200):

```json
{
  "documents": [
    { "id": 1, "original_filename": "prescription.pdf", "filesize": 245678, "created_at": "2025-12-11T04:30:00.000Z" }
  ]
}
```

---

### 3) Download a file

* **GET** `/api/documents/:id`
* Example:

```bash
curl http://localhost:5000/api/documents/1 --output prescription.pdf
```

* Success: Streams the PDF with headers such as:

  * `Content-Type: application/pdf`
  * `Content-Disposition: attachment; filename="prescription.pdf"`
* 404 if document or file is missing.

---

### 4) Delete a file

* **DELETE** `/api/documents/:id`
* Example:

```bash
curl -X DELETE http://localhost:5000/api/documents/1
```

* Success (200):

```json
{ "message": "Document deleted successfully", "deletedId": 1 }
```

* 404 if id not found.

---

## 4. Data Flow Description 

### Q5. Upload flow (step-by-step)

1. User picks a PDF and clicks upload in the React UI.
2. Frontend validates the file (checks `.pdf` extension and MIME) and sends it in a FormData POST to `/api/documents/upload`.
3. Backend uses `multer` to parse the multipart request.
4. Backend checks the file type is PDF and size ≤ 10 MB.
5. Backend generates a safe storage filename (timestamp + random), saves the file to `uploads/`.
6. Backend inserts a row into `documents` table with original filename, storage filename, path, filesize, and timestamp.
7. Backend responds with the saved metadata.
8. Frontend refreshes the document list and shows a success message.

### Download flow (step-by-step)

1. User clicks download on a file item.
2. Frontend issues `GET /api/documents/:id`.
3. Backend looks up metadata in SQLite.
4. Backend streams the file from `uploads/` using `res.download()` (or a stream) with `Content-Disposition`.
5. Browser starts the download.

### Delete flow (step-by-step)

1. User clicks delete and confirms.
2. Frontend sends `DELETE /api/documents/:id`.
3. Backend verifies the DB has the document.
4. Backend deletes the file from disk and removes the DB row.
5. Backend returns success and frontend updates the list.

---

## 5. Assumptions 

### Q6. Main assumptions

* **Single-user demo:** No authentication (as required).
* **File types:** Only PDF accepted; backend checks MIME and extension.
* **Max file size:** 10 MB (configurable).
* **Storage:** Files stored on local disk in `uploads/` for the demo.
* **Database:** SQLite file (sufficient for a demo/local use).
* **Concurrency:** Small scale — expected small number of concurrent uploads (SQLite is OK for that).
* **Security:** No encryption or antivirus scanning in the demo (not required for assignment). Note in real apps these are required.
* **Backups:** No automated backup — manual copy of the `.db` and `uploads/` is enough for demo purposes.

---

**End of design.md**
