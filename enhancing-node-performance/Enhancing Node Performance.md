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
/** index.js */
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

The output is expected:

```
Hitting URL http://localhost:8081/isprime?number=2935512655 the API response is stuck, which is expected. 
But when URL http://localhost:8081/isprime?number=2367949  is hit simultaneously on another tab, the API response is delayed as well.
```

#### Solving the Problem by using `fork()`

We solve the problem by re-structuring `index.js` and decoupling the work-load off to another file `isPrime.js`, whilst using `fork()`.

```js
/** index.js */
const app = require("express")();
const {fork} = require("child_process");

app.get("/isprime", (req, res) => {
        const childProcess = fork('./isprime.js');
        childProcess.send({"number": parseInt(req.query.number)})
        childProcess.on("message", message => res.send(message))
})
app.listen(8081, () => console.log("Listening on 8081"))
```

 ```js
/** isPrime.js */
process.on("message", message => {
        const jsonResponse = isPrime(message.number);
        process.send(jsonResponse);
        process.exit();
})

function isPrime(number) {
        let startTime = new Date();
        let endTime = new Date();
        let isPrime = true;
        for (let i = 3; i < number; i++) {
                //it is not a prime break the loop,
                // see how long it took
                if (number % i === 0) {
                        endTime = new Date();
                        isPrime = false;
                        break;
                }
        }

        if (isPrime) endTime = new Date();

        return {
                "number": number,
                "isPrime": isPrime,
                "time": endTime.getTime() - startTime.getTime()
        }

}
 ```

The output is :

```
Hitting URL http://localhost:8081/isprime?number=2935512655 the API response is stuck, which is expected. 
But when URL http://localhost:8081/isprime?number=2367949  is hit simultaneously on another tab, the API response took ~16-20ms.
```

##### Another example of `fork()`:

```js
const http = require('http');
const port = parseInt(process.argv[2] || 3000);

const options = [
        "recent hay using lake determine cry audience sell since ice accept human judge stuck cost bite beauty lost church recently quick tried completely spendRandom",
        "range making simple just difference advice clothes cause cookies pack halfway expression anything large aloud till man foot magic done fierce army giving regular",
        "easily upper seeing trade join space tide mountain clearly walk paragraph sure he building time brought foreign bring relationship train give basket uncle rope",
        "floor away task construction tent grade driver red alphabet lunch sang minute result planet large month bent figure ever here steady must very structure",
        "vertical sang imagine cent behind provide refer hole whenever solution person horn send straw among drop indicate fairly organization these control split clear saved",
        "avoid apart upper habit many tea double curve whistle allow heat hurry event practice problem warm nothing suppose goes serious fog bark prize production"
]

const server = http.createServer((req, res) => {
        const randomIndex = Math.floor(Math.random() * options.length)
        const payload = JSON.stringify({
                port,
                processID: process.pid,
                advise: options[randomIndex]
        })
        res.writeHead(200, {
                'Content-Type': 'application/json'
        });
        res.end(payload);
})

server.listen(port);
console.log(`advise service running on port ${port}`);

```

The output here :

Hitting http://localhost:3000 multiple times, each time `advise` changed, but `port` and `processID` remain same.

```json
{
    "port": 3000,
    "processID": 13576,
    "advise": "floor away task construction tent grade driver red alphabet lunch sang minute result planet large month bent figure ever here steady must very structure"
}
```

This is an issue because we want to be able to load-balance between multiple ports through single instance.

We can write another `index.js` to do this using `fork()`.

```js
const { fork } = require('child_process');

const processes = [
        fork('./fork', ['3001']),
        fork('./fork', ['3002']),
        fork('./fork', ['3003'])
];
console.log(`forked ${processes.length} processes`);
```

To run this here, we do `node .`

The output here:

Hitting http://localhost:3001, http://localhost:3002 and http://localhost:3003, each time `advise` changed, along with `port` and `processID` remain same.

Hitting http://localhost:3001:

```json
{
    "port": 3001,
    "processID": 7296,
    "advise": "range making simple just difference advice clothes cause cookies pack halfway expression anything large aloud till man foot magic done fierce army giving regular"
}
```

Hitting http://localhost:3002 :

```json
{
    "port": 3002,
    "processID": 6008,
    "advise": "floor away task construction tent grade driver red alphabet lunch sang minute result planet large month bent figure ever here steady must very structure"
}
```

Hitting http://localhost:3003 :

```json
{
    "port": 3003,
    "processID": 2708,
    "advise": "floor away task construction tent grade driver red alphabet lunch sang minute result planet large month bent figure ever here steady must very structure"
}
```

#### Implementing Clustering in a normal `express` app

The code would look like as follows:

```js
/** app.js */
const cluster = require('cluster');
const cpus = require('os').cpus();
const http = require('http');
let cpus_pid = [];

if (cluster.isMaster) {
        console.log("this is Master process : ", process.pid);
        for (let i = 0; i < cpus.length; i++) {
                cluster.fork();

        }
} else {
        http.createServer((req, res) => {
                if (cpus_pid.includes(process.pid)) { }
                else {
                        cpus_pid.push(process.pid);
                }
                console.log(cpus_pid);
                res.end(`${cpus_pid}`);
        }).listen(3000);
}
```

Even with this setup, we are not going to get performance benefits. It works pretty much the same thing as before.

But interesting observation here is `cluster.fork()` creates a worker instance for the same node file, which allows server to serve for other API endpoints.

## Architecting Zero Downtime

Taking the code from above, let's modify it a bit.

```js
// zero-downtime.js
const cluster = require('cluster');
const cpus = require('os').cpus();
const http = require('http');
let cpus_pid = [];

if (cluster.isMaster) {
        console.log("this is Master process : ", process.pid);
        for (let i = 0; i < cpus.length; i++) {
                cluster.fork();
        }
        cluster.on('exit', worker => {
                console.log(`worker process ${process.pid} had died.`);
                console.log(`only ${Object.keys(cluster.workers).length} workers remaining`)
        })
} else {
        console.log(`started a worker at ${process.pid}`);
        http.createServer((req, res) => {
                res.end(`process: ${process.pid}`);
                if(req.url === `/kill`) {
                        process.exit();
                } else if (req.url === `/`) {
                        console.log(`serving from ${process.pid}`);
                }
                res.end(`${cpus_pid}`);
        }).listen(3000);
}
```

Let's observe the output:

On running `node zero-downtime.js` we get:

```
this is Master process :  14324
started a worker at 14556
started a worker at 12564
started a worker at 8980
started a worker at 11300
started a worker at 9412
started a worker at 6272
started a worker at 9512
started a worker at 16832
started a worker at 7768
started a worker at 2924
started a worker at 15892
started a worker at 2300
```

When URL http://localhost:3000 is hit, it displays:

```
serving from 2300
```

If we hit http://localhost:3000/kill, the console log says:

```
worker process died.
only 11 workers remaining
```

If we now hit [localhost:3000](http://localhost:3000/), the console log says:

```
serving from 15892
```

But what would happen if we keep killing the process:

```
worker process died.
only 11 workers remaining
serving from 15892
worker process died.
only 10 workers remaining
worker process died.
only 9 workers remaining
worker process died.
only 8 workers remaining
worker process died.
only 7 workers remaining
worker process died.
only 6 workers remaining
worker process died.
only 5 workers remaining
worker process died.
only 4 workers remaining
worker process died.
only 3 workers remaining
worker process died.
only 2 workers remaining
worker process died.
only 1 workers remaining
worker process died.
only 0 workers remaining
/// ----->>> The server shuts down
```

It is as expected, the server shuts down or exits because it has no active workers to actually run the code.

But this does not solve our zero downtime question, right? Let's fix it:

```js
const cluster = require('cluster');
const cpus = require('os').cpus();
const http = require('http');
let cpus_pid = [];

if (cluster.isMaster) {
        console.log("this is Master process : ", process.pid);
        for (let i = 0; i < cpus.length; i++) {
                cluster.fork();
        }
        cluster.on('exit', worker => {
                console.log(`worker process ${process.pid} had died.`);
                // console.log(`only ${Object.keys(cluster.workers).length} workers remaining`)
                console.log(`starting new worker`); // <-- addition
                cluster.fork(); // <-- addition
        })
} else {
        console.log(`started a worker at ${process.pid}`);
        http.createServer((req, res) => {
                res.end(`process: ${process.pid}`);
                if (req.url === `/kill`) {
                        process.exit();
                } else if (req.url === `/`) {
                        console.log(`serving from ${process.pid}`);
                }
                res.end(`${cpus_pid}`);
        }).listen(3000);
}
```

Let's observe its output:

Taking the code from above, let's modify it a bit.

```js
// zero-downtime.js
const cluster = require('cluster');
const cpus = require('os').cpus();
const http = require('http');
let cpus_pid = [];

if (cluster.isMaster) {
        console.log("this is Master process : ", process.pid);
        for (let i = 0; i < cpus.length; i++) {
                cluster.fork();
        }
        cluster.on('exit', worker => {
                console.log(`worker process ${process.pid} had died.`);
                console.log(`only ${Object.keys(cluster.workers).length} workers remaining`)
        })
} else {
        console.log(`started a worker at ${process.pid}`);
        http.createServer((req, res) => {
                res.end(`process: ${process.pid}`);
                if(req.url === `/kill`) {
                        process.exit();
                } else if (req.url === `/`) {
                        console.log(`serving from ${process.pid}`);
                }
                res.end(`${cpus_pid}`);
        }).listen(3000);
}
```

Let's observe the output:

On running `node zero-downtime.js` we get:

```
this is Master process :  8744
started a worker at 15128
started a worker at 14256
started a worker at 3492
started a worker at 2744
started a worker at 14568
started a worker at 11804
started a worker at 4468
started a worker at 2376
started a worker at 8412
started a worker at 17264
started a worker at 17948
started a worker at 16864
```

When URL http://localhost:3000 is hit, it displays:

```
serving from 16864
```

If we hit http://localhost:3000/kill, the console log says:

```
worker process died.
starting new worker
started a worker at 15892
```

If we now hit [localhost:3000](http://localhost:3000/), the console log says:

```
serving from 15892
```

But what would happen if we keep killing the process:

```
worker process died.
starting new worker
started a worker at 15892
serving from 15892
serving from 15892
worker process died.
starting new worker
started a worker at 13072
worker process died.
starting new worker
started a worker at 7548
worker process died.
starting new worker
started a worker at 17708
worker process died.
starting new worker
started a worker at 10168
worker process died.
starting new worker
started a worker at 10644
/// ----->>> hence the server never shuts down
```

## `PM2`

The `PM2` is a process-manager.

To install `pm2` globally, we type `npm install pm2 --global`.

To demonstrate this, we take code from `fork()` section and put just two changes marked below.

```js
// app.js
const http = require('http');
const port = parseInt(process.argv[2] || 3000);

const options = [
        "recent hay using lake determine cry audience sell since ice accept human judge stuck cost bite beauty lost church recently quick tried completely spendRandom",
        "range making simple just difference advice clothes cause cookies pack halfway expression anything large aloud till man foot magic done fierce army giving regular",
        "easily upper seeing trade join space tide mountain clearly walk paragraph sure he building time brought foreign bring relationship train give basket uncle rope",
        "floor away task construction tent grade driver red alphabet lunch sang minute result planet large month bent figure ever here steady must very structure",
        "vertical sang imagine cent behind provide refer hole whenever solution person horn send straw among drop indicate fairly organization these control split clear saved",
        "avoid apart upper habit many tea double curve whistle allow heat hurry event practice problem warm nothing suppose goes serious fog bark prize production"
]

const server = http.createServer((req, res) => {
        const randomIndex = Math.floor(Math.random() * options.length)
        const advice = options[randomIndex];
        const payload = JSON.stringify({
                processID: process.pid,
                advice
        })
        console.log(`advice from ${process.pid}: ${advice}`);
        res.writeHead(200, {
                'Content-Type': 'application/json'
        });
        res.end(payload);
})

server.listen(3000);
console.log(`advice service running on port ${port}`);
```

We need to type `pm2 start app.js -i 3`. 

The output is this:

```
[PM2] Applying action restartProcessId on app [pm2](ids: [ 0, 1, 2 ])
[PM2] [pm2](1) ✓
[PM2] [pm2](0) ✓
[PM2] [pm2](2) ✓
[PM2] Process successfully started
⇆ PM2+ activated | Instance Name: DESKTOP-G0526TS-9687 | Dash: https://app.pm2.io/#/r/46kfdqlr0m0igim
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ pm2                │ cluster  │ 6    │ online    │ 0%       │ 33.2mb   │
│ 1  │ pm2                │ cluster  │ 10   │ online    │ 0%       │ 33.0mb   │
│ 2  │ pm2                │ cluster  │ 6    │ online    │ 0%       │ 33.1mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

And if we hit http://localhost:3000, we get:

```json
{"processID":32,"advice":"floor away task construction tent grade driver red alphabet lunch sang minute result planet large month bent figure ever here steady must very structure"}
```

Just browsing a few command of `pm2`, we could type `pm2 list`, we get:

```
⇆ PM2+ activated | Instance Name: DESKTOP-G0526TS-9687 | Dash: https://app.pm2.io/#/r/46kfdqlr0m0igim
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ pm2                │ cluster  │ 6    │ online    │ 0%       │ 28.7mb   │
│ 1  │ pm2                │ cluster  │ 10   │ online    │ 0%       │ 29.2mb   │
│ 2  │ pm2                │ cluster  │ 6    │ online    │ 0%       │ 28.8mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

To stop the instance, we type `pm2 stop pm2`.

```
[PM2] Applying action stopProcessId on app [pm2](ids: [ 0, 1, 2 ])
[PM2] [pm2](0) ✓
[PM2] [pm2](1) ✓
[PM2] [pm2](2) ✓
⇆ PM2+ activated | Instance Name: DESKTOP-G0526TS-9687 | Dash: https://app.pm2.io/#/r/46kfdqlr0m0igim
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ pm2                │ cluster  │ 6    │ stopped   │ 0%       │ 0b       │
│ 1  │ pm2                │ cluster  │ 10   │ stopped   │ 0%       │ 0b       │
│ 2  │ pm2                │ cluster  │ 6    │ stopped   │ 0%       │ 0b       │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

To delete the instance, we type `pm2 delete pm2`.

```
[PM2] Applying action deleteProcessId on app [pm2](ids: [ 0, 1, 2 ])
[PM2] [pm2](0) ✓
[PM2] [pm2](1) ✓
[PM2] [pm2](2) ✓
⇆ PM2+ activated | Instance Name: DESKTOP-G0526TS-9687 | Dash: https://app.pm2.io/#/r/46kfdqlr0m0igim
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

If we go `pm2 start app.js -i 0`, `pm2` actually opens the exact that many instances which the machine allows.

```
[PM2] Starting D:\Work\teaching myself\learning-nodejs\enhancing-node-performance\4\pm2\pm2.js in cluster_mode (0 instance)
[PM2] Done.
⇆ PM2+ activated | Instance Name: DESKTOP-G0526TS-9687 | Dash: https://app.pm2.io/#/r/46kfdqlr0m0igim
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.2mb   │
│ 1  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.1mb   │
│ 2  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.3mb   │
│ 3  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.2mb   │
│ 4  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.1mb   │
│ 5  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.3mb   │
│ 6  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.3mb   │
│ 7  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.3mb   │
│ 8  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.2mb   │
│ 9  │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.1mb   │
│ 10 │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.4mb   │
│ 11 │ pm2                │ cluster  │ 0    │ online    │ 0%       │ 33.2mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

`0` actually means number of CPUs (max CPUs). We can go negative as `-1`,` -2`, etc., which would mean `maxCPUs -1`,`maxCPUs-2`, etc.

If you want to reload `app.js` with  `PM2`, just type `pm2 reload app.js`

To get live monitoring, type `pm2 monit`.

## Databases

Let's see a sample code for logging the number of requests sent.

```js
// db.js
const http = require('http');

let requests = 0;

const server = http.createServer((req, res) => {
        if(req.url === '/') {
                requests++;
                console.log(`${process.pid} : ${requests}`);
                res.end(JSON.stringify(requests));
        } 
})

server.listen(3000);
console.log(`counting requests`);
```

If we ran a load test `npm run concurrently \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\"` on this server, the following result is observed. Pay close attention to 👈 marks.

```
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Target URL:          http://localhost:3000
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Max requests:        1000
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Concurrency level:   1
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Agent:               none
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Completed requests:  1000
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Total errors:        971   		👈
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Total time:          4.553130100000001 s
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Requests per second: 220
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Mean latency:        4.5 ms
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO Percentage of the requests served within a certain time
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO   50%      4 ms
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO   90%      5 ms
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO   95%      6 ms
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO   99%      8 ms
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO  100%      45 ms (longest request)
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO  100%      45 ms (longest request)
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO
[1] [Fri Jan 01 2021 16:46:11 GMT+0530 (India Standard Time)] INFO    -1:   971 errors 				👈 
[1] loadtest -n 1000 http://localhost:3000 exited with code 0
```

This is really bad as there is no <u>z-axis scaling</u> here. Let's try this with `pm2`.

```powershell
pm2 start db.js -i 3
```

```powershell
npm run concurrently \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\"
```

We get :

```
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Target URL:          http://localhost:3000
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Max requests:        1000
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Concurrency level:   1
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Agent:               none
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Completed requests:  1000
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Total errors:        0						👈
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Total time:          1.9676995 s
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Requests per second: 508
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Mean latency:        1.9 ms
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Percentage of the requests served within a certain time
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO   50%      1 ms
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO   90%      2 ms
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO   95%      2 ms
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO   99%      4 ms
[3] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO  100%      38 ms (longest request)
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Target URL:          http://localhost:3000
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Max requests:        1000
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Concurrency level:   1
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Agent:               none
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Completed requests:  1000
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Total errors:        0						👈
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Total time:          1.9884576999999999 s
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Requests per second: 503
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Mean latency:        1.9 ms
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO Percentage of the requests served within a certain time
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO   50%      1 ms
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO   90%      2 ms
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO   95%      3 ms
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO   99%      4 ms
[2] [Fri Jan 01 2021 16:54:18 GMT+0530 (India Standard Time)] INFO  100%      41 ms (longest request)
[3] loadtest -n 1000 http://localhost:3000 exited with code 0
```

But what if we have a database something like browser's' `localStorage`. We could use it to show to implement a shared instance of a database.

Let's install `node-localstorage`. 

Run `npm install --save node-localstorage`.

Create a folder `data` in the same location as `db.js`.

```
├───db.js
├───data
│   └───request                                                    👈 this is a simple file
├───node_modules
├───package-lock.json
└───package.json
```

Let's change the code now.

```js
// db.js
const http = require('http');
const { LocalStorage } = require('node-localstorage');

const db = new LocalStorage('./data');


const server = http.createServer((req, res) => {
        if(req.url === '/') {
                let requests = db.getItem('requests');
                db.setItem('requests', ++requests);
                console.log(`${process.pid} : ${requests}`);
                res.end(JSON.stringify(requests));
        } 
})

server.listen(3000);
console.log(`counting requests`);
```

 Let's try this with `pm2`.

```powershell
pm2 start db.js -i 10
```

```powershell
npm run concurrently \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\" \"loadtest -n 1000 http://localhost:3000\"
```

We get :

```
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Target URL:          http://localhost:3000
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Max requests:        1000
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Concurrency level:   1
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Agent:               none
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Completed requests:  1000
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Total errors:        302							👈
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Total time:          145.00103460000003 s
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Requests per second: 7
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Mean latency:        144.9 ms
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO Percentage of the requests served within a certain time
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO   50%      130 ms
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO   90%      215 ms
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO   95%      237 ms
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO   99%      482 ms
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO  100%      596 ms (longest request)
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO  100%      596 ms (longest request)
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO
[4] [Fri Jan 01 2021 17:10:32 GMT+0530 (India Standard Time)] INFO    -1:   302 errors								👈
[4] loadtest -n 1000 http://localhost:3000 exited with code 0
```

The reason for this is deadlock which happens when each instance competing for `LocalStorage` file called `data/request`.

### Horizontal Partitioning (Sharding)

The problem we saw can be solved by *sharding*.

Let's illustrate this problem once again.

First, we have `db.js` for managing storage using `node-localstorage`.

```js
// db.js
const { LocalStorage } = require('node-localstorage');

const db = new LocalStorage('data');

const loadDogs = () => JSON.parse(db.getItem("dogs") || '[]');

function hasDog(name) {
        return loadDogs().map(dog => dog.name).includes(name);
}

module.exports = {
        addDog(newDog) {
                if (!hasDog(newDog.name)) {
                        let dogs = loadDogs();
                        dogs.push(newDog);
                        db.setItem("dogs", JSON.stringify(dogs, null, 2));
                }
        },

        findDogByName(name) {
                let dogs = loadDogs();
                return dogs.find(dog => dog.name === name);
        },

        findDogByColor(color) {
                let dogs = loadDogs();
                return dogs.filter(dog => dog.color === color);
        }
}
```

Let's use it in `index.js`.

```js
const db = require('./db')

db.addDog({ name: 'biscuit', color: 'orange' })
db.addDog({ name: 'jungle', color: 'black' })
db.addDog({ name: 'smokey', color: 'grey' })
db.addDog({ name: 'fancy feast', color: 'white' })
db.addDog({ name: 'peep', color: 'orange' })
db.addDog({ name: 'bread', color: 'orange' })

var biscuit = db.findDogByName('biscuit')
var orange_dogs = db.findDogByColor('orange')

console.log('biscuit: ', biscuit)
console.log('orange dogs: ', orange_dogs)
```

One running load test, it would deadlock into errors as seen above.

Let's try improve the above `db.js` by implementing *sharding*.

```js
const { LocalStorage } = require('node-localstorage')

const dbA = new LocalStorage('data-a-m')
const dbB = new LocalStorage('data-n-z')

const whichDB = name => name.match(/^[A-M]|^[a-m]/) ? dbA : dbB

const loadDogs = db => JSON.parse(db.getItem("dogs") || '[]')

const hasDog = name => loadDogs(whichDB(name))
    .map(dog => dog.name)
    .includes(name)

module.exports = {

    addDog(newDog) {
        if (!hasDog(newDog.name)) {
            let db = whichDB(newDog.name)
            let dogs = loadDogs(db)
            dogs.push(newDog)
            db.setItem("dogs", JSON.stringify(dogs, null, 2))
        }
    },

    findDogByName(name) {
        let db = whichDB(name)
        let dogs = loadDogs(db)
        return dogs.find(dog => dog.name === name)
    },

    findDogsByColor(color) {
        return [
            ...loadDogs(dbA).filter(dog => dog.color === color),
            ...loadDogs(dbB).filter(dog => dog.color === color)
        ]
    }

```

and just run the load test again, might result into possibly very few errors.

## Decomposing Services

We want to scale our app along z-axis of scale cube.

What do we do? We decompose it.

Let's try hands-on one such example.

```js
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { LocalStorage } = require('node-localstorage')

const localStorage = new LocalStorage('./data')

const loadShows = () => JSON.parse(localStorage.getItem('shows') || '[]')
const saveShows = shows => localStorage.setItem('shows', JSON.stringify(shows, null, 2))

const loadReservations = () => JSON.parse(localStorage.getItem('reservations') || '{}')
const saveReservations = reservations => localStorage.setItem('reservations', JSON.stringify(reservations, null, 2))

const app = express()
    .use(cors())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded())
    .put('/release-seats', (req, res) => {
        let show, count, shows = loadShows()
        if (!req.body.showID || !req.body.count) {
            res.status(500)
            return res.json({ error: 'A showID and count are required to release seats'})
        }
        count = parseInt(req.body.count)
        show = shows.find(s => s._id === req.body.showID)
        if (!show) {
            res.status(500)
            return res.json({ error: `Cannot find show with id: ${req.body.showID}`})
        }
        show.reserved -= count
        if (show.reserved < 0) {
            show.reserved = 0
        }
        saveShows(shows)
        res.json(show)
    })
    .put('/hold-seats', (req, res) => {
        let show, count, shows = loadShows()
        if (!req.body.showID || !req.body.count) {
            res.status(500)
            return res.json({ error: 'A showID and count are required to hold seats'})
        }
        count = parseInt(req.body.count)
        show = shows.find(s => s._id === req.body.showID)
        if (!show) {
            res.status(500)
            return res.json({ error: `Cannot find show with id: ${req.body.showID}`})
        }
        const remainingSeats = show.houseSize - show.reserved
        if (remainingSeats < count) {
            res.status(500)
            return res.json({ error: `cannot reserve ${count} seats. Only ${remainingSeats} remaining.`})
        }
        show.reserved += count
        saveShows(shows)
        res.json(show)
    })
    .delete('/cancel', (req, res) => {
        const reservations = loadReservations()
        const { showID, name } = req.body
        const reservation = reservations[showID].find(reservation => reservation.name === name)
        reservations[showID] = reservations[showID].filter(reservation => reservation.name !== name)
        saveReservations(reservations)
        res.json({ canceled: true, showID, ...reservation })
    })
    .post('/reserveTickets', (req, res) => {
        const reservations = loadReservations()
        const shows = loadShows()
        let count
        if (!req.body.count) {
            res.status(500)
            return res.json({ error: `A ticket count is required to reserve tickets.`})
        }
        if (!req.body.name) {
            res.status(500)
            return res.json({ error: `A name is required to reserve tickets.`})
        }
        count = parseInt(req.body.count)
        show = shows.find(s => s._id === req.body.showID)
        if (!show) {
            res.status(500)
            return res.json({ error: `Cannot find show with id: ${req.body.showID}`})
        }
        const remainingSeats = show.houseSize - show.reserved
        if (remainingSeats < count) {
            res.status(500)
            return res.json({ error: `cannot reserve ${count} seats. Only ${remainingSeats} remaining.`})
        }

        var list = reservations[req.body.showID]
        var reservation = { name: req.body.name, guests: req.body.count }
        if (!list) {
            reservations[req.body.showID] = []
        }
        reservations[req.body.showID].push(reservation)
        show.reserved += count
        saveReservations(reservations)
        saveShows(shows)
        res.json({ success: true, showID: req.body.showID, ...reservation})
    })
    .get('/reservations/:showID', (req, res) => {
        const reservations = loadReservations()
        res.json(reservations[req.params.showID] || [])
    })
    .get('/show/:id', (req, res) => {
        const shows = loadShows()
        const show = shows.find(show => show._id === req.params.id)
        res.json(show)
        console.log(`delivered show ${show.name}`)
    })
    .get('/', (req, res) => {
        const shows = loadShows()
        const reservations = loadReservations()
        res.json({shows, reservations})
        console.log('shows and reservations returned')
    })

app.listen(3000, () => console.log(`entire ticket system running on port 3000`))
```

Let's see our current file-structure.

```
├───data
│   └───reservations
|   └───shows
└───original-ticket-system.js
```

Hitting http://localhost:3000 gives the following:

```
{
    "shows": [
        {
            "_id": "5b805a00297ae6047030f2e0",
            "name": "yodeling Concert",
            "houseSize": 100,
            "reserved": 10
        },
        {
            "_id": "5b805a570cee1505a52bc75d",
            "name": "Shakespeare Play",
            "houseSize": 50,
            "reserved": 10
        },
        {
            "_id": "5b805a790cee1505a52bc75e",
            "name": "Food Poison Rally",
            "houseSize": 500,
            "reserved": 500
        }
    ],
    "reservations": {
        "5b805a00297ae6047030f2e0": [
            {
                "name": "WDJ",
                "guests": 3
            },
            {
                "name": "Eve",
                "guests": 7
            }
        ],
        "5b805a790cee1505a52bc75e": [
            {
                "name": "WDJ",
                "guests": 75
            },
            {
                "name": "Eve",
                "guests": 125
            },
            {
                "name": "Scooby",
                "guests": 50
            },
            {
                "name": "Jungle",
                "guests": 25
            },
            {
                "name": "Daryle",
                "guests": 25
            },
            {
                "name": "Cheryle",
                "guests": 100
            },
            {
                "name": "Meryle",
                "guests": 10
            },
            {
                "name": "Jones",
                "guests": 15
            },
            {
                "name": "Jinkins",
                "guests": 50
            },
            {
                "name": "Johanas",
                "guests": 20
            },
            {
                "name": "Jerry",
                "guests": 5
            }
        ]
    }
}
```

In order to decompose the service, we need to create a better file-structure. We can start by doing this:

```
├───data-reservations
|   └───reservations
├───data-shows
|   └───shows
├───reservations.js
└───shows.js
```

The `reservations.js` should look like this:

```js
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { LocalStorage } = require('node-localstorage')

const localStorage = new LocalStorage('./data-reservations')

const loadReservations = () => JSON.parse(localStorage.getItem('reservations') || '{}')
const saveReservations = reservations => localStorage.setItem('reservations', JSON.stringify(reservations, null, 2))

const app = express()
        .use(cors())
        .use(bodyParser.json())
        .use(bodyParser.urlencoded())
        .delete('/cancel', (req, res) => {
                const reservations = loadReservations()
                const { showID, name } = req.body
                const reservation = reservations[showID].find(reservation => reservation.name === name)
                reservations[showID] = reservations[showID].filter(reservation => reservation.name !== name)
                saveReservations(reservations)
                res.json({ canceled: true, showID, ...reservation })
        })
        .post('/reserveTickets', (req, res) => {
                const reservations = loadReservations()
                const shows = loadShows()
                let count
                if (!req.body.count) {
                        res.status(500)
                        return res.json({ error: `A ticket count is required to reserve tickets.` })
                }
                if (!req.body.name) {
                        res.status(500)
                        return res.json({ error: `A name is required to reserve tickets.` })
                }
                count = parseInt(req.body.count)
                show = shows.find(s => s._id === req.body.showID)
                if (!show) {
                        res.status(500)
                        return res.json({ error: `Cannot find show with id: ${req.body.showID}` })
                }
                const remainingSeats = show.houseSize - show.reserved
                if (remainingSeats < count) {
                        res.status(500)
                        return res.json({ error: `cannot reserve ${count} seats. Only ${remainingSeats} remaining.` })
                }

                var list = reservations[req.body.showID]
                var reservation = { name: req.body.name, guests: req.body.count }
                if (!list) {
                        reservations[req.body.showID] = []
                }
                reservations[req.body.showID].push(reservation)
                show.reserved += count
                saveReservations(reservations)
                saveShows(shows)
                res.json({ success: true, showID: req.body.showID, ...reservation })
        })
        .get('/reservations/:showID', (req, res) => {
                const reservations = loadReservations()
                res.json(reservations[req.params.showID] || [])
        })
        .get('/', (req, res) => {
                const reservations = loadReservations()
                res.json(reservations)
                console.log('reservations returned')
        })

app.listen(3002, () => console.log(`reservation service running on port 3002`))
```

The `shows.js` is :

```js
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { LocalStorage } = require('node-localstorage')

const localStorage = new LocalStorage('./data-shows')

const loadShows = () => JSON.parse(localStorage.getItem('shows') || '[]')
const saveShows = shows => localStorage.setItem('shows', JSON.stringify(shows, null, 2))

const app = express()
        .use(cors())
        .use(bodyParser.json())
        .use(bodyParser.urlencoded())
        .put('/release-seats', (req, res) => {
                let show, count, shows = loadShows()
                if (!req.body.showID || !req.body.count) {
                        res.status(500)
                        return res.json({ error: 'A showID and count are required to release seats' })
                }
                count = parseInt(req.body.count)
                show = shows.find(s => s._id === req.body.showID)
                if (!show) {
                        res.status(500)
                        return res.json({ error: `Cannot find show with id: ${req.body.showID}` })
                }
                show.reserved -= count
                if (show.reserved < 0) {
                        show.reserved = 0
                }
                saveShows(shows)
                res.json(show)
        })
        .put('/hold-seats', (req, res) => {
                let show, count, shows = loadShows()
                if (!req.body.showID || !req.body.count) {
                        res.status(500)
                        return res.json({ error: 'A showID and count are required to hold seats' })
                }
                count = parseInt(req.body.count)
                show = shows.find(s => s._id === req.body.showID)
                if (!show) {
                        res.status(500)
                        return res.json({ error: `Cannot find show with id: ${req.body.showID}` })
                }
                const remainingSeats = show.houseSize - show.reserved
                if (remainingSeats < count) {
                        res.status(500)
                        return res.json({ error: `cannot reserve ${count} seats. Only ${remainingSeats} remaining.` })
                }
                show.reserved += count
                saveShows(shows)
                res.json(show)
        })
        .get('/show/:id', (req, res) => {
                const shows = loadShows()
                const show = shows.find(show => show._id === req.params.id)
                res.json(show)
                console.log(`delivered show ${show.name}`)
        })
        .get('/', (req, res) => {
                const shows = loadShows()
                res.json(shows)
                console.log('shows returned')
        })

app.listen(3001, () => console.log(`shows service running on port 3001`))
```

We start each service differently.

```powershell
pm2 start reservations.js -i 2
```

```powershell
pm2 start shows.js -i 4
```

Now http://localhost:3001 hits the shows APIs and http://localhost:3002 hits the reservation APIs.

## Service Orchestration

Now we have two microservices, one being `shows` and other being `reservations`.

Let's try to write an `api.js` to orchestrate these two microservices.

```js
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fetch = require('node-fetch')

const getAllShows = () =>
    fetch('http://localhost:3001')
        .then(res => res.json())

const getShow = id =>
    fetch(`http://localhost:3001/${id}`)
        .then(res => res.json())

const holdSeats = (showID, count) =>
    fetch(`http://localhost:3001/hold-seats`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ count, showID })
    }).then(res => res.json())

const makeReservation = (name, count, showID) =>
    fetch(`http://localhost:3002`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, count, showID })
    }).then(res => res.json())

const app = express()
    .use(cors())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded())
    .post('/reserve', async (req, res) => {

        let count, show

        if (!req.body.count) {
            res.status(500)
            return res.json({ error: `A ticket count is required to reserve tickets.`})
        }

        if (!req.body.name) {
            res.status(500)
            return res.json({ error: `A name is required to reserve tickets.`})
        }

        // Parse the Count
        count = parseInt(req.body.count)

        // Lookup the Show
        show = await getShow(req.body.showID)

        if (!show) {
            res.status(500)
            return res.json({ error: `Cannot find show with id: ${req.body.showID}`})
        }

        const remainingSeats = show.houseSize - show.reserved

        if (remainingSeats < count) {
            res.status(500)
            return res.json({ error: `cannot reserve ${count} seats. Only ${remainingSeats} remaining.`})
        }

        // Hold Seats with Show Service
        console.log(`holding ${count} seats for ${req.body.name}`)
        await holdSeats(req.body.showID, count)

        // Make Reservation with Reservation Service
        console.log(`making the reservation for ${req.body.count}`);
        const reservation = await makeReservation(req.body.name, count, req.body.showID);

        res.json({ success: true, showID: req.body.showID, ...reservation})

    })
    .get('/', async (req, res) => {
        // Return a List of Shows Only
        console.log("requesting shows from show service");
        var shows = await getAllShows();
        res.json(shows);
    })

app.listen(3000, () => console.log(`Show Ticket API running for all clients`))
```

So in addition to `reservations.js` and `shows.js`, we have run `api.js`.

```powershell
pm2 start api.js -i 5
```



































