import express from 'express';
import historyService from '../services/historyService'
import { z } from "zod";
import { Response, Request, NextFunction } from 'express';
import { newLogEntrySchema } from '../utils/schemas'

const router = express.Router();

router.get('/', async (_req, res) => {
  const fullHistory = await historyService.getHistory()
  res.send(fullHistory);
});

const newLogEntryParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    newLogEntrySchema.parse(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

const errorMiddleware = (error: unknown, _req: Request, res: Response, next: NextFunction) => { 
  if (error instanceof z.ZodError) {
    res.status(400).send({ error: error.issues });
  } else {
    next(error);
  }
};

router.post('/', newLogEntryParser, async (req, res) => {
    const addedEntry = await historyService.addEntry(req.body)
    res.json(addedEntry)
})

router.use(errorMiddleware);

export default router;