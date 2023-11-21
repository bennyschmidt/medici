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
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.title = title;
    this.value = null;
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
