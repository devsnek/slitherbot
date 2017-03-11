const Slitherbot = require('./index.js');

const bot = new Slitherbot();

// bot.on('crawl', console.log);
console.log('searching for obama');
bot.search('https://google.com', 'obama').then(console.log);
