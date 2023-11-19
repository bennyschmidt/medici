import { randomUUID } from 'crypto';

/**
 * Rect
 */

class Rect {

  /*******************************************
   * Init
   *******************************************/

  constructor (
    x = 0,
    y = 0,
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

  onHover (event, component) {
    // console.log('Rect.onHover', event, component.id);
  }

  onClick (event, component) {
    // console.log('Rect.onClick', event, component.id);
  }
}

export default Rect;
