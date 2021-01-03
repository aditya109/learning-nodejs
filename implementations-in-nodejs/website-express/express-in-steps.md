# Express in Steps 🐾

To build a simple `express` node-app, we need to do as following.

First, create this file-structure within the app:

```
app
├───data
|   └───feedback.json
|   └───speakers.json
├───routes
|   └───index.js
|   └───feedback.js
|   └───speakers.js
├───services
|   └───FeedbackService.js
|   └───SpeakerService.js
├───package-lock.json
├───package.json
└───server.js
```

Giving a brief description of what each directory does,

- `data` - This folder serves as in-app database and as the name suggests `feedback.json` and `speakers.json` contains a list of `feedbacks` and `speakers` respectively.
  The contents of `feedback.json` is as follows:

  ```json
  [
    {
      "name": "wdj",
      "email": "wdj@gmail.com",
      "title": "WDJ TItltw",
      "message": "WDJ message"
    },
    {
      "name": "sdfg",
      "email": "sdfg@gmail.com",
      "title": "Home &amp; Kitchen",
      "message": "thids idfg kn sdfg"
    },
    {
      "name": "WDJ",
      "email": "wdj@gmail.com",
      "title": "some title",
      "message": "this is meesagee from postman"
    },
    {
      "name": "wdj",
      "email": "wdj@gmail.com",
      "title": "some title",
      "message": "Wdj was here"
    },
    {
      "name": "sdfg",
      "email": "sdfgsdfg@gmail.com",
      "title": "asdfgsdfg",
      "message": "sfdghdfghdfgh"
    },
    {
      "name": "willy winka",
      "email": "willy@aol.com",
      "title": "somw tilte",
      "message": "this is a message"
    },
    {
      "name": "Willy",
      "email": "test@test2.com",
      "title": "Final message",
      "message": "This page is finished now"
    },
    {
      "name": "Willy",
      "email": "test@test.com",
      "title": "SPA Feedback",
      "message": "This should now work"
    },
    {
      "name": "Willy",
      "email": "test@test.com",
      "title": "REST Title Test",
      "message": "This was sent via REST"
    },
    {
      "name": "Willy",
      "email": "test@test.com",
      "title": "This was very nice",
      "message": "I will come again next week!"
    },
    {
      "name": "Santa",
      "email": "santa@gmail.com",
      "title": "Best Meetup Ever",
      "message": "I really love this meetup. Please don't let it end."
    },
    {
      "name": "WDJ",
      "email": "wdj@gmail.com",
      "title": "Meeting Time",
      "message": "Would you consider moving the meeting time 30 minutes to about 6pm. It's tough to make it to the meetings on time right after work."
    },
    {
      "name": "Fred",
      "email": "fred-jones@gmail.com",
      "title": "Great Speaker",
      "message": "I really enjoyed the speaker this month. Would love to hear another presentation."
    }
  ]
  
  ```

  Similarly the contents of `speakers.json` is as follows:

  ```json
  {
          "speakers": [
            {
              "title": "Art in Full Bloom",
              "name": "WDJ",
              "shortname": "wdj",
              "summary": "Bacon ipsum dolor amet buffalo burgdoggen ribeye turkey kevin salami ground round pastrami pork belly filet mignon strip steak venison. Salami pastrami tenderloin pig cupim strip steak landjaeger frankfurter tongue. Meatball hamburger pig picanha landjaeger,",
              "description": "<p>Doner shank sausage fatback drumstick. Ham hock chuck landjaeger pork loin, cupim bresaola capicola flank t-bone brisket pig. Turducken shankle ham hock tail chuck sausage pork buffalo tenderloin rump ham andouille tongue beef ribs. Brisket tri-tip sirloin meatball turkey shoulder pancetta. Drumstick bacon sirloin pig ground round jerky fatback kielbasa boudin buffalo biltong. T-bone tri-tip ball tip ham, pancetta jowl short loin porchetta tenderloin shankle pastrami.</p>",
              "artwork": [
                "wdj_01_tn.jpg",
                "wdj_02_tn.jpg",
                "wdj_03_tn.jpg",
                "wdj_04_tn.jpg"
              ]
            },
            {
              "title": "Deep Sea Wonders",
              "name": "Santa Clause",
              "shortname": "santa_clause",
              "summary": "Bacon ipsum dolor amet buffalo burgdoggen ribeye turkey kevin salami ground round pastrami pork belly filet mignon strip steak venison. Salami pastrami tenderloin pig cupim strip steak landjaeger frankfurter tongue. Meatball hamburger pig picanha landjaeger,",
              "description": "<p>Doner shank sausage fatback drumstick. Ham hock chuck landjaeger pork loin, cupim bresaola capicola flank t-bone brisket pig. Turducken shankle ham hock tail chuck sausage pork buffalo tenderloin rump ham andouille tongue beef ribs. Brisket tri-tip sirloin meatball turkey shoulder pancetta. Drumstick bacon sirloin pig ground round jerky fatback kielbasa boudin buffalo biltong. T-bone tri-tip ball tip ham, pancetta jowl short loin porchetta tenderloin shankle pastrami.</p>",
              "artwork": [
                "santa_clause_01_tn.jpg",
                "santa_clause_02_tn.jpg",
                "santa_clause_03_tn.jpg",
                "santa_clause_04_tn.jpg"
              ]
            },
            {
              "title": "The Art of Abstract",
              "name": "Willy Wonka",
              "shortname": "wonka",
              "summary": "Bacon ipsum dolor amet buffalo burgdoggen ribeye turkey kevin salami ground round pastrami pork belly filet mignon strip steak venison. Salami pastrami tenderloin pig cupim strip steak landjaeger frankfurter tongue. Meatball hamburger pig picanha landjaeger,",
              "description": "<p>Doner shank sausage fatback drumstick. Ham hock chuck landjaeger pork loin, cupim bresaola capicola flank t-bone brisket pig. Turducken shankle ham hock tail chuck sausage pork buffalo tenderloin rump ham andouille tongue beef ribs. Brisket tri-tip sirloin meatball turkey shoulder pancetta. Drumstick bacon sirloin pig ground round jerky fatback kielbasa boudin buffalo biltong. T-bone tri-tip ball tip ham, pancetta jowl short loin porchetta tenderloin shankle pastrami.</p>",
              "artwork": [
                "wonka_01_tn.jpg",
                "wonka_02_tn.jpg",
                "wonka_03_tn.jpg",
                "wonka_04_tn.jpg",
                "wonka_05_tn.jpg",
                "wonka_06_tn.jpg"
              ]
            }
          ]
        }
  ```

- `routes` - This directory contains three files:

  - `index.js` which contains `\` index for all routes - `\feedback` and `\speakers`.
    - `feedback.js` which contains `\` and all related routes for `\feedback` path.
    - `speakers.js` which contains `\` and all related routes for `\speakers`path.

- `services` - This directory contains *CRUD* services for the `data` DB. It contains two files:

  - `FeedbackService.js` deals with `feedback.json`.
  - `SpeakerService.js` deals with `speakers.json`.

- `package.json` - This just contains two dependencies - `express` (`npm install --save express`) and `nodemon` (`npm install --save-dev nodemon`).
- `server.js` - This is the main app for our `express` server.

Let us start by creating `FeedbackService.js` and `SpeakerService.js`.

```js
// FeedbackService.js
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

/**
 * Logic for reading and writing feedback data
 */
class FeedbackService {
        /**
         * Constructor
         * @param {*} datafile Path to a JSOn file that contains the feedback data
         */
        constructor(datafile) {
                this.datafile = datafile;
        }

        /**
         * Get all feedback items
         */
        async getList() {
                const data = await this.getData();
                return data;
        }

        /**
         * Add a new feedback item
         * @param {*} name The name of the user
         * @param {*} title The title of the feedback message
         * @param {*} message The feedback message
         */
        async addEntry(name, email, title, message) {
                const data = (await this.getData()) || [];
                data.unshift({ name, email, title, message });
                return writeFile(this.datafile, JSON.stringify(data));
        }

        /**
         * Fetches feedback data from the JSON file provided to the constructor
         */
        async getData() {
                const data = await readFile(this.datafile, 'utf8');
                if (!data) return [];
                return JSON.parse(data);
        }
}

module.exports = FeedbackService;
```

```js
// SpeakerService.js
const fs = require('fs');
const util = require('util');

/**
 * We want to use async/await with fs.readFile - util.promisfy gives us that
 */
const readFile = util.promisify(fs.readFile);

/**
 * Logic for fetching speakers information
 */
class SpeakerService {
        /**
         * Constructor
         * @param {*} datafile Path to a JSOn file that contains the speakers data
         */
        constructor(datafile) {
                this.datafile = datafile;
        }

        /**
         * Returns a list of speakers name and short name
         */
        async getNames() {
                const data = await this.getData();

                // We are using map() to transform the array we get into another one
                return data.map(speaker => {
                        return { name: speaker.name, shortname: speaker.shortname };
                });
        }

        /**
         * Get all artwork
         */
        async getAllArtwork() {
                const data = await this.getData();

                // Array.reduce() is used to traverse all speakers and
                // create an array that contains all artwork
                const artwork = data.reduce((acc, elm) => {
                        if (elm.artwork) {
                                acc = [...acc, ...elm.artwork];
                        }
                        return acc;
                }, []);
                return artwork;
        }

        /**
         * Get all artwork of a given speaker
         * @param {*} shortname The speakers short name
         */
        async getArtworkForSpeaker(shortname) {
                const data = await this.getData();
                const speaker = data.find(elm => {
                        return elm.shortname === shortname;
                });
                if (!speaker || !speaker.artwork) return null;
                return speaker.artwork;
        }

        /**
         * Get speaker information provided a shortname
         * @param {*} shortname
         */
        async getSpeaker(shortname) {
                const data = await this.getData();
                const speaker = data.find(elm => {
                        return elm.shortname === shortname;
                });
                if (!speaker) return null;
                return {
                        title: speaker.title,
                        name: speaker.name,
                        shortname: speaker.shortname,
                        description: speaker.description,
                };
        }

        /**
         * Returns a list of speakers with only the basic information
         */
        async getListShort() {
                const data = await this.getData();
                return data.map(speaker => {
                        return {
                                name: speaker.name,
                                shortname: speaker.shortname,
                                title: speaker.title,
                        };
                });
        }

        /**
         * Get a list of speakers
         */
        async getList() {
                const data = await this.getData();
                return data.map(speaker => {
                        return {
                                name: speaker.name,
                                shortname: speaker.shortname,
                                title: speaker.title,
                                summary: speaker.summary,
                        };
                });
        }

        /**
         * Fetches speakers data from the JSON file provided to the constructor
         */
        async getData() {
                const data = await readFile(this.datafile, 'utf8');
                return JSON.parse(data).speakers;
        }
}

module.exports = SpeakerService;
```

We will import these services in our `server.js` and pass these to our routes.

```js
// server.js
const express = require('express');
const path = require('path');

const FeedbackService = require('./services/FeedbackService');
const SpeakerService = require('./services/SpeakerService');

const feedbackService = new FeedbackService('./data/feedback.json');
const speakerService = new SpeakerService('./data/speakers.json');

let routes = require('./routes');

const app = express();
const port = 3000;

app.use('/', routes({
        feedbackService,
        speakerService
}));

app.listen(port, () => {
        console.log(`Listening on port ${port}`);
})
```

Let's write our `index.js` so that it is extensible.

```js
// index.js

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
```

Now writing our routes `feedback.js` and `speakers.js`.

```js
// feedback.js

const express = require('express');
const router = express.Router();

module.exports = (params) => {
        const feedbackService = params.feedbackService;

        router.get('/', async (req, res) => {
                const feedbacks = await feedbackService.getList();
                return res.json(feedbacks);
        });
        
        router.post('/', (req, res) => {
                res.send('Feedback post sent');
        })
        return router;
}
```

```js
// speakers.js
const express = require('express');
const router = express.Router();

module.exports = (params) => {
        const { speakerService } = params;

        router.get('/', async (req, res) => {
                const speakers = await speakerService.getList();
                return res.json(speakers);
        });

        router.get('/:speaker', (req, res) => {
                res.send(`This is the details page for ${req.params.speaker}`);
        })
        return router;
}
```

At last, we need to make some changes to our `package.json`.

```json
{
  "name": "simple-express",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
    "dev": "nodemon --ignore feedback.json server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.6"
  }
}

```

Once you start with `npm run start`, the server should provide you with appropriate results.

Try hitting the following URLs:

- http://localhost:3000:

  ```
  Home
  ```

- http://localhost:3000/feedback:

  ```
  [{"name":"wdj","email":"wdj@gmail.com","title":"WDJ TItltw","message":"WDJ message"},{"name":"sdfg","email":"sdfg@gmail.com","title":"Home &amp; Kitchen","message":"thids idfg kn sdfg"},{"name":"WDJ","email":"wdj@gmail.com","title":"some title","message":"this is meesagee from postman"},{"name":"wdj","email":"wdj@gmail.com","title":"some title","message":"Wdj was here"},{"name":"sdfg","email":"sdfgsdfg@gmail.com","title":"asdfgsdfg","message":"sfdghdfghdfgh"},{"name":"willy winka","email":"willy@aol.com","title":"somw tilte","message":"this is a message"},{"name":"Willy","email":"test@test2.com","title":"Final message","message":"This page is finished now"},{"name":"Willy","email":"test@test.com","title":"SPA Feedback","message":"This should now work"},{"name":"Willy","email":"test@test.com","title":"REST Title Test","message":"This was sent via REST"},{"name":"Willy","email":"test@test.com","title":"This was very nice","message":"I will come again next week!"},{"name":"Santa","email":"santa@gmail.com","title":"Best Meetup Ever","message":"I really love this meetup. Please don't let it end."},{"name":"WDJ","email":"wdj@gmail.com","title":"Meeting Time","message":"Would you consider moving the meeting time 30 minutes to about 6pm. It's tough to make it to the meetings on time right after work."},{"name":"Fred","email":"fred-jones@gmail.com","title":"Great Speaker","message":"I really enjoyed the speaker this month. Would love to hear another presentation."}]
  ```

- http://localhost:3000/speakers:

  ```
  Home
  ```

- 

