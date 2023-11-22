import { Medici } from './renderers/index.js';

const browser = new Medici();

setTimeout(() => (
  browser.onNavigate('@exactchange:page:featured')
), 100);
