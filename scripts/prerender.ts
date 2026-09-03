/**
 * Build-time prerender (master prompt §11, build plan D1).
 *
 * Renders the lite path to static HTML and injects it into `dist/index.html`, so
 * a crawler — or anyone whose JavaScript never arrives — gets the full copy, the
 * four products, the credentials and every CTA without executing the scene.
 * React then takes over the same DOM on the client.
 *
 * Deliberately NOT `vite-plugin-prerender`: that package is unmaintained and
 * pulls in a headless browser to do what `renderToStaticMarkup` does in one
 * call, with no browser and no extra runtime dependency.
 *
 * Runs as part of `npm run build`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LiteApp } from '../src/lite/LiteApp';

const INDEX = 'dist/index.html';
const MARKER = '<div id="root"></div>';

const html = renderToStaticMarkup(createElement(LiteApp));
const index = readFileSync(INDEX, 'utf8');

if (!index.includes(MARKER)) {
  throw new Error(
    `prerender: could not find ${MARKER} in ${INDEX}. ` +
      'The root element changed shape — fix this script rather than skipping it, ' +
      'or the site silently goes back to shipping an empty page to crawlers.',
  );
}

writeFileSync(INDEX, index.replace(MARKER, `<div id="root">${html}</div>`), 'utf8');

const bytes = Buffer.byteLength(html, 'utf8');
console.log(`prerendered ${(bytes / 1024).toFixed(1)}KB of static content into ${INDEX}`);
