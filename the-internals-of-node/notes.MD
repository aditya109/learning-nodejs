# Internals of NodeJS

```
👇JavaScript Code We Write  

👇 NodeJS 

👉 V8(function to run the code outside the terminal) + libuv(C++ OSP which provides OS system function access like file system and networking, some parts of concurrency, etc.)
```

**Purpose of NodeJS** like why don't we directly use V8 and libuv

1.  With V8 (= 30% JS + 70% C++) and libuv (= 100% C++), NodeJS(50% JS + 50% C++) gives us interface in JS.
2. NodeJS provides us with a consistent API like *http*, *fs*, *crypto* and *path*.

## Module Implementation

1. Pick a function in Node standard library
2. Find where its implemented in the Node source code
3. See how V8 and libuv are used to implement that function

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





























