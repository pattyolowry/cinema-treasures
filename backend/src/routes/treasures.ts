import express from 'express';
import treasureService from '../services/treasureService';
import { z } from "zod";
import { Response, Request, NextFunction } from 'express';
import { newTreasureSchema } from '../utils/schemas';
import middleware from '../utils/middleware';
import { NewTreasure, IdParams } from '../types';

const router = express.Router();

router.get('/', async (_req, res) => {
  const allTreasures = await treasureService.getAll();
  res.send(allTreasures);
});

const newTreasureParser = (req: Request, _res: Response, next: NextFunction) => {
  try {
    newTreasureSchema.parse(req.body);
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

router.post('/', newTreasureParser, middleware.userExtractor, async (req: Request<unknown, unknown, NewTreasure>, res: Response) => {
  try {
    const addedTreasure = await treasureService.addTreasure(req.body);
    res.json(addedTreasure);
  } catch (error: unknown) {
    let errorMessage = 'Something went wrong.';
    if (error instanceof Error) {
      errorMessage += ' Error: ' + error.message;
    }
    res.status(400).send({ "error": errorMessage});
  }
});

router.put('/:id', newTreasureParser, middleware.userExtractor, async (req: Request<IdParams, unknown, NewTreasure>, res: Response) => {
  try {
      const treasure = await treasureService.updateTreasure(req.params.id, req.body);
      res.json(treasure);
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
    await treasureService.deleteTreasure(req.params.id as string);
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