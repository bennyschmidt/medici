/*******************************************
 * Rect
 *
 * Extends Pressable with a viewable
 * rectangle element
 *******************************************/

import { WINDOW_OPTIONS } from '../../constants.js';

import { Pressable } from '../index.js';

class Rect extends Pressable {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    x = 0,
    y = 0,
    width = WINDOW_OPTIONS.width,
    height = WINDOW_OPTIONS.height
  }) {
    super('rect', {
      id,
      x,
      y,
      width,
      height
    });
  }

  /**
   * onHover
   * Handle hover
   **/

  onHover (event, component) {
    console.log('Rect.onHover', event, component.id);
  }

  /**
   * onClick
   * Handle click
   **/

  onClick (event, component) {
    console.log('Rect.onClick', event, component.id);
  }
}

export default Rect;
