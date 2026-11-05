import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const target = 'deliverables/v3';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
try {
  const page = await browser.newPage();
  for (const [source, destination] of [
    ['design-statement', 's90_design_statement'],
    ['interaction-flow', 's90_interaction_flow'],
  ]) {
    await page.goto(pathToFileURL(`${target}/source/${source}.html`).href);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
      for (const section of document.querySelectorAll('.page')) {
        const footer = section.querySelector('footer');
        if (footer.previousElementSibling.getBoundingClientRect().bottom >= footer.getBoundingClientRect().top) {
          throw new Error('Document content overlaps the footer');
        }
      }
    });
    await page.pdf({ path: `${target}/${destination}.pdf`, printBackground: true, preferCSSPageSize: true, tagged: true });
  }
} finally {
  await browser.close();
}
