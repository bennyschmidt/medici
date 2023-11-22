/*******************************************
 * Pressable
 *
 * Extends the base Component class with
 * pointer events
 *******************************************/

import { Component } from '../index.js';

import { WINDOW_OPTIONS } from '../../constants.js';

class Pressable extends Component {

  /*******************************************
   * Init
   *******************************************/

  constructor (type = 'pressable', attributes = {}) {
    const {
      id,
      x = 0,
      y = 0,
      width = WINDOW_OPTIONS.width,
      height = WINDOW_OPTIONS.height
    } = attributes;

    super(type, {
      id,
      x,
      y,
      width,
      height
    });

    this.left = `${x}px`;
    this.top = `${y}px`;
    this.width = `${width}px`;
    this.height = `${height}px`;
  }

  /*******************************************
   * Method signatures
   *
   * onHover
   * onClick
   *******************************************/

  onHover (/* event, component */) {}
  onClick (/* event, component */) {}
}

export default Pressable;
