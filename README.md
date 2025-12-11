# MediDocs - Patient Document Management Portal

A full-stack web application for managing medical documents (PDFs). Built with React, Node.js/Express, and SQLite.

## Features

- Upload PDF medical documents (drag & drop or file picker)
- View all uploaded documents in a clean table
- Download any document with original filename
- Delete documents with confirmation
- Modern, responsive UI with Tailwind CSS
- Real-time success/error notifications
- File size validation (10MB max)
- PDF-only file type validation
- IST timezone support for timestamps

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express
- Multer (file uploads)
- SQLite3
- CORS

## Project Structure

```
medidocs/
├── backend/
│   ├── server.js                  # Main server entry point
│   ├── routes.js                  # API route definitions
│   ├── controller.js              # Business logic & request handlers
│   ├── middleware.js              # Multer, validation, error handling
│   ├── models/
│   │   └── document.model.js      # Database operations
│   ├── uploads/                   # Stored PDF files (auto-created)
│   ├── medidocs.db               # SQLite database (auto-created)
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── App.jsx                # Main app component
    │   ├── main.jsx               # Entry point
    │   ├── index.css              # Tailwind styles
    │   └── components/
    │       ├── DocumentUpload.jsx # Upload form with drag & drop
    │       ├── DocumentList.jsx   # Documents table
    │       └── Alert.jsx          # Notification component
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## Architecture

The backend follows **MVC pattern** with separation of concerns:

- **Model** (`models/document.model.js`) - Database operations
- **Controller** (`controller.js`) - Business logic
- **Routes** (`routes.js`) - API endpoint definitions
- **Middleware** (`middleware.js`) - File upload, validation, error handling
- **Server** (`server.js`) - Application entry point

## Installation & Setup

### Prerequisites
- Node.js (v20.19.0 or higher)
- npm (v10.0.0 or higher)

### Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

```powershell
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### 1. Upload Document
```bash
POST /api/documents/upload
Content-Type: multipart/form-data

curl -X POST http://localhost:5000/api/documents/upload \-F "file=@prescription.pdf"
```

**Response (Success - 201):**
```json
{
  "message": "File uploaded successfully",
  "document": {
    "id": 1,
    "filename": "prescription.pdf",
    "filesize": 245678,
    "created_at": "2025-12-11 04:30:00"
  }
}
```

### 2. List All Documents
```bash
GET /api/documents

curl http://localhost:5000/api/documents
```

**Response (200):**
```json
{
  "documents": [
    {
      "id": 1,
      "filename": "prescription.pdf",
      "filesize": 245678,
      "created_at": "2025-12-11 04:30:00"
    }
  ]
}
```

### 3. Download Document
```bash
GET /api/documents/:id

curl http://localhost:5000/api/documents/1 --output document.pdf
```

Downloads the file with original filename.

### 4. Delete Document
```bash
DELETE /api/documents/:id

curl -X DELETE http://localhost:5000/api/documents/1
```

**Response (200):**
```json
{
  "message": "Document deleted successfully",
  "deletedId": "1"
}
```

## Testing the Application

### Using Postman

**Upload:**
- POST to `http://localhost:5000/api/documents/upload`
- Body → form-data
- Key: `file` (type: File)
- Value: Select a PDF file

**List:**
- GET to `http://localhost:5000/api/documents`

**Download:**
- GET to `http://localhost:5000/api/documents/1`
- Click "Send and Download"

**Delete:**
- DELETE to `http://localhost:5000/api/documents/1`

##  Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

### File Upload Limits

Edit middleware.js:
```javascript
limits: {
  fileSize: 10 * 1024 * 1024 // 10MB (modify as needed)
}
```

**Note:** Comments in the code highlight potential improvements and production-ready alternatives (e.g., AWS S3, authentication, pagination).
