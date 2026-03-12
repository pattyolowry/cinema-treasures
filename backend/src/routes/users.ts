import express from 'express';
import userService from '../services/userService'

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.json(user)
    } catch (error: unknown) {
        let errorMessage = 'Something went wrong.';
        if (error instanceof Error) {
        errorMessage += ' Error: ' + error.message;
        }
        res.status(400).send({ "error": errorMessage});
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await userService.login(req.body);
        res.json(user)
    } catch (error: unknown) {
        let errorMessage = 'Something went wrong.';
        if (error instanceof Error) {
        errorMessage += ' Error: ' + error.message;
        }
        res.status(400).send({ "error": errorMessage});
    }
});

export default router;