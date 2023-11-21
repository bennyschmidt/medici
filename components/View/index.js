import { randomUUID } from 'crypto';

import { Rect } from '../index.js';

/**
 * View
 */

class View extends Rect {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    x,
    y,
    width,
    height
  }) {
    super({
      id,
      x,
      y,
      width,
      height
    });

    this.type = 'view';

    this.id = this.attributes.id = (
      id || `${this.type}-${randomUUID().slice(0, 8)}`
    );
  }

  /**
   * toString
   * A string representation of the component
   **/

  toString () {
    return `<View #${this.id}>`;
  }
}

export default View;
