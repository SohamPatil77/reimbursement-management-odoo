import express from 'express';
import multer from 'multer';
import { submitExpense, getMyExpenses, getAllExpenses, ocrScan } from '../controllers/expenseController.js';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup Multer for memory storage on OCR, but disk storage for submit if we want URL
// Actually, let's just do memoryStorage for OCR, and disk for actual upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const uploadDisk = multer({ storage: storage });

const uploadMemory = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.post('/submit', uploadDisk.single('receipt'), submitExpense);
router.get('/my-expenses', getMyExpenses);
router.post('/ocr-scan', uploadMemory.single('receipt'), ocrScan);

// Admin only
router.get('/all', requireRoles(['admin']), getAllExpenses);

export default router;
