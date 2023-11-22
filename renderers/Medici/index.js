/*******************************************
 * Medici
 * A JSX-native peer-to-peer browser
 *
 * Extends Vasari with a navigator
 * and history
 *******************************************/

import notifier from 'node-notifier';

import __dirname from '../../__dirname.js';
import Peers from '../../peers.json' assert { type: 'json' };

import {
  FILE_EXTENSIONS,
  ERROR_MESSAGE
} from '../../constants.js';

import { Vasari } from '../index.js';

class Medici extends Vasari {

  /*******************************************
   * Init
   *******************************************/

  constructor () {
    super(
      `${__dirname}/renderers/Medici/browser.jsx`,
      'Medici'
    );

    this.state.history = [];
  }

  /*******************************************
   * Events
   *
   * onBack
   * onNavigate
   *******************************************/

  /**
   * onBack
   * Load the previous path
   **/

  onBack = () => {
    // current

    this.state.history.pop();

    // previous

    const previous = this.state.history.pop();

    this.onNavigate(previous);
  };

  /**
   * onNavigate
   * Navigate to a path
   **/

  onNavigate = async (path = '') => {
    if (!path) return;

    const [
      namespace = '',
      contentType = '',
      fileName = ''
    ] = path.toLowerCase().split(':');

    const type = contentType.toUpperCase();
    const isMedia = type === 'IMAGE' || type === 'VIDEO';

    let file = '';

    try {
      const response = await fetch(
        `${Peers[namespace]}/${contentType}/${fileName}.${FILE_EXTENSIONS[contentType]}`
      );

      if (!response?.ok) return;

      file = isMedia
        ? await response.arrayBuffer()
        : await response.text();

      if (!file?.toString) return;
    } catch (error) {
      const errorType = 'HTTP/404';
      const errorMessage = `${errorType} ${ERROR_MESSAGE[errorType]}`;

      console.warn(errorMessage, error?.message ||'(error)');
      notifier.notify(errorMessage);
    }

    const innerJSX = file.toString();
    const docSnapshot = this.source.toString();

    if (isMedia) {
      const base64String = Buffer.from(file).toString('base64');
      const base64Prefix = base64String.slice(0, 3);

      switch (base64Prefix) {
        case '/9j':
          file = `data:image/jpg;base64,${base64String}`;

          break;
        case 'iVB':
          file = `data:image/png;base64,${base64String}`;

          break;
        case 'Qk0':
          file = `data:image/tiff;base64,${base64String}`;

          break;
        case '//v':
          file = `data:audio/mpeg;base64,${base64String}`;

          break;
        case 'AAA':
          file = `data:video/mpeg;base64,${base64String}`;

          break;
      }

      if (file.slice(0, 5) !== 'data:') {
        console.log('Error: Unknown file format.');
      }
    }

    switch (type) {
      case 'TEXT':
        this.value = docSnapshot.replace(
          '<%ROOT%>', `
          <View id="root" x={0} y={0} width={1024} height={544}>
            <Text fill style="white" text="${file}" x={10} y={60} maxWidth={1024} />
          </View>
        `);

        break;

      case 'DATA':
        const list = file
          .replace(/\n/g, '')
          .trim()
          .slice(1, -1)
          .trim();

        this.value = docSnapshot.replace(
          '<%ROOT%>', `
          <View id="root" x={0} y={0} width={1024} height={544}>
            <Data style="white" list="${list}" x={10} y={60} maxWidth={1024} />
          </View>
        `);

        break;

      case 'IMAGE':
        this.value = docSnapshot.replace(
          '<%ROOT%>', `
          <View id="root" x={0} y={40} width={1024} height={544}>
            <Image path="${file}" x={0} y={0} width={1024} height={544} />
          </View>
        `);

        break;

      case 'AUDIO':
        this.value = docSnapshot.replace(
          '<%ROOT%>', `
          <View id="root" x={0} y={40} width={1024} height={544}>
            <Text fill style="white" text="Audio not yet supported." x={10} y={60} maxWidth={1024} />
            <Audio path="${file}" />
          </View>
        `);

        break;

      case 'VIDEO':
        this.value = docSnapshot.replace(
          '<%ROOT%>', `
          <View id="root" x={0} y={0} width={1024} height={544}>
            <Text fill style="white" text="Video not yet supported." x={10} y={60} maxWidth={1024} />
            <Video path="${file}" />
          </View>
        `);

        break;

      case 'PAGE':
        const rootElement = this.parseJSX();

        if (rootElement?.childNodes) {
          const unsupportedTags = [
            ...rootElement.getElementsByTagName('Declare'),

            ...rootElement.getElementsByTagName('Event')
          ];

          for (const tag of unsupportedTags) {
            tag.remove();
          }
        }

        this.value = docSnapshot.replace(
          '<%ROOT%>', `
          <View id="root" x={0} y={40} width={1024} height={544}>
            ${innerJSX}
          </View>
        `);

        break;

      case 'APP':
        this.value = docSnapshot.replace(
          '<%ROOT%>', `
          <View id="root" x={0} y={40} width={1024} height={544}>
            ${innerJSX}
          </View>
        `);

        break;
    }

    this.state.search = path;
    this.events = {};
    this.listeners = {};

    this.state.history.push(path);
    this.render();
  };
}

export default Medici;
