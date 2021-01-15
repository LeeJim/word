let Word = require('./index');

new Word((resolve, reject) => {
    resolve(11);
}).then(console.log, e => {
    console.log('error', e);
}).then(console.log);