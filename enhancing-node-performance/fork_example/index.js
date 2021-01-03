const { fork } = require('child_process');

const processes = [
        fork('./fork', ['3001']),
        fork('./fork', ['3002']),
        fork('./fork', ['3003'])
];

console.log(`forked ${processes.length} processes`);