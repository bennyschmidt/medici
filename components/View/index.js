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

    this.type = 'input';
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
  }

  toString () {
    return `<View #${this.id}>`;
  }

  /*******************************************
   * Method signatures
   *******************************************/

  onHover () {}
  onClick () {}
}

export default View;
