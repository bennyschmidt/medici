import { randomUUID } from 'crypto';

import { Rect, Text } from '../index.js';

/**
 * Link
 */

class Link extends Rect {

  /*******************************************
   * Init
   *******************************************/

  constructor (
    x = 0,
    y = 0,
    width,
    height,
    attributes = {},
    source = ''
  ) {
    super(
      x,
      y,
      width,
      height,
      attributes
    );

    this.type = 'link';
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.attributes = attributes;
    this.source = source;
    this.isFocused = false;

    const padding = (height / 2) + 4;

    const textBox = {
      left: +x + (padding / 2),
      top: +y + padding,
      width: width - padding,
      height: height - (padding * 2)
    };

    this.textComponent = new Text(
      placeholder,
      textBox.left,
      textBox.top,
      textBox.width,

      {
        ...({
          ...attributes,

          id: `text-${this.id}`,
          rectComponent: this
        }),

        x: `${textBox.left}px`,
        y: `${textBox.top}px`,
        width: `${textBox.width}px`,
        height: `${textBox.height}px`
      }
    );
  }

  toString () {
    return this.source;
  }

  onClick (event) {
    const { childNodes } = event?.element || {};

    const textNode = childNodes.find(({ rawTagName }) => (
      rawTagName === 'Text'
    ));

    const {
      text = ''
    } = this.getElementAttributes(textNode);

    this.onNavigate(text);
  }
}

export default Link;
