import { randomUUID } from 'crypto';

import { Document } from '../index.js';

/**
 * Page
 */

class Page extends Document {

  /*******************************************
   * Init
   *******************************************/

  constructor (
    path,
    {
      title,
      attributes = {}
    } = {
      title: 'Untitled',
      attributes: {}
    }
  ) {
    super(path);

    this.type = 'page';
    this.id = `${this.type}-${randomUUID().slice(0, 8)}`;
    this.title = title;
    this.value = null;
    this.attributes = attributes;
  }

  /*******************************************
   * Instance methods
   *******************************************/

  onLoad (source) {
    const jsx = source?.toString();

    this.value = jsx;
    this.source = source;
    this.sourceType = 'application/jsx';

    const type = this.sourceType.split('/');

    this.encoding = type[0];
    this.format = type[1];

    this.onReady();
  }

  toString () {
    return `<Page #${this.id}>`;
  }
}

export default Page;
