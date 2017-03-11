const fetcher = require('node-fetcher');
const cheerio = require('cheerio');
const URL = require('url');
const version = require('./package.json').version;
const EventEmitter = require('events');

class Slitherbot extends EventEmitter {
  constructor() {
    super();
    this.toVisit = [];
    this.used = [];
    this.count = 0;
  }

  get _useragent() {
    return `slitherbot/${version} (Node.js/${process.version}, node-fetcher/${fetcher.version})`;
  }

  async search(start, search) {
    this.toVisit.push(start);
    while (this.toVisit.length) {
      this.count++;
      const url = this.toVisit.shift();
      const body = await fetcher.get(url)
        .set('User-Agent', this._useragent)
        .then(r => r.text)
        .catch(r => r);
      if (search && body.toLowerCase().includes(search.toLowerCase())) {
        return { hit: url, count: this.count, search, used: this.used };
      }
      const $ = cheerio.load(body);
      // this is super inefficient but i'm too lazy to make something better
      const links = Array.from($('a'))
        .filter(l => l.attribs && l.attribs.href)
        .map(l => URL.parse(l.attribs.href))
        .filter(u => u.host && ['https:', 'http:'].includes(u.protocol))
        .map(u => URL.format(u))
        .filter(l => !this.used.includes(l) && !this.toVisit.includes(l));
      this.toVisit.push(...links);
      this.used.push(url);
      if (this.listenerCount('crawl')) {
        this.emit('crawl', {
          count: this.count,
          url,
          used: this.used,
          toVisit: this.toVisit,
        });
      }
    }
    return { count: this.count, search, user: this.used };
  }

  crawl(start) {
    return this.search(start);
  }
}

// search for `trump` i suppose
// new Slitherbot().search('https://google.com', 'trump').then(console.log).catch(console.error);

module.exports = Slitherbot;
