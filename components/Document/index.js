import fs from 'fs/promises';
import { randomUUID } from 'crypto';

import { Data } from '../index.js';

/**
 * Document
 */

class Document {
  static async load (filePath, onLoad) {
    const response = await fs.readFile(filePath);

    if (onLoad) {
      onLoad.call(this, response);
    }
  }

  /*******************************************
   * Init
   *******************************************/

  constructor (path, attributes = {}) {
    this.type = 'document';
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.source = null;
    this.sourceType = null;
    this.encoding = null;
    this.format = null;
    this.attributes = attributes;

    Document.load(path, this.onLoad.bind(this));
  }

  onLoad (source) {
    const json = JSON.parse(source?.toString());
    const base64String = source?.toString?.('base64') || '';
    const base64Prefix = base64String.substr(0, 3);

    switch (base64Prefix) {
      case 'ewo':
        source = `data:application/json;base64,${base64String}`;

        break;
    }

    if (source.slice(0, 4) !== 'data') {
      console.log('Error: Unknown file format.');

      return;
    }

    this.data = new Data(JSON.stringify(json).slice(1, -1));
    this.source = source;
    this.sourceType = source.slice(source.indexOf(':') + 1, source.indexOf(','));

    const sourceType = this.sourceType;

    this.encoding = sourceType.slice(sourceType.indexOf(';') + 1, source.indexOf(','));
    this.format = sourceType.slice(sourceType.indexOf('/') + 1, sourceType.indexOf(';'));

    this.onReady();
  }

  toString () {
    return this.data?.toString?.() || '';
  }

  onScroll (event) {
    console.log('scroll', event);
  }

  /*******************************************
   * Method signatures
   *******************************************/

  onReady () {}
}

export default Document;
