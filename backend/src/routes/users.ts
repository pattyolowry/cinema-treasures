import express from 'express';
import userService from '../services/userService'

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const user = await userService.login(req.body);
        res.json(user)
    } catch (error: unknown) {
        res.status(401).send({"error": "Invalid credentials"});
    }
});

export default router;