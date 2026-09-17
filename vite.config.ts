import react from '@vitejs/plugin-react';
import { cheminfoBuildInfo, cheminfoPrerender } from 'react-cheminfo/vite';
import { defineConfig } from 'vite';

import { NOSCRIPT_ROUTES, PAGE_ROUTES } from './src/seo/routes.ts';
import { configuredSiteUrl } from './src/state/site.ts';

// The site's own port, never Vite's stock 5173: two checkouts must not fight
// over the same one. It is the number compose publishes as well — this site has
// no backend to leave room for, so there is one number, not two.
//
// 10650 is picked rather than derived. The creation date gives 10917, which
// symmetry.cheminfo.org took the same day, and the derived alternatives in the
// 106xx block are packed tight enough that the next free one was in use by
// something outside the family. This number was checked against every sibling
// and sits in a gap wide enough that the next site along will not land on it.
const port = Number(process.env.PORT ?? 10_650);

export default defineConfig({
  // The build carries no mount path. Every asset is written relative, so the
  // one `dist` serves the site's own host and a path of a shared one without
  // being rebuilt: the `<base>` the container stamps in at startup is what
  // resolves them, and the page reads its mount back off that.
  base: './',
  resolve: {
    // `react-cheminfo` is linked from the checkout next door, so without this
    // its own `node_modules` gives the page a second React: every component it
    // exports then calls hooks against a dispatcher the active renderer never
    // populated, and the first render dies on `Cannot read properties of null`.
    // Blueprint holds context of its own and duplicates the same way.
    dedupe: ['react', 'react-dom', '@blueprintjs/core'],
  },
  plugins: [
    react(),
    cheminfoBuildInfo(),
    cheminfoPrerender({
      site: 'dbe',
      routes: PAGE_ROUTES,
      // The published address, mount path included, so every canonical link,
      // `og:url`, card and sitemap entry starts where the site is served.
      origin: configuredSiteUrl(),
      description:
        'Read the degree of unsaturation off a molecular formula, count the rings and pi bonds of a structure you draw, and see where sulfur and phosphorus make the two numbers disagree.',
      noscript: {
        heading: 'dbe.cheminfo.org — rings and pi bonds, counted both ways',
        intro:
          'A degree of unsaturation is rings plus pi bonds. Read it off a molecular formula, count it off a structure you draw, and compare the two: they part company whenever sulfur or phosphorus is drawn beyond the valence the formula assumes. The tool needs JavaScript; these are the pages it offers:',
        // The build bakes in no mount, so the crawl path is written against the
        // `<base>` the container stamps in at startup rather than the root of a
        // host this deployment may only share.
        hrefs: 'relative',
        // A crawl path is a menu: it names the exercises, not every question.
        routes: NOSCRIPT_ROUTES,
        ecosystem: { taglines: false },
      },
    }),
  ],
  server: {
    port,
    // Fail loudly rather than drifting to the next free port, which would leave
    // the Playwright base URL, the dev script and the README disagreeing.
    strictPort: true,
  },
  preview: { port, strictPort: true },
  build: {
    // openchemlib is large and does not tree-shake; the structure half is
    // lazy-loaded so a page that only reads a formula never pays for it.
    chunkSizeWarningLimit: 2048,
  },
});
