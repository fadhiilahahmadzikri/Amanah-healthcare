import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

function getRoutes(dir, baseRoute) {
  let routes = [];
  if (!fs.existsSync(dir)) return routes;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
        // Dynamic route - replace with a dummy ID (e.g., '1' or 'mock-id')
        routes.push(...getRoutes(path.join(dir, entry.name), `${baseRoute}/1`));
      } else if (!entry.name.startsWith('(') && !entry.name.startsWith('@')) {
        const fullRoute = `${baseRoute}/${entry.name}`;
        if (fs.existsSync(path.join(dir, entry.name, 'page.tsx')) || fs.existsSync(path.join(dir, entry.name, 'page.jsx'))) {
          routes.push(fullRoute);
        }
        routes.push(...getRoutes(path.join(dir, entry.name), fullRoute));
      } else {
        // Route groups like (auth) or parallel routes like @modal don't change URL
        routes.push(...getRoutes(path.join(dir, entry.name), baseRoute));
      }
    }
  }
  
  // Also check if current dir has page.tsx
  if (fs.existsSync(path.join(dir, 'page.tsx')) || fs.existsSync(path.join(dir, 'page.jsx'))) {
    if (!routes.includes(baseRoute)) {
      routes.push(baseRoute);
    }
  }
  
  return [...new Set(routes)];
}

const routes = getRoutes('./src/app/dashboard', '/dashboard');
console.log(`Found ${routes.length} routes to crawl:\n`, routes.join('\n '));

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('Browser launched!');
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];

  for (const route of routes) {
    console.log(`\nCrawling: ${route}`);
    let errors = [];
    
    const consoleHandler = msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore 404s for favicon or random things
        if (!text.includes('favicon.ico') && !text.includes('faker.image')) {
          errors.push(`Console Error: ${text}`);
        }
      }
    };
    
    const pageErrorHandler = error => {
      errors.push(`Page Error: ${error.message}`);
    };

    page.on('console', consoleHandler);
    page.on('pageerror', pageErrorHandler);

    try {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle', timeout: 15000 });
      
      // Wait for React to render
      await page.waitForTimeout(3000);
      
      // Look for Next.js overlay
      const hasNextjsError = await page.evaluate(() => {
        return !!document.querySelector('nextjs-portal') || document.body.innerText.includes('Runtime TypeError') || document.body.innerText.includes('Unhandled Runtime Error');
      });
      
      if (hasNextjsError) {
        errors.push('Next.js Error Overlay detected');
      }

    } catch (e) {
      if (e.message.includes('Timeout')) {
         console.log('Timeout waiting for network idle, but checking page anyway...');
      } else {
         errors.push(`Navigation failed: ${e.message}`);
      }
    }

    page.off('console', consoleHandler);
    page.off('pageerror', pageErrorHandler);

    if (errors.length > 0) {
      console.log(`[X] ${route} has ${errors.length} errors.`);
      results.push({ route, errors });
    } else {
      console.log(`[OK] ${route}`);
    }
  }

  await browser.close();
  
  console.log('\n==================================');
  console.log('--- Crawl Report ---');
  if (results.length === 0) {
    console.log('No errors found! 100% Coverage OK.');
  } else {
    console.log(`${results.length} pages had errors:`);
    for (const res of results) {
      console.log(`\nRoute: ${res.route}`);
      for (const err of res.errors) {
        console.log(`  - ${err}`);
      }
    }
  }
  
  fs.writeFileSync('crawl-report.json', JSON.stringify(results, null, 2));
})();
