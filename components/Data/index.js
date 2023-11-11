import { randomUUID } from 'crypto';

/**
 * Data
 */

class Data {
  constructor (list, attributes = {}) {
    this.type = 'data';
    this.id = `${this.type}-${randomUUID().slice(0, 8)}`;
    this.value = {};
    this.attributes = attributes;

    list.trim().split(',').forEach(property => {
      const [key, value] = property.trim().split(':');

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

  toString () {
    return this.text
      .replace(/{|}/g, '')
      .replace(/,/g, '\n');
  }
}

export default Data;
