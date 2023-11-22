/*******************************************
 * Component
 *
 * The base component class with common
 * methods and properties
 *******************************************/

import { randomUUID } from 'crypto';

class Component {

  /*******************************************
   * Init
   *******************************************/

  constructor (type, attributes = {}) {
    this.type = type || 'component';
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.attributes = attributes;
  }

  /**
   * toString
   * A string representation of the component
   **/

  toString () {
    return `<${this.type.charAt(0).toUpperCase()}${this.type.slice(1)} #${this.id}>`;
  }
}

export default Component;
