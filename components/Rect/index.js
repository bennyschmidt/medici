import { randomUUID } from 'crypto';

/**
 * Rect
 */

class Rect {

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
    this.type = 'rect';
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.attributes = attributes;
  }

  toString () {
    return `<Rect #${this.id}>`;
  }

  /*******************************************
   * Method signatures
   *******************************************/

  onHover () {}
  onClick () {}
}

export default Rect;
