const Slitherbot = require('./index.js');

const bot = new Slitherbot();

const search = 'obama';
const start = 'https://github.com';

bot.on('crawl', (x) => console.log(x.count, x.url, x.toVisit.length));
console.log('searching for', search, 'from', start);
bot.search(start, search).then(console.log);
