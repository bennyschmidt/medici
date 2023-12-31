/*******************************************
 * Data
 *
 * Represents a viewable data structure
 * element
 *******************************************/

import { Component } from '../index.js';

class Data extends Component {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    list,
    x = 0,
    y = 0,
    width = 0,
    height = 0
  }) {
    super('data', {
      id,
      x,
      y,
      width,
      height
    });

    this.value = {};

    this.id = this.attributes.id = (
      id || `${this.type}-${randomUUID().slice(0, 8)}`
    );

    list.trim().split(',').forEach(property => {
      const [key = '', value = ''] = property.trim().split(':');

      let parsedValue = value.trim();

      const parsedNumber = Number(parsedValue);

      const isBoolean = (
        parsedValue === true ||
        parsedValue === false ||
        parsedValue === 'true' ||
        parsedValue === 'false'
      );

      if (parsedNumber) {
        parsedValue = parsedNumber;
      } else if (isBoolean) {
        parsedValue = Boolean(
          parsedValue === true ||
          parsedValue === 'true'
        );
      } else {
        parsedValue = parsedValue.replace(/\"/g, '');
      }

      this.value[key.replace(/\"/g, '')] = parsedValue;
    });

    if (!Object.keys(this.value)?.length) {
      console.log('Error: Unknown data format.');
    }
  }

  get json () {
    return JSON.parse(this.text);
  }

  get text () {
    return JSON.stringify(this.value);
  }

  /**
   * toString
   * A string representation of the component
   **/

  toString () {
    return this.text
      .replace(/{|}/g, '')
      .replace(/,/g, '\n');
  }
}

export default Data;
