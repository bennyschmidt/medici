import { randomUUID } from 'crypto';

import { Page } from '../index.js';

/**
 * App
 */

class App extends Page {
  constructor (
    path,
    variables = {},
    attributes = {}
  ) {
    super(path);

    this.type = 'app';
    this.id = `${this.type}-${randomUUID().slice(0, 8)}`;
    this.attributes = attributes;

    for (const member of Object.keys(variables)) {
      this[member] = variables[member];
    }
  }
}

export default App;
