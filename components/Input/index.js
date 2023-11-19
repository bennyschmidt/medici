import { randomUUID } from 'crypto';

import { Rect, Text } from '../index.js';

const PRINTABLE_KEYS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
  'q',
  'w',
  'e',
  'r',
  't',
  'y',
  'u',
  'i',
  'o',
  'p',
  'a',
  's',
  'd',
  'f',
  'g',
  'h',
  'j',
  'k',
  'l',
  'z',
  'x',
  'c',
  'v',
  'b',
  'n',
  'm',
  '`',
  '~',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  '[',
  '{',
  ']',
  '}',
  '-',
  '_',
  '=',
  '+',
  ';',
  ':',
  '\'',
  '"',
  ',',
  '<',
  '.',
  '>',
  '/',
  '?',
  '\\',
  '|'
];

const SHIFT_KEYS = {
  '`': '~',
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '&',
  '8': '*',
  '9': '(',
  '10': ')',
  '[': '{',
  ']': '}',
  '-': '_',
  '=': '+',
  ';': ':',
  '\'': '"',
  ',': '<',
  '.': '>',
  '/': '?',
  '\\': '|'
};

/**
 * Input
 */

class Input extends Rect {

  /*******************************************
   * Init
   *******************************************/

  constructor (
    x = 0,
    y = 0,
    width,
    height,
    attributes = {},
    placeholder = 'Type something...',
    value = ''
  ) {
    super(
      x,
      y,
      width,
      height,
      attributes
    );

    this.type = 'input';
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.attributes = attributes;
    this.placeholder = placeholder;
    this.value = value;
    this.isFocused = false;

    const padding = (height / 2) + 4;

    const textBox = {
      left: +x + (padding / 2),
      top: +y + padding,
      width: width - padding,
      height: height - (padding * 2)
    };

    this.textComponent = new Text(
      placeholder,
      textBox.left,
      textBox.top,
      textBox.width,

      {
        ...({
          ...attributes,

          id: `text-${this.id}`,
          rectComponent: this
        }),

        x: `${textBox.left}px`,
        y: `${textBox.top}px`,
        width: `${textBox.width}px`,
        height: `${textBox.height}px`
      }
    );
  }

  toString () {
    return `<Input #${this.id}>`;
  }

  onClick (event, component) {
    const { id } = component;

    this.listeners[id].component =
    this.state.components[id] = {
      ...component,

      placeholder: '',

      textComponent: {
        ...component.textComponent,

        text: component.value
      }
    };
  }

  onKeyDown (event, component) {
    let { key = '' } = event;

    const { id } = component;

    if (!key) return;

    key = key.toLowerCase();

    switch (key) {
      case 'return':
        if (this.state.search && this.onNavigate) {
          this.onNavigate(this.state.search);

          return;
        }

      case 'capslock':
      case 'shift':
      case 'alt':
      case 'ctrl':
      case 'option':
      case 'cmd':
      case 'meta':
      case 'fn':
        break;

      case 'space':
        this.state.search += ' ';

        break;

      case 'tab':
        this.state.search += '  ';

        break;

      case 'backspace':
        if (event.ctrl) {
          this.state.search = '';
        } else {
          this.state.search = (
            this.state.search.substring(0, this.state.search.length - 1)
          );
        }

        break;

      default:
        if (event.ctrl) return;

        if (event.shift) {
          if (Object.keys(SHIFT_KEYS).includes(key)) {
            key = SHIFT_KEYS[key];
          } else {
            key = event.capslock
              ? key.toLowerCase()
              : key.toUpperCase();
          }
        } else {
          key = event.capslock
            ? key.toUpperCase()
            : key.toLowerCase();
        }

        if (PRINTABLE_KEYS.includes(key.toLowerCase())) {
          this.state.search += key;
        }
    }

    this.listeners[id].component =
    this.state.components[id] = {
      ...component,

      textStyle: 'white',
      textComponent: {
        ...component.textComponent,

        text: this.state.search,
        style: 'white',

        attributes: {
          ...component.textComponent.attributes,

          textStyle: 'white'
        }
      }
    };

    this.render();
  }
}

export default Input;
