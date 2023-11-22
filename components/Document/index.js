/*******************************************
 * Document
 *
 * Represents a viewable file or
 * document element
 *******************************************/

import fs from 'fs/promises';
import { randomUUID } from 'crypto';

import { Component, Data } from '../index.js';

class Document extends Component {
  static async load (filePath, onLoad) {
    const response = await fs.readFile(filePath);

    if (onLoad) {
      onLoad.call(this, response);
    }
  }

  /*******************************************
   * Init
   *******************************************/

  constructor ({ id, path }) {
    super('document', { id, path });

    this.source = null;
    this.sourceType = null;
    this.encoding = null;
    this.format = null;
    this.data = null;

    this.id = this.attributes.id = (
      id || `${this.type}-${randomUUID().slice(0, 8)}`
    );

    Document.load(path, this.open.bind(this));
  }

  /**
   * toString
   * A string representation of the component
   **/

  toString () {
    return this.data?.toString?.() || '';
  }

  /**
   * open
   * Open a file or document source
   **/

  open (source) {
    this.onLoad(source);
  }

  /**
   * close
   * Close and unload the current file
   **/

  close () {
    this.onUnload();
  }

  /**
   * onLoad
   * Handle load
   **/

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
  }
}

export default Document;
