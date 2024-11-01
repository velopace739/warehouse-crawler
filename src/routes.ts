import { createPlaywrightRouter } from 'crawlee';

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ page, enqueueLinks, log }) => {
  log.info(`enqueueing new URLs`);

  await page.waitForSelector('.collection-block-item');
  await enqueueLinks({
    selector: '.collection-block-item',
    label: 'CATEGORY',
  });
});

router.addHandler('CATEGORY', async ({ page, enqueueLinks }) => {
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

router.addHandler('DETAIL', async ({ request, page, log }) => {
  log.info(`Processing: ${request.url}`)
})
