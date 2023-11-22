/*******************************************
 * Text
 *
 * Represents a viewable text element
 *******************************************/

import { WINDOW_OPTIONS } from '../../constants.js';

import { Component } from '../index.js';

class Text extends Component {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    text = '',
    x = 0,
    y = 0,
    maxWidth = WINDOW_OPTIONS.width,
    size = 13
  }) {
    super('text', {
      id,
      text,
      x,
      y,
      maxWidth,
      size
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
