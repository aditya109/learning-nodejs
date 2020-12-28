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