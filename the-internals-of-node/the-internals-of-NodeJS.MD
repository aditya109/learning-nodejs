# Internals of NodeJS

```
👇JavaScript Code We Write  

👇 NodeJS 

👉 V8(function to run the code outside the terminal) + libuv(C++ OSP which provides OS system function access like file system and networking, some parts of concurrency, etc.)
```

**Purpose of NodeJS** like why don't we directly use `V8` and `libuv`

1.  With `V8` (= 30% JS + 70% C++) and `libuv` (= 100% C++), NodeJS(50% JS + 50% C++) gives us interface in JS.
2. NodeJS provides us with a consistent API like `http`, `fs`, `crypto` and `path`.

## Module Implementation

1. Pick a function in Node standard library
2. Find where its implemented in the Node source code
3. See how `V8` and `libuv` are used to implement that function

```
👇 JavaScript Code We Write 

👇 Node's JS lib folder in Node repo 

👇 process.binding() [connects JS and C++ functions] 

👇 V8[converts values between JS and C++ world] 

👇 Node's C++ Side (src folder in Node Repo)

👉 libuv
```

## NodeJS Threading

### Thread Scheduling

Let's say that there are 2 threads and Thread 1 is running currently :

Thread 1:

1. Read file from HD
2. Count number of letters in it

Thread 2:

1. Multiply 3x3

OS detects the I/O time lapse between 1 and 2 and holds up the Thread 1 and schedules Thread 2 for CPU time. This is scheduling.

### NodeJS Event Loop

Whenever we start a NodeJS program, the CPU runs one thread and within that it runs something called an **Event Loop**.

Every Node program runs a separate thread thereby running on a separate Event Loop.

#### Event Loop Simulation

```js
/**
 * Simulating Event Loop
 */

// node myFile.js

const pendingTimer = [];
const pendingOSTasks = [];
const pendingOperations = [];

// new timers, tasks, operations are recorded from myFile running
myFile.runContents();

function shouldContinue() {
        // Check one:    any pending setTimeout, setInterval, setImmediate?
        // Check two:    any pending OS tasks? (like server listening to port)
        // Check three:  any pending long-running operations? (Like fs module)      
        return pendingTimer.length || pendingOSTasks.length || pendingOperations.length;
}

// entire body executes in one `tick`
while (shouldContinue()) {
        // 1) node looks at pendingTimers and sees if any functions are ready at be called. setTimeout, setInterval
        // 2) node looks at pendingOSTasks and pendingOperations and calls relevant callbacks
    
        // 3) Pause execution. Continue when.....
        // - a new pendingOSTask is done
        // - a new pendingOperation is done
        // - a timer is about is complete
    
        // 4) look at pendingTimers. Call any setImmediate
        // 5) handle any `close` events. 
        ReadableStream.on('close', () => {
                console.log("Cleanup code");
        })

}

// exit back to terminal
```



#### Is Node Single Really Threaded?

**Answer: **

```
Node Event Loop 👉 Single Threaded

Some of Node Framework/Standard Library 👉 Not Single Threaded
```

Let's explain it using code:

```js
const crypto = require('crypto');

const start = Date.now();
crypto.pbkdf2("a", 'b', 100000, 512, 'sha512', () => {
        console.log('1:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 100000, 512, 'sha512', () => {
        console.log('2:', Date.now() - start);
});

```

The output given is:

```
1: 577
2: 587
```

**Conclusion**:

If Node were single-threaded....

Thread1: 

```
1. crypto.pbkdf2() 👉 ~0.5s
2. crypto.pbkdf2() 👉 ~0.5s
```

Total time of execution = 1s

i.e.,

from 0s to 0.5s, `crypto.pbkdf2() #1` should have executed and given its console output, then from 0.5s to 1s, `crypto.pbkdf2() #2` should have executed and given its console.

**BUT THIS <u>DID NOT</u> HAPPEN !!**

What happened was from 0s to 0.5s, both `crypto.pbkdf2() #1` and `crypto.pbkdf2() #2` executed and gave their outputs.

An explanation would be:

```
👇 JavaScript Code we write

👇 pbkdf2() Node's crypto module

👉 V8

👆 Node's C++ Side [libuv (Thread Pool)]
```

Computational Intensive tasks get offloaded to Thread Pool.

#### Thread-Pools with Multithreading

```js
const crypto = require('crypto');

const start = Date.now();
crypto.pbkdf2("a", 'b', 100000, 512, 'sha512', () => {
        console.log('1:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 100000, 512, 'sha512', () => {
        console.log('2:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 100000, 512, 'sha512', () => {
        console.log('3:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 100000, 512, 'sha512', () => {
        console.log('4:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 100000, 512, 'sha512', () => {
        console.log('5:', Date.now() - start);
});
```

The output is:

```
1: 560
3: 709
2: 775
4: 819
5: 1109           <---
```

From 0s to 0.819s, `crypto.pbkdf2() #1`, `crypto.pbkdf2() #2`, `crypto.pbkdf2() #3` and `crypto.pbkdf2() #4` are executed, the fifth call extended to 1.109s.

Do another experiment, we are just increasing the number of jobs and increased the number of iterations, and then tried observing the results.

 ```js
const crypto = require('crypto');

const start = Date.now();
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('1:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('2:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('3:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('4:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('5:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('6:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('7:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('8:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('9:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('10:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('11:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('12:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('13:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('14:', Date.now() - start);
});
 ```

The output is:

```
1: 5636
4: 6005
2: 6280
3: 6287    👈 cpu pause observed post this point     
5: 12049
6: 12298
7: 12474
8: 12790   👈 cpu pause observed post this point
9: 17744
11: 18123
10: 18385
12: 18609  👈 cpu pause observed post this point
13: 23204
14: 23428
```

Now the reason why this must have happened is when you imagine all 14 `crypto.pbkdf2()` calls posed within individual threads. Our CPU has limited amount of cores to run the threads and only a certain number of threads can be worked off within a set time frame. Hence once all our cores are full, the CPU actually has to paused before re-scheduling the next thread.

#### Changing Threadpool Size

We do that by using `process.env.UV_THREADPOOL_SIZE = 5`, **by default, it is set to 4.**

```js
process.env.UV_THREADPOOL_SIZE = 5;    /// <<<----

const crypto = require('crypto');

const start = Date.now();
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('1:', Date.now() - start);
});
crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
        console.log('2:', Date.now() - start);
});
```

FAQ ❓

- Can we use the threadpool for JS code or can only NodeJS functions use it? **YES**

- What functions in node standard library use the threadpool? **Depends on OS, all `fs` module function, some `crypto` stuff.**

- How does this threadpool stuff fit into the event loop? **Tasks running in the threadpool are the `pendingOperations`** **in our code example.**

  

### Explaining OS Operations

#### Libuv OS Delegations

Let's check how much time do we require to grab [google.com](google.com) via NodeJS.

```js
const https = require('https');

const start = Date.now();

https.request('https://www.google.com', res => {
        res.on('data', () => { });
        res.on('end', () => {
                console.log(Date.now() - start);
        });
}).end();
```

 The output is:

```
384
```

Let's change this code a bit. We will chain the number of function calls:

```js
const https = require('https');

const start = Date.now();

function doRequest() {
        https.request('https://www.google.com', res => {
                res.on('data', () => { });
                res.on('end', () => {
                        console.log(Date.now() - start);
                });
        }).end();
}
doRequest();
doRequest();
doRequest();
doRequest();
doRequest();
doRequest();
```

The output is:

```
376
383
389
391
396
402
```

A plausible explanation for this:

````
👇 JavaScript code we write

👇 pbkdf2() -- Node's crypto module

👉 V8

👆 libuv -- Node's C++ side

👆 OS async helpers
````

FAQ ❓

- What functions in Node Standard lib use the OS's async features? **Depends on OS, but almost everything related to OS.**
- How does this OS async stuff fit into the event loop? **Tasks using the underlying OS are reflected in our `pendingOSTasks` array.**

### Crazy Node Behavior

Let's try some crazy shit. Take a look below:

```js
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

const start = Date.now();

function doRequest() {
        https.request('https://www.google.com', res => {
                res.on('data', () => { });
                res.on('end', () => {
                        console.log(Date.now() - start);
                });
        }).end();
}

function doHash(t) {
        crypto.pbkdf2("a", 'b', 100000, 512, 'sha512', () => {
                console.log(t, ' Hash :', Date.now() - start);
        });
}

doRequest();

fs.readFile('multitask.js', 'utf8', () => {
        console.log('FS:', Date.now() - start);
})

doHash(1);
doHash(2);
doHash(3);
doHash(4);
```

The output observed is as follows:

```
402
4  Hash : 681
FS: 682
3  Hash : 705
1  Hash : 722
2  Hash : 729
```

Let's just see if reading from HDD actually takes 682 ms.

```js
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');

const start = Date.now();

function doRequest() {
        https.request('https://www.google.com', res => {
                res.on('data', () => { });
                res.on('end', () => {
                        console.log(Date.now() - start);
                });
        }).end();
}

function doHash(t) {
        crypto.pbkdf2("a", 'b', 100000, 512, 'sha512', () => {
                console.log(t, ' Hash :', Date.now() - start);
        });
}

doRequest();

fs.readFile('multitask.js', 'utf8', () => {
        console.log('FS:', Date.now() - start);
})

// doHash(1);
// doHash(2);
// doHash(3);
// doHash(4);
```

The output is:

```
FS: 28
412
```

As it can be seen, it is not so.

Explaining the former anomaly.
Well there is a specific observation which were made during this.

No matter how many times the former program is run, the following order is maintained.
- First Network call is made.
- Second atleast one hash is run.
- Followed by the file system call.
- Followed by the remaining hashes.

Actually, **Threadpool is used by `fs` module but `https` uses OS.**

Re-looking at the output, gives us a sort of picture:

```
402
4  Hash : 681
FS: 682
3  Hash : 705
1  Hash : 722
2  Hash : 729
```

So, the HTTP call resolved right away, but the rest took a while to complete. This is for the ones which were Threadpool dependent.

Let's understand what happens when we call `readFile()`.

```
👇 We call fs.readFile()

👇 Node gets some 'stats' on the file (requires HD access)

👇 HD accessed, stats returned						⬅ Big system pause observed here

👇 Node requests to read the file

👇 HD accessed, file contents streamed back to app	⬅ Big system pause observed here

👇 Node returns file contents to us
```

So the scheduling happens where the system pause is observed. `http` module call is done separately so the time of execution is independent of the scheduling.

Let's say that here there were 4 threads which were used.

Let us assume that `Thread #1` was performing `fs` task, so it sent a `stat-request` to HD, and is now waiting. So, since it was sitting *idle*, `crypto.pbkdf2 #4` was scheduled on it.

Meanwhile, `Thread #2`, `#3`, `#4` were performing `crypto.pbkdf2() #1`, `#2`and `#3` respectively. 

Now let's say that the `Thread #2` was finished with `crypto.pbkdf2() #1`, it will start to work on `fs` module left-over task, receiving the `stat-response` from HD.

Again, `Thread #2` goes idle, when the contents' streaming starts. Once streaming is complete, the `console.log()` is seen. Hence the above output:

```
402
4  Hash : 681
FS: 682
3  Hash : 705
1  Hash : 722
2  Hash : 729
```















