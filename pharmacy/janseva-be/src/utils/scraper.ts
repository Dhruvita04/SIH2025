import puppeteer from 'puppeteer';

interface ProductDetails {
  highlights: string[];
  description: string;
  ingredients: string[];
  keyUses: string[];
  howToUse: string[];
  safetyInformation: string;
  additionalInformation: string[];
}

interface ScrapeResult {
  status: 'success' | 'error';
  data?: ProductDetails;
  message?: string;
}

export type { ProductDetails, ScrapeResult };

export const scrape = async (medicineName: string): Promise<ScrapeResult> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ]
  });

  const page = await browser.newPage();

  // Make browser look like a normal desktop Chrome
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36'
  );

  const searchUrl = `https://www.truemeds.in/search/${encodeURIComponent(medicineName)}`;

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for the first product image to appear (handle lazy-load too)
    const firstProductSelector = '#__next img[src*="ProductImage"], #__next img[data-src*="ProductImage"]';

    const found = await page.waitForSelector(firstProductSelector, { visible: true, timeout: 15000 });
    if (!found) {
      throw new Error(`No product image found for "${medicineName}"`);
    }

    await page.click(firstProductSelector);

    // Wait for product details
    await page.waitForSelector('div.jdmXTb .content', { visible: true, timeout: 15000 });

    const productDetails = await page.evaluate(() => {
      const stripHtmlClasses = (html: string): string => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const elements = temp.getElementsByTagName('*');
        for (const el of elements) {
          el.removeAttribute('class');
        }
        return temp.innerHTML;
      };

      const getProductHighlightFromHtml = (productHighlights: NodeListOf<Element>): string[] => {
        return Array.from(productHighlights).map(item => (item as HTMLElement).textContent?.trim() || '');
      };

      return {
        uses: document.querySelector('#uses .content-side-effects')?.innerHTML || null,
        directionForUse: document.querySelector('#directionforuse .content-side-effects')?.innerHTML || null,
        routeOfAdministration: document.querySelector('#routeofadministration .content-side-effects')?.innerHTML || null,
        sideEffects: document.querySelector('#sideeffects .content-side-effects')?.innerHTML || null,
        medActivity: document.querySelector('#medactivity .content-side-effects')?.innerHTML || null,
        precaution: document.querySelector('#precaution div')
          ? Array.from(document.querySelector('#precaution div').children).map(item => stripHtmlClasses((item as HTMLElement).innerHTML))
          : [],
        interactions: document.querySelector('#interactions div')
          ? Array.from(document.querySelector('#interactions div').children).map(item => stripHtmlClasses((item as HTMLElement).innerHTML))
          : [],
        dosageInformation: document.querySelector('#dosageinformation div')
          ? Array.from(document.querySelector('#dosageinformation div').children).map(item => stripHtmlClasses((item as HTMLElement).innerHTML))
          : [],
        storage: document.querySelector('#storage .content-side-effects')?.innerHTML || null,
        dietAndLifestyleGuidance: document.querySelector('#dietandlifestyleguidance .content-side-effects')?.innerHTML || null,
        highlights: getProductHighlightFromHtml(document.querySelectorAll('div[class*="jdmXTb"] .content ul li')) || [],
        description:
          (document.querySelector('#introduction + .content') as HTMLElement)?.innerText ||
          (document.querySelector('#productdescription .content-side-effects') as HTMLElement)?.innerText,
        ingredients: Array.from(document.querySelectorAll('#ingredients .content-side-effects ul li span') || []).map(item =>
          stripHtmlClasses((item as HTMLElement).innerHTML)
        ),
        keyUses: Array.from(document.querySelectorAll('#keyuses .content-side-effects ul li span') || []).map(item =>
          stripHtmlClasses((item as HTMLElement).innerHTML)
        ),
        howToUse: Array.from(document.querySelectorAll('#howtouse .content-side-effects ul li span') || []).map(item =>
          stripHtmlClasses((item as HTMLElement).innerHTML)
        ),
        safetyInformation: document.querySelector('#safetyinformation .content-side-effects')?.innerHTML
          ? stripHtmlClasses((document.querySelector('#safetyinformation .content-side-effects') as HTMLElement).innerHTML)
          : null,
        additionalInformation: document.querySelector('#additionalinformation div')
          ? Array.from(document.querySelector('#additionalinformation div').children)
              .slice(1)
              .map(item => stripHtmlClasses((item as HTMLElement).innerHTML))
          : [],
        composition: document.querySelector('.compositionDescription  a')?.innerHTML || null
      };
    });

    return {
      status: 'success',
      data: productDetails
    };
  } catch (error) {
    console.error('Error', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  } finally {
    await browser.close();
  }
};

// Example usage:
// scrape('Folviz Plus Tablet').then(console.log).catch(console.error);
