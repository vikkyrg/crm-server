import Document from '../models/Document.js';
import { logAudit } from '../services/auditService.js';

export const getDocuments = async (req, res) => {
  try {
    const { category, relatedRecordId, search } = req.query;
    const query = { deletedAt: null };

    if (category) query.category = category;
    if (relatedRecordId) query.relatedRecordId = relatedRecordId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } }
      ];
    }

    const data = await Document.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocument = async (req, res) => {
  try {
    const data = await Document.findOne({ _id: req.params.id, deletedAt: null })
      .populate('createdBy', 'name email');
    if (!data) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import fs from 'fs';
import path from 'path';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip'
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const createDocument = async (req, res) => {
  try {
    const { 
      title, 
      category = 'General', 
      relatedRecordId, 
      fileUrl, 
      fileName, 
      fileType = 'application/pdf', 
      fileSizeBytes = 1024, 
      fileData, 
      version = 1 
    } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Document title is required' });
    }

    // Validate MIME type
    if (fileType && !ALLOWED_MIME_TYPES.includes(fileType.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid file type "${fileType}". Allowed types: PDF, PNG, JPG, WEBP, DOCX, XLSX, CSV, TXT, ZIP.` 
      });
    }

    // Validate size limit
    if (fileSizeBytes && Number(fileSizeBytes) > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({ 
        success: false, 
        message: `File size exceeds the 10MB limit. Provided size: ${(Number(fileSizeBytes) / (1024 * 1024)).toFixed(2)} MB.` 
      });
    }

    let finalFileUrl = fileUrl;
    let localFilePath = null;

    // Handle base64 file data upload to local disk storage
    if (fileData) {
      let base64Content = fileData;
      if (fileData.includes(';base64,')) {
        base64Content = fileData.split(';base64,')[1];
      }
      const buffer = Buffer.from(base64Content, 'base64');

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return res.status(400).json({ 
          success: false, 
          message: `Uploaded file size exceeds the 10MB limit.` 
        });
      }

      const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeName = (fileName || `${title}.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueFileName = `${Date.now()}_${safeName}`;
      localFilePath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(localFilePath, buffer);
      finalFileUrl = `/api/v1/documents/files/${uniqueFileName}`;
    }

    if (!finalFileUrl) {
      return res.status(400).json({ success: false, message: 'Either fileUrl or fileData is required' });
    }

    const data = await Document.create({
      title: title.trim(),
      category,
      relatedRecordId: relatedRecordId || undefined,
      fileUrl: finalFileUrl,
      fileName: fileName || `${title.trim()}.pdf`,
      fileType,
      fileSizeBytes: fileData ? Buffer.byteLength(fileData, 'base64') : (fileSizeBytes || 1024),
      localFilePath,
      version,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_DOCUMENT',
      module: 'Document',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, deletedAt: null });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document record not found' });
    }

    // If file is stored locally on disk
    if (document.localFilePath && fs.existsSync(document.localFilePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName || 'document.pdf'}"`);
      res.setHeader('Content-Type', document.fileType || 'application/octet-stream');
      return fs.createReadStream(document.localFilePath).pipe(res);
    }

    // If external or cloud URL
    if (document.fileUrl && (document.fileUrl.startsWith('http://') || document.fileUrl.startsWith('https://'))) {
      return res.redirect(document.fileUrl);
    }

    res.status(404).json({ success: false, message: 'Physical file not found on storage server' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const data = await Document.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Document not found' });

    // Clean up local disk file if exists
    if (data.localFilePath && fs.existsSync(data.localFilePath)) {
      try {
        fs.unlinkSync(data.localFilePath);
      } catch (err) {
        console.warn('Could not remove physical file:', err.message);
      }
    }

    await logAudit({
      userId: req.user?._id,
      action: 'DELETE_DOCUMENT',
      module: 'Document',
      recordId: data._id,
      req
    });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
