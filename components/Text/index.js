import { Component } from '../index.js';

/**
 * Text
 */

class Text extends Component {

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
    super('text', attributes);

    this.text = text;
    this.x = x;
    this.y = y;
    this.maxWidth = maxWidth;
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
