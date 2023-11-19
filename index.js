import { Medici } from './renderers/index.js';

const browser = new Medici();

setTimeout(async () => {
  await browser.onNavigate('@exactchange:app:featured');
}, 100);
