import { Vespucci } from './renderers/index.js';

const browser = new Vespucci();

setTimeout(() => (
  browser.onNavigate('@exactchange:page:featured')
), 100);
