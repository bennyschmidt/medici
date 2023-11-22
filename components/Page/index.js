/*******************************************
 * Page
 *
 * Extends Document with a title and
 * JSX value
 *******************************************/

import { randomUUID } from 'crypto';

import { Document } from '../index.js';

class Page extends Document {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    path,
    title = 'Untitled'
  }) {
    super({ id, path });

    this.type = 'page';
    this.id = id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.title = title;
    this.value = '';

    this.attributes = {
      id: this.id,
      title
    };
  }

  /**
   * onLoad
   * Handle page load
   **/

  onLoad (source) {
    const jsx = source?.toString();

    this.value = jsx;
    this.source = source;
    this.sourceType = 'application/jsx';

    const type = this.sourceType.split('/');

    this.encoding = type[0];
    this.format = type[1];
  }
}

export default Page;
