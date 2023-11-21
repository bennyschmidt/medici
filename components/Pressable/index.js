import { Component } from '../index.js';

/**
 * Pressable
 */

class Pressable extends Component {

  /*******************************************
   * Init
   *******************************************/

  constructor (type = 'pressable', attributes = {}) {
    super(type, attributes);
  }

  onHover (event, component) {
    console.log('onHover', event, component.id);
  }

  onClick (event, component) {
    console.log('onClick', event, component.id);
  }
}

export default Pressable;
