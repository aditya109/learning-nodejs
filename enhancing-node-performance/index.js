const cluster = require('cluster');

// is the file being executed in master mode 
if (cluster.isMaster) { 
        // cause index.js to executer *again* but in child mode
        cluster.fork();
        cluster.fork();
        cluster.fork();
        cluster.fork();
        cluster.fork();
        cluster.fork();
        cluster.fork();
}
else {
        // i am a child, going to act like a server and do nothing else
        const express = require('express');
        const app = express();

        function doWork(durations) {
                const start = Date.now();
                while (Date.now() - start < durations) { }
        }

        app.get('/', (req, res) => {
                doWork(15000);
                res.send("Hi there");
        });

        app.get('/fast', (req, res) => {
                res.send("⚡ This was fast !⚡")
        })

        app.listen(3000);

}