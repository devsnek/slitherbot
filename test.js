const Slitherbot = require('./index.js');

const bot = new Slitherbot();

bot.on('crawl', console.log);

bot.search('https://google.com', 'obama').then(console.log);
