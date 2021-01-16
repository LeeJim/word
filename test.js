let Word = require('./index');


let p = new Word((resolve, reject) => {
    resolve(11);
})

p.then(console.log)
p.then(console.log)
p.then(console.log)
p.then(console.log)
