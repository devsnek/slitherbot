const Slitherbot = require('./index.js');

const bot = new Slitherbot();

const search = 'node.js';

bot.on('crawl', (x) => console.log(x.count, x.url, x.toVisit.length));
console.log('searching for', search);
bot.search('https://google.com', search).then(console.log);
