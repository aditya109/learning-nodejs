# Enhancing Node Performance

----

## How to improve Node Performance?

1. Use Node in *Cluster* Mode  [Recommended]
2. Use *Worker Threads*              [Experimental]

## 

### Normal NodeJS Server Flow

`Request 👉  Single Thread(Node Server) 👉 Response`

But what would happen if the server gets stuck on some really CPU-intensive stuff, i.e., which takes a long time to process. Let us see an example.

````js
const express = require('express');
const app = express();

function doWork(durations) {
        const start = Date.now();
        while (Date.now() - start < durations) { }
}

app.get('/', (req, res) => {
        doWork(5000);
        res.send("Hi there");
});

app.listen(3000);
````

1. Now start the server with `npm start`. 
2. Open *Network* tab under the *Inspect this Page* in the browser tab.
3. Hit [localhost:3000](http://localhost:3000) in a tab. 
4. Observe the *Network* time-graph.

You will find that the request which normally takes around 0.2-0.3 seconds, has taken over 5 secs. Now do the following.

1. Open 2 tabs and write the same endpoint at both places [localhost:3000](http://localhost:3000). 
2. Also open *Network* tab under the *Inspect this Page* in the second tab.
3. Hit enter in the first tab and quickly switch to second tab and hit enter there as well.
4. Now observe the *Network* time-graph.

You will observe that in the second tab, delay is longer. Now this is an issue, because we know our server would be serving to a lot of clients. Getting stuck overall is not an option.

### How clustering solves this issue ?

Essentially there is a clustering manager, which spins up multiple instances of single-threaded NodeJS servers (workers), and monitors the health of workers in the cluster.

Cluster Manager does not run app code, but is solely responsible for doing cluster admin tasks.

 `index.js` execution flowchart:

1.  In Normal condition: `RUN node index.js 👉 index.js 👉 Node Instance`

2. In Clustering condition:

   ````
   👇 RUN node index.js 
   👇 index.js							  👉 Worker instance
   👉 Cluster Manager 👉 cluster.fork() 👆
   ````

#### Blocking Process

```js
const app = require ("express")();

app.get("/isprime", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin","*")
    const jsonResponse = isPrime(parseInt(req.query.number))
    res.send(jsonResponse)
} )

app.listen(8081, ()=>console.log("Listening on 8081") )

function isPrime(number) {
    let startTime = new Date();
    let endTime = new Date();
    let isPrime = true;
    for (let i = 3; i < number; i ++)
    {   
        //it is not a prime break the loop,
        // see how long it took
        if (number % i === 0) 
        {
            endTime = new Date();
            isPrime = false;
            break;
        }
    }

    if (isPrime) endTime = new Date();

    return {
        "number" : number,
        "isPrime": isPrime,
        "time": endTime.getTime() - startTime.getTime()
        }

}

/*
2367949 (16 ms)
43686389 (200 ms)
93686687 (500 ms)
936868033(4 seconds)
29355126551 (very long time)

```











#### Implementing Clustering in a normal `express` app

The code would look like as follows:

```js
const cluster = require('cluster');

// is the file being executed in master mode 
if (cluster.isMaster) { 
        // cause index.js to executer *again* but in child mode
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
                doWork(5000);
                res.send("Hi there");
        });
        app.listen(3000);
}
```

Even with this setup, we are not going to get performance benefits. It works pretty much the same thing as before.

But interesting observation here is `cluster.fork()` creates a worker instance for the same node file. 

Let's try 

