/*******************************************
 * Input
 *
 * A stateful text input with a
 * placeholder and basic key validation
 *******************************************/

import { randomUUID } from 'crypto';

import {
  PRINTABLE_KEYS,
  SHIFT_KEYS
} from '../../constants.js';

import { Rect, Text } from '../index.js';

class Input extends Rect {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    x = 0,
    y = 0,
    width,
    height,
    placeholder = 'Type something...',
    value = '',
    textStyle = 'white'
  }) {
    super({
      id,
      x,
      y,
      width,
      height
    });

    this.type = 'input';
    this.id = id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.placeholder = placeholder;
    this.value = value;
    this.isFocused = false;

    this.attributes = {
      ...this.attributes,

      id: this.id,
      placeholder,
      value,
      textStyle
    };

    const padding = (height / 2) + 4;

    const textBox = {
      left: +x + (padding / 2),
      top: +y + padding,
      width: width - padding,
      height: height - (padding * 2)
    };

    this.textComponent = new Text({
      id: `text-${this.id}`,
      text: value || placeholder,
      x: textBox.left,
      y: textBox.top,
      maxWidth: textBox.width
    });

    this.textComponent.rectComponent = this;
    this.textComponent.attributes.style = textStyle;
  }

  /**
   * toString
   * A string representation of the component
   **/

  toString () {
    return `<Input #${this.id}>`;
  }

  /**
   * onClick
   * Handle click
   **/

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

    this.state.focusTarget = component?.id;
  }

  /**
   * onKeyDown
   * Handle keydown
   **/

  onKeyDown (event, component) {
    let { key = '' } = event;

    const { id } = component;

    if (!key) return;

    key = key.toLowerCase();

    switch (key) {
      case 'return':
        if (this.state.input[component.id] && this.onNavigate) {
          this.onNavigate(this.state.input[component.id]);

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
        this.state.input[component.id] += ' ';

        break;

      case 'tab':
        this.state.input[component.id] += '  ';

        break;

      case 'backspace':
        if (event.ctrl) {
          this.state.input[component.id] = '';
        } else {
          this.state.input[component.id] = (
            this.state.input[component.id].substring(0, this.state.input[component.id].length - 1)
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
          this.state.input[component.id] += key;
        }
    }

    this.listeners[id].component =
    this.state.components[id] = {
      ...component,

      textStyle: 'white',
      textComponent: {
        ...component.textComponent,

        text: this.state.input[component.id],
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
