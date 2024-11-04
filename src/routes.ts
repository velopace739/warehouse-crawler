import { createPlaywrightRouter, KeyValueStore } from 'crawlee';

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ page, enqueueLinks, request, log }) => {
  log.debug(`Enqueueing categories from page: ${request.url}`);

  await page.waitForSelector('.collection-block-item');
  await enqueueLinks({
    selector: '.collection-block-item',
    label: 'CATEGORY',
  });
});

router.addHandler('CATEGORY', async ({ page, enqueueLinks, request, log }) => {
  log.debug(`Enqueueing pagination for: ${request.url}`)
  await page.waitForSelector('.product-item > a');
  await enqueueLinks({
    selector: '.product-item > a',
    label: 'DETAIL',
  });

  const nextButton = await page.$('a.pagination__next');
  if (nextButton) {
    await enqueueLinks({
      selector: 'a.pagination__next',
      label: 'CATEGORY'
    });
  }
});

router.addHandler('DETAIL', async ({ request, page, log, pushData, saveSnapshot }) => {
  log.debug(`Extracting data: ${request.url}`);
  const urlPart = request.url.split('/').slice(-1); // ['sennheiser-mke-440-professional-stereo-shotgun-microphone-mke-440]
  const manufacturer = urlPart[0].split('-')[0]; // 'sennheiser'

  const title = await page.locator('.product-meta h1').textContent();
  const sku = await page.locator('span.product-meta__sku-number').textContent();

  const priceElement = page
    .locator('span.price')
    .filter({
      hasText: '$'
    })
    .first();

  const currentPriceString = await priceElement.textContent();
  const rawPrice = currentPriceString?.split('$')[1];
  const price = Number(rawPrice?.replace(/,/g, ''));

  const inStockElement = page
    .locator('span.product-form__inventory')
    .filter({
      hasText: 'In stock',
    })
    .first();

  const inStock = (await inStockElement.count()) > 0;

  const results = {
    url: request.url,
    manufacturer,
    title,
    sku,
    currentPrice: price,
    availableInStock: inStock,
  };

  log.debug(`Saving data: ${request.url}`)
  await pushData(results);

  // Crawler Utils Screenshot

  // Convert the URL into a valid key
  const key = request.url.replace(/[:/]/g, '_');
  
  // Crawler utils screenshot
  // await saveSnapshot({ key, saveHtml: false });

  // Page screenshot
  const screenshot = await page.screenshot();
  await KeyValueStore.setValue(key, screenshot, { contentType: 'image/png' });
})
