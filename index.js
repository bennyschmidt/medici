import { Medici } from './renderers/index.js';

const browser = new Medici();

// Run some tests on different content types
// served from peer "@exactchange"

setTimeout(async () => {
  await browser.onNavigate('@exactchange:page:example');
}, 100);

// setTimeout(async () => {
//   await browser.onNavigate('@exactchange:text:example');

//   setTimeout(async () => {
//     await browser.onNavigate('@exactchange:data:example');

//     setTimeout(async () => {
//       await browser.onNavigate('@exactchange:image:example');

//       setTimeout(async () => {
//         await browser.onNavigate('@exactchange:audio:example');

//         setTimeout(async () => {
//           await browser.onNavigate('@exactchange:video:example');

//           setTimeout(async () => {
//             await browser.onNavigate('@exactchange:page:example');

//             setTimeout(async () => {
//               await browser.onNavigate('@exactchange:app:example');
//             }, 2000);
//           }, 2000);
//         }, 2000);
//       }, 2000);
//     }, 2000);
//   }, 2000);
// }, 2000);


