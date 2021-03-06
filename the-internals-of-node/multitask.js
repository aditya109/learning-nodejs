process.env.UV_THREADPOOL_SIZE = 7;
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
        crypto.pbkdf2("a", 'b', 1000000, 512, 'sha512', () => {
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