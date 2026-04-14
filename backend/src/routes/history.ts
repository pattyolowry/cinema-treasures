import express from 'express';
import historyService from '../services/historyService';
import { z } from "zod";
import { Response, Request, NextFunction } from 'express';
import { newLogEntrySchema } from '../utils/schemas';
import middleware from '../utils/middleware';
import { NewLogEntry } from '../types';

const router = express.Router();

router.get('/', async (_req, res) => {
  const fullHistory = await historyService.getHistory();
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

router.post('/', newLogEntryParser, middleware.userExtractor, async (req: Request<unknown, unknown, NewLogEntry>, res: Response) => {
  try {
    const addedEntry = await historyService.addEntry(req.body);
    res.json(addedEntry);
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong.';
    if (error instanceof Error) {
      errorMessage += ' Error: ' + error.message;
    }
    res.status(400).send({ "error": errorMessage});
  }
});

type IdParams = {
  id: string;
};

router.put('/:id', newLogEntryParser, middleware.userExtractor, async (req: Request<IdParams, unknown, NewLogEntry>, res: Response) => {
  try {
      const entry = await historyService.updateEntry(req.params.id, req.body);
      res.json(entry);
  } catch (error: unknown) {
      let errorMessage = 'Something went wrong.';
      if (error instanceof Error) {
        if (error.message === "Not found") {
          res.status(404).end();
        } else {
          errorMessage += ' Error: ' + error.message;
        }
      }
      res.status(400).send({ "error": errorMessage});
  }
});

router.delete('/:id', middleware.userExtractor, async (req, res) => {
  try {
    await historyService.deleteEntry(req.params.id as string);
    res.status(204).end();
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong.';
    if (error instanceof Error) {
      errorMessage += ' Error: ' + error.message;
    }
    res.status(400).send({ "error": errorMessage});
  }
});

router.use(errorMiddleware);

export default router;