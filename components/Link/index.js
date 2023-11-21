import { randomUUID } from 'crypto';

import { Rect, Text } from '../index.js';

/**
 * Link
 */

class Link extends Rect {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    x = 0,
    y = 0,
    width,
    height,
    source = '',
    text = '',
    textStyle = 'white'
  }) {
    super({
      id,
      x,
      y,
      width,
      height
    });

    this.type = 'link';
    this.id = id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.source = source;
    this.text = text;
    this.isFocused = false;

    this.attributes = {
      ...this.attributes,

      id: this.id,
      source,
      text,
      textStyle
    };

    const padding = (height / 2) + 4;

    const textBox = {
      left: +x + (padding / 2),
      top: +y + padding,
      width: width - padding,
      height: height - (padding * 2)
    };

    this.textComponent = new Text({
      id: `text-${this.id}`,
      text,
      x: textBox.left,
      y: textBox.top,
      maxWidth: textBox.width
    });

    this.textComponent.rectComponent = this;
    this.textComponent.attributes.style = textStyle;
  }

  /**
   * toString
   * A string representation of the component
   **/

  toString () {
    return this.source;
  }

  onHover (_, component) {
    this.state.hoverTarget = component?.id;
  }

  onClick (event) {
    if (!event?.element) return;

    const {
      source = ''
    } = this.getElementAttributes(event.element);

    this.onNavigate(source);
  }
}

export default Link;
