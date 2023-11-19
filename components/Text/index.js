import { randomUUID } from 'crypto';

/**
 * Text
 */

class Text {

  /*******************************************
   * Init
   *******************************************/

  constructor (
    text = '',
    x = 0,
    y = 0,
    maxWidth,
    attributes = {}
  ) {
    this.type = 'text';
    this.id = `${this.type}-${randomUUID().slice(0, 8)}`;
    this.text = text;
    this.x = x;
    this.y = y;
    this.maxWidth = maxWidth;
    this.attributes = attributes;
  }

  toString () {
    return this.text;
  }
}

export default Text;
