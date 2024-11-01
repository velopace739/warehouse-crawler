// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration, log } from 'crawlee';
import { router } from './routes.js';

log.setLevel(log.LEVELS.DEBUG);

const startUrls = ['https://warehouse-theme-metal.myshopify.com/collections'];

log.debug('Setting up crawler');
const crawler = new PlaywrightCrawler({
  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  requestHandler: router,
  // Comment this option to scrape the full website.
  maxRequestsPerCrawl: 50,
});

await crawler.run(startUrls);
