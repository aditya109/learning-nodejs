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