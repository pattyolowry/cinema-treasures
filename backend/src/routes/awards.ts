import express from 'express';
import awardService from '../services/awardService'

const router = express.Router();

router.get('/', async (_req, res) => {
    const awards = await awardService.getAll()
    res.send(awards)
})

export default router;