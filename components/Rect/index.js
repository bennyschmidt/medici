import { randomUUID } from 'crypto';

/**
 * Rect
 */

class Rect {
  constructor (
    x,
    y,
    width,
    height,
    attributes = {}
  ) {
    this.type = 'rect';
    this.id = `${this.type}-${randomUUID().slice(0, 8)}`;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.attributes = attributes;
  }

  toString () {
    return `<Rect #${randomUUID().slice(0, 8)}>`;
  }
}

export default Rect;
