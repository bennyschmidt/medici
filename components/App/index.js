/*******************************************
 * App
 *
 * Extends Page with events & scripting
 *******************************************/

import { randomUUID } from 'crypto';

import { Page } from '../index.js';

class App extends Page {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    path,
    variables = {}
  }) {
    variables = {
      title: variables.title || 'Application',

      ...variables
    };

    super({
      id,
      path,
      title: variables.title
    });

    this.type = 'app';
    this.id = id || `${this.type}-${randomUUID().slice(0, 8)}`;

    this.attributes = {
      id: this.id,
      path
    };

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
