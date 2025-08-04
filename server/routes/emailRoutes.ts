// routes/emailRoutes.ts
import express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  uploadExcel,
  sendTestEmail,
  sendBulkEmails,
} from '../controllers/emailController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ─── create uploads folder once ────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── multer config ────────────────────────────────────────────────────────────
const allowedMimeTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },          // 10 MB
  fileFilter: (_req, file, cb: multer.FileFilterCallback) => {
    const extOk  = /\.(xlsx|xls)$/i.test(file.originalname);
    const mimeOk = allowedMimeTypes.includes(file.mimetype);
    
    if (extOk && mimeOk) {
      cb(null, true);   // Accept the file
    } else {
      // Reject the file by passing an error
      const error = new Error('Only Excel files (.xlsx, .xls) are allowed') as any;
      cb(error, false);
    }
  },
});

// ─── router ────────────────────────────────────────────────────────────────────
const router = express.Router();

router.post('/upload', upload.single('file'), uploadExcel);
router.post('/send-test', sendTestEmail);
router.post('/send-bulk', sendBulkEmails);

export default router;
