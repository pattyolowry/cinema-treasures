import express from 'express';
import historyService from '../services/historyService'

const router = express.Router();

router.get('/', async (_req, res) => {
  const fullHistory = await historyService.getHistory()
  res.send(fullHistory);
});

router.post('/', async (req, res) => {
    const addedEntry = await historyService.addEntry(req.body)
    res.json(addedEntry)
})

export default router;