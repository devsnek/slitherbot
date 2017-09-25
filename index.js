const request = require('snekfetch');
const cheerio = require('cheerio');
const URL = require('url');
const version = require('./package.json').version;
const EventEmitter = require('events');

class Slitherbot extends EventEmitter {
  get _useragent() {
    return `slitherbot/${version} (Node.js/${process.version}, snekfetch/${request.version})`;
  }

  async search(start, search) {
    const time = Date.now();
    const toVisit = [start];
    const used = [];
    let count = [];
    while (toVisit.length) {
      const url = toVisit.shift();
      if (used.includes(url)) continue;
      count++;
      const body = await request.get(url)
        .set('User-Agent', this._useragent)
        .then((r) => r.text)
        .catch((r) => r);
      if (typeof body !== 'string') continue;
      if (search && body.toLowerCase().includes(search.toLowerCase())) {
        return {
          body,
          used,
          count,
          search,
          start,
          time: Date.now() - time,
          hit: url,
        };
      }
      const $ = cheerio.load(body);
      // this is super inefficient but i'm too lazy to make something better
      const links = Array.from($('a'))
        .filter((l) => l.attribs && l.attribs.href)
        .map((l) => URL.parse(l.attribs.href))
        .filter((u) => u.host && ['https:', 'http:'].includes(u.protocol))
        .map((u) => URL.format(u))
        .filter((l) => !used.includes(l) && !toVisit.includes(l));
      toVisit.push(...links);
      used.push(url);
      if (this.listenerCount('crawl')) {
        this.emit('crawl', {
          start,
          count,
          url,
          used,
          toVisit,
          search,
          time: Date.now() - time,
        });
      }
    }
    return { count, search, used, time: Date.now() - time };
  }

  crawl(start) {
    return this.search(start);
  }
}

// search for `trump` i suppose
// new Slitherbot().search('https://google.com', 'trump').then(console.log).catch(console.error);

module.exports = Slitherbot;
