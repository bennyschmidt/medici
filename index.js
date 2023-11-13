import { Medici } from './renderers/index.js';

const browser = new Medici();

setTimeout(() => {
  browser.onNavigate('@exactchange:text:example');

  setTimeout(() => {
    browser.onNavigate('@exactchange:data:example');

    setTimeout(() => {
      browser.onNavigate('@exactchange:image:example');

      setTimeout(() => {
        browser.onNavigate('@exactchange:audio:example');

        setTimeout(() => {
          browser.onNavigate('@exactchange:video:example');

          setTimeout(() => {
            browser.onNavigate('@exactchange:page:example');

            setTimeout(() => {
              browser.onNavigate('@exactchange:app:example');
            }, 2000);
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
  }, 2000);
}, 2000);
