import express from 'express';
import { createUser, updateRole, createApprovalRule, getAllUsers, getApprovalRules } from '../controllers/adminController.js';
import { requireAuth, requireRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes are protected and require admin role
router.use(requireAuth, requireRoles(['admin']));

router.post('/create-user', createUser);
router.put('/update-role', updateRole);
router.post('/approval-rules', createApprovalRule);
router.get('/approval-rules', getApprovalRules);
router.get('/all-users', getAllUsers);

export default router;
