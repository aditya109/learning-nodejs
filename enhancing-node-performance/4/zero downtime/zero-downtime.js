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
                console.log(`worker process died.`);
                // console.log(`only ${Object.keys(cluster.workers).length} workers remaining`)
                console.log(`starting new worker`);
                cluster.fork();
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