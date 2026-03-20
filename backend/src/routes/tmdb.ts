import express from 'express';
import tmdbService from '../services/tmdbService'

const router = express.Router();

router.get('/search/movie', async (req, res) => {
    const query = req.query.query as string
    const results = await tmdbService.searchMovie(query)
    res.send(results)
})

router.get('/movie/:id', async (req, res) => {
    const id = req.params.id;
    const movie = await tmdbService.getMovieDetails(id);
    res.send(movie)
})

export default router;