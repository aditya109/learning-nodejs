const express = require('express');
const path = require('path');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakersService');

const feedbackService = new FeedbackService('./data/feedback.json');
const speakersService = new SpeakersService('./data/speakers.json');

let routes = require('./routes');

const app = express();
const port = 3000;

app.use('/', routes({
        feedbackService,
        speakersService
}));

app.listen(port, () => {
        console.log(`Listening on port ${port}`);
})