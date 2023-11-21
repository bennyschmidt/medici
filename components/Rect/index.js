import { Pressable } from '../index.js';

/**
 * Rect
 */

class Rect extends Pressable {

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
    super('rect', attributes);

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  onHover (event, component) {
    console.log('Rect.onHover', event, component.id);
  }

  onClick (event, component) {
    console.log('Rect.onClick', event, component.id);
  }
}

export default Rect;
