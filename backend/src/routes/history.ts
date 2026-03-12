import express from 'express';
import historyService from '../services/historyService'

const router = express.Router();

router.get('/', async (_req, res) => {
  const fullHistory = await historyService.getHistory()
  res.send(fullHistory);
});

export default router;