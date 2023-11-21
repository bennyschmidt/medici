import fs from 'fs/promises';
import notifier from 'node-notifier';

import { Pressable } from '../index.js';

const ERROR_MESSAGE = {
  'HTTP/404': 'File not found.'
};

/**
 * Media
 */

class Media extends Pressable {
  static async load (filePath, onLoad) {
    let response;

    const isBase64String = filePath.slice(0, 5) === 'data:';

    if (isBase64String) {
      response = filePath;
    } else {
      try {
        response = await fs.readFile(filePath);
      } catch (error) {
        console.warn(ERROR_MESSAGE, error?.message || '(error)');
        notifier.notify(ERROR_MESSAGE);

        return;
      }
    }

    if (onLoad) {
      onLoad(response);
    }
  }

  /*******************************************
   * Init
   *******************************************/

  constructor (path) {
    super('media', { path });

    this.source = null;
    this.sourceType = null;
    this.encoding = null;
    this.format = null;

    Media.load(path, this.load.bind(this));
  }

  /**
   * toString
   * A string representation of the component
   **/

  toString () {
    return `${this.source}`;
  }

  load (source) {
    this.onLoad(source);
  }

  onLoad (source) {
    const base64String = source.slice(0, 5) === 'data:'
      ? source.split(',')[1].trim()
      : source.toString('base64');

    const base64Prefix = base64String.slice(0, 3);

    switch (base64Prefix) {
      case '/9j':
        source = `data:image/jpg;base64,${base64String}`;

        break;
      case 'iVB':
        source = `data:image/png;base64,${base64String}`;

        break;
      case 'Qk0':
        source = `data:image/tiff;base64,${base64String}`;

        break;
      case '//v':
        source = `data:audio/mpeg;base64,${base64String}`;

        break;
      case 'AAA':
        source = `data:video/mpeg;base64,${base64String}`;

        break;
    }

    if (source.slice(0, 5) !== 'data:') {
      console.log('Error: Unknown file format.');

      return;
    }

    this.source = source;
    this.sourceType = source.slice(source.indexOf(':') + 1, source.indexOf(','));

    const sourceType = this.sourceType;

    this.encoding = sourceType.slice(sourceType.indexOf(';') + 1, source.indexOf(','));
    this.format = sourceType.slice(sourceType.indexOf('/') + 1, sourceType.indexOf(';'));
  }
}

export default Media;
