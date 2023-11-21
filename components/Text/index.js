import { Component } from '../index.js';

/**
 * Text
 */

class Text extends Component {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    text = '',
    x = 0,
    y = 0,
    maxWidth
  }) {
    super('text', {
      id,
      text,
      x,
      y,
      maxWidth
    });

    this.text = text;
  }

  /**
   * toString
   * A string representation of the component
   **/

  toString () {
    return this.text;
  }
}

export default Text;
