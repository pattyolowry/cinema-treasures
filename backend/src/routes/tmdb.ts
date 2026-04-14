import express from 'express';
import tmdbService from '../services/tmdbService';
import middleware from '../utils/middleware';

const router = express.Router();

router.get('/search/movie', middleware.userExtractor, async (req, res) => {
    const query = req.query.query as string;
    const results = await tmdbService.searchMovie(query);
    res.send(results);
});

router.get('/movie/:id', middleware.userExtractor, async (req, res) => {
    const id = req.params.id as string;
    const movie = await tmdbService.getMovieDetails(id);
    res.send(movie);
});

export default router;