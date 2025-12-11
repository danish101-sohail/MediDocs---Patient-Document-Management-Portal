import documentModel from './models/document.model.js';
import fs from 'fs';

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a PDF file to upload'
      });
    }

    const { originalname, filename, path: filepath, size } = req.file;

    const document = await documentModel.create({
      original_filename: originalname, 
      filename,
      filepath,
      filesize: size
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        filename: document.original_filename,  
        filesize: document.filesize,
        created_at: document.created_at
      }
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Failed to upload document',
      message: 'An error occurred while processing your upload'
    });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    // TODO: Add pagination, search, and filters
    const documents = await documentModel.findAll();

    res.json({ documents });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Failed to fetch documents',
      message: 'An error occurred while retrieving documents'
    });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await documentModel.findById(id);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The requested document does not exist'
      });
    }

    const filePath = document.filepath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The document file is missing from storage'
      });
    }

    res.download(filePath, document.original_filename);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Failed to download document',
      message: 'An error occurred while preparing the download'
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await documentModel.findById(id);

    if (!document) {
      return res.status(404).json({
        error: 'Document not found',
        message: 'The requested document does not exist'
      });
    }

    // TODO: Check user permissions before allowing delete

    // Delete file from disk
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    // Delete from database
    await documentModel.delete(id);

    // TODO: For S3, delete from S3 bucket

    res.json({
      message: 'Document deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Failed to delete document',
      message: 'An error occurred while deleting the document'
    });
  }
};