import { randomUUID } from 'crypto';

import { Rect } from '../index.js';

/**
 * View
 */

class View extends Rect {

  /*******************************************
   * Init
   *******************************************/

  constructor (
    x,
    y,
    width,
    height,
    attributes = {}
  ) {
    super(
      x,
      y,
      width,
      height,
      attributes
    );

    this.type = 'view';
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
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
