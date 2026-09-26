import express from 'express';
const router = express.Router();
router.get('/sales', (req, res) => res.json({ success: true, data: { revenue: 100000 }, errors: [] }));
export default router;