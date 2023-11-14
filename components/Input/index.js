import { randomUUID } from 'crypto';

import { Rect, Text } from '../index.js';

/**
 * Input
 */

class Input extends Rect {

  /*******************************************
   * Init
   *******************************************/

  constructor (
    x,
    y,
    width,
    height,
    attributes = {},
    placeholder = 'Type something...'
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
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.attributes = attributes;
    this.placeholder = placeholder;
    this.value = '';
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
    return `<Input #${this.id}>`;
  }

  onClick (event) {
    this.isFocused = true;
    this.placeholder = '';
    console.log('onClick', event.type);
  }

  /*******************************************
   * Method signatures
   *******************************************/

  onHover () {}
}

export default Input;
