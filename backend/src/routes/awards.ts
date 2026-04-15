import express from 'express';
import awardService from '../services/awardService';
import User from '../models/user';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../utils/config';

const router = express.Router();

router.get('/', async (req, res) => {
    let visibleOnly = true;
    if (req.token) {
        const decodedToken = jwt.verify(req.token, config.JWT_SECRET) as JwtPayload;
        if (decodedToken.id) {
            const user = await User.findById(decodedToken.id);
            if (user) {
                visibleOnly = false;
            }
        }
    }

    const awards = await awardService.getAll(visibleOnly);


    res.send(awards);
});

export default router;