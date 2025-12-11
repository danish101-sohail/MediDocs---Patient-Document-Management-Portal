import express from "express";
import {
  uploadDocument,
  getAllDocuments,
  downloadDocument,
  deleteDocument,
} from "./controller.js";
import {
  upload,
  handleMulterError,
  validateDocumentId,
  requestLogger,
} from "./middleware.js";

const router = express.Router();

// Document endpoints
// TODO: Add auth middleware (JWT) to protect these routes
router.post(
  "/documents/upload",
  requestLogger,
  upload.single("file"),
  handleMulterError,
  uploadDocument
);

router.get("/documents", requestLogger, getAllDocuments);

router.get(
  "/documents/:id",
  requestLogger,
  validateDocumentId,
  downloadDocument
);

router.delete(
  "/documents/:id",
  requestLogger,
  validateDocumentId,
  deleteDocument
);

export default router;
