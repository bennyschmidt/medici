import { randomUUID } from 'crypto';

import { Page } from '../index.js';

/**
 * App
 */

class App extends Page {

  /*******************************************
   * Init
   *******************************************/

  constructor (
    path,
    variables = {},
    attributes = {}
  ) {
    super(path);

    this.type = 'app';
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.attributes = attributes;

    for (const member of Object.keys(variables)) {
      this[member] = variables[member];
    }
  }

  /**
   * toString
   * A string representation of the component
   **/

  toString () {
    return `<App #${this.id}>`;
  }
}

export default App;
