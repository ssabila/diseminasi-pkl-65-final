const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  console.log('Navigating to http://localhost:5174 ...');
  // Wait until network is mostly idle
  await page.goto('http://localhost:5174', { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Wait a bit for mapbox to do its thing
  await new Promise(r => setTimeout(r, 4000));
  
  // Try to find the mapError div
  const errorText = await page.evaluate(() => {
    const errDiv = document.querySelector('div[style*="background: red"]');
    return errDiv ? errDiv.innerText : null;
  });
  
  if (errorText) {
    console.log('MAPBOX RED BOX ERROR:', errorText);
  } else {
    console.log('No red error box found.');
  }

  // Check if map container exists and has dimensions
  const mapStats = await page.evaluate(() => {
    const mapboxCanvas = document.querySelector('.mapboxgl-canvas');
    if (!mapboxCanvas) return 'No mapbox canvas found';
    const rect = mapboxCanvas.getBoundingClientRect();
    return `Canvas size: ${rect.width}x${rect.height}`;
  });
  console.log('Mapbox stats:', mapStats);
  
  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('Puppeteer Script Error:', err);
  process.exit(1);
});
