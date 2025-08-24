import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getLeads, getLeadById, createLead, updateLead, deleteLead } from '../controllers/leadController.js';

const router = Router();

router.use(protect);

router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;
