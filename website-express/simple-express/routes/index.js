const express = require('express');
const router = express.Router();

const speakerRoute = require('./speakers')
const feedbackRoute = require('./feedback')

module.exports = (params) => {
        router.get('/', (req, res) => {
                res.send('Home');
        });
        router.use('/speakers', speakerRoute(params));
        router.use('/feedback', feedbackRoute(params));
        return router;
}