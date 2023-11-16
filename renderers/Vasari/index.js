/*******************************************
 * Vasari
 * A JSX-to-Canvas Renderer
 *
 * You must extend this class with
 * controller logic and an accompanying
 * JSX file.
 *******************************************/

import { randomUUID } from 'crypto';
import sdl from '@kmamal/sdl';
import HTMLParser from 'node-html-parser';
import Canvas from 'canvas';

import __dirname from '../../__dirname.js';

import {
  App,
  Rect,
  Text,
  Data,
  Image,
  Input,
  View
} from '../../components/index.js';

const FPS = 30;

const DEBOUNCE_INTERVAL = 10;

const WINDOW_OPTIONS = {
  title: 'Medici',
  accelerated: true,
  popupMenu: false,
  width: 1024,
  height: 576,
  resizable: false
};

const DEFAULT_FONT_SIZE = 13;
const DEFAULT_FONT = `normal 500 ${DEFAULT_FONT_SIZE}px sans-serif`;

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

class Vasari extends App {

  /*******************************************
   * Init
   *******************************************/

  constructor (path, title = 'Vasari', state = {}) {
    const window = sdl.video.createWindow(WINDOW_OPTIONS);

    const { width, height } = window;
    const stride = width * 4;

    super(
      path,
      {
        title,
        state: {
          ...state,

          width: state.width || width,
          height: state.height || height,
          stride,
          format: 'bgra32',
          buffer: Buffer.alloc(stride * height),
          canvas: null,
          elements: {},
          components: {},
          search: ''
        }
      }
    );

    this.window = window;

    this.location = {
      host: null
    };

    this.docState = {
      read: () => this.docState,

      get: variable => this.docState[variable],

      set: (variable, value) => {
        this.docState[variable] = value;
      }
    };

    this.keys = {};
    this.events = {};
    this.listeners = {};
    this._nextEvent = Date.now() + +DEBOUNCE_INTERVAL;

    // Callback

    this.onLoad();
  }

  /*******************************************
   * Methods
   *
   * render2d
   * redraw
   * parseJSX
   * getElementAttributes
   * parseAppearanceAttributes
   * renderElement
   * open
   * close
   * onResize
   * onReady
   * render
   * onLoad
   * onUnload
   *******************************************/

  /**
   * render2d
   * Render a canvas 2D bitmap
   **/

  render2d = () => {
    const {
      width,
      height,
      stride,
      format
    } = this.state;

    this.state.buffer = this.state.canvas.toBuffer('raw');

    this.window.render(
      width,
      height,
      stride,
      format,
      this.state.buffer
    );
  };

  /**
   * redraw
   * Re-render the existing state
   **/

  redraw = () => {
    let {
      width,
      height,
      stride,
      format,
      buffer
    } = this.state;

    this.window.render(
      width,
      height,
      stride,
      format,
      buffer
    );
  };

  /**
   * parseJSX
   * Parse the value and retain a representation of the rendering context
   **/

  parseJSX = () => {
    const { firstChild: rootElement } = (
      HTMLParser.parse(this.value.replace(/\n/g, '').trim())
    );

    return rootElement;
  };

  /**
   * getElementAttributes
   * Get attributes from an element string
   **/

  getElementAttributes = element => (
    Object.assign({},
      ...(element.rawAttrs
        .split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g)
        .filter(Boolean)
        .map(attr => {
          let [key, value] = attr.split('=');

          if (attr.slice(0, 11) === 'path="data:') {
            key = 'path';
            value = attr.slice(5, -1);
          }

          return {
            [key]: !value ? true : value.slice(1, -1)
          };
        }))
    )
  );

  /**
   * parseAppearanceAttributes
   * Parse element style attributes
   **/

  parseAppearanceAttributes = (
    element,
    attributes = {},
    options = {}
  ) => {
    const { parentNode } = element;

    let parentElementAttributes = this.getElementAttributes(parentNode);

    if (!Object.keys(parentElementAttributes)?.length) {
      parentElementAttributes = {
        x: 0,
        y: 0,
        width: options.width || WINDOW_OPTIONS.width,
        height: options.height || WINDOW_OPTIONS.height
      };
    }

    attributes.style = attributes.style || '';

    const { style } = attributes;
    const type = attributes.fill ? 'fill' : 'stroke';
    const method = element.rawTagName;
    const left = +parentElementAttributes.x + +attributes.x;
    const top = +parentElementAttributes.y + +attributes.y;
    const width = +attributes.width || +parentElementAttributes.width;
    const height = +attributes.height || +parentElementAttributes.height;

    const maxWidth = Number(
      attributes.maxWidth || (this.state.canvas.width - left)
    );

    const shadowColor = (
      attributes.shadowColor || 'transparent'
    );

    const shadowBlur = (
      attributes.shadowBlur << 0
    );

    const lineJoin = (
      attributes.lineJoin || 'solid'
    );

    const lineWidth = (
      attributes.lineWidth || 1
    );

    return {
      type,
      [type]: true,
      method,
      style,
      left,
      top,
      width,
      maxWidth,
      height,
      shadowColor,
      shadowBlur,
      lineJoin,
      lineWidth
    };
  };

  /**
   * renderElement
   * Render an element to the rendering context
   **/

  renderElement = element => {
    if (!element.rawTagName) return;

    const attributes = this.getElementAttributes(element);

    this.state.canvas.context = this.state.canvas.getContext('2d');
    this.state.canvas.context.font = DEFAULT_FONT;

    const {
      type,
      method,
      style,
      left,
      top,
      width,
      maxWidth,
      height,
      shadowColor,
      shadowBlur,
      lineJoin,
      lineWidth
    } = this.parseAppearanceAttributes(element, attributes);

    const methodName = `${type}${method}`;

    if (type === 'stroke') {
      this.state.canvas.context.shadowColor = shadowColor;
      this.state.canvas.context.shadowBlur = shadowBlur;
      this.state.canvas.context.lineJoin = lineJoin;
      this.state.canvas.context.lineWidth = lineWidth;
    }

    if (attributes.style.trim().slice(0, 15) === 'linear-gradient') {
      const [
        from = 'black',
        to = 'white',
        startX,
        startY,
        endX = width,
        endY = height
      ] = attributes.style
        .trim()
        .slice(16, -1)
        .split(',')
        .map(property => property.trim());

      const gradient = this.state.canvas.context.createLinearGradient(
        startX << 0,
        startY << 0,
        endX << 0,
        endY << 0
      );

      gradient.addColorStop(0, from);
      gradient.addColorStop(1, to);

      this.state.canvas.context[`${type}Style`] = gradient;
    } else {
      this.state.canvas.context[`${type}Style`] = style;
    }

    delete attributes.x;
    delete attributes.y;

    const tagName = method.toUpperCase();

    const {
      id = `${method.toLowerCase()}-${randomUUID().slice(0, 8)}`
    } = attributes;

    switch (tagName) {
      case 'RECT':
      case 'IMAGE':
        const isEventTarget = (
          attributes.hover || attributes.click
        );

        if (isEventTarget) {
          const event = {
            id,
            element: {
              ...element,
              ...attributes,

              tagName,
              localName: tagName.toLowerCase(),
              appearance: {
                [type]: true,
                style,
                left,
                top,
                width,
                maxWidth,
                height,
                shadowColor,
                shadowBlur,
                lineJoin,
                lineWidth
              }
            }
          };

          if (attributes.hover) {
            if (!this.listeners[id]) {
              this.listeners[id] = {
                left,
                top,
                width,
                height,
                onHover: null,
                onClick: null,
                component: this.state.components[id],
                element: this.state.elements[id]
              };
            }

            this.listeners[id] = {
              ...this.listeners[id],

              onHover: nativeEvent => {
                const syntheticEvent = {
                  ...nativeEvent,

                  event
                };

                this.events[attributes.hover](syntheticEvent);
                this.state.components[id].onHover(syntheticEvent);
              }
            };
          }

          if (attributes.click) {
            if (!this.listeners[id]) {
              this.listeners[id] = {
                left,
                top,
                width,
                height,
                onHover: null,
                onClick: null,
                component: this.state.components[id],
                element: this.state.elements[id]
              };
            }

            this.listeners[id] = {
              ...this.listeners[id],

              onClick: nativeEvent => {
                const syntheticEvent = {
                  ...nativeEvent,

                  event
                };

                this.events[attributes.click](syntheticEvent);
                this.state.components[id].onClick(syntheticEvent);
              }
            };
          }
        }
    }

    switch (tagName) {

      /*******************************************
       * Elements
       *******************************************/

      case 'RECT':
        this.state.components[id] = new Rect(
          left,
          top,
          width,
          height,

          {
            ...attributes,

            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`
          }
        );

        this.state.canvas.context[methodName](
          left,
          top,
          width,
          height
        );

        break;

      case 'TEXT':
        this.state.components[id] = (
          new Text(
            attributes.text,
            left,
            top,
            maxWidth,

            {
              ...attributes,

              x: `${left}px`,
              y: `${top}px`,
              width: `${width}px`,
              height: `${height}px`
            }
          )
        );

        this.state.canvas.context[methodName](
          `${attributes.text}`,
          left,
          top,
          maxWidth
        );

        break;

      case 'DATA':
        this.state.components[id] = (
          new Data(
            attributes.list,

            {
              ...attributes,

              x: `${left}px`,
              y: `${top}px`,
              width: `${width}px`,
              height: `${height}px`
            }
          )
        );

        this.state.canvas.context.fillStyle = attributes.style;

        this.state.canvas.context.fillText(
          `${attributes.list}`,
          left,
          top,
          maxWidth
        );

        break;

      case 'IMAGE':
        const image = new Image(
          attributes.path,
          {
            x: left,
            y: top,
            width,
            height,

            attributes: {
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`
            }
          },
          () => {
            const canvasImage = new Canvas.Image();

            const isCover = !!attributes.cover;

            canvasImage.onload = () => {
              const {
                width: imageWidth,
                height: imageHeight
              } = Image[isCover ? 'cover' : 'contain'](
                width,
                height,
                canvasImage.width,
                canvasImage.height
              );

              canvasImage.width = width;
              canvasImage.height = height;

              this.state.canvas.context.drawImage(
                canvasImage,
                left,
                top,
                imageWidth,
                imageHeight
              );
            };

            canvasImage.src = attributes.path;
          }
        );

        this.state.components[id] = image;

        break;

      case 'VIEW':
        this.state.components[id] = (
          new View(
            left,
            top,
            width,
            height,
            {
              id,
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`
            }
          )
        );

        this.state.canvas.context.fillStyle = 'black';

        this.state.canvas.context.fillRect(
          left,
          top,
          width,
          height
        );

        break;

      case 'INPUT':
        const component = this.state.components[id];

        if (!component || component.value !== this.state.search) {
          const {
            placeholder = 'Search apps & content...'
          } = component || {};

          if (component?.value) {
            this.state.search = component.value;
          }

          const input = (
            new Input(
              left,
              top,
              width,
              height,
              {
                id,
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
                textStyle: attributes.textStyle
              },
              placeholder
            )
          );

          this.state.components[id] = input;

          this.state.canvas.context[`${type}Rect`](
            left,
            top,
            width,
            height
          );

          const { textComponent } = input;

          this.state.components[textComponent.id] = textComponent;

          if (this.state.search) {
            this.state.canvas.context.fillStyle = textComponent.attributes.textStyle;

            this.state.canvas.context.font = (
              DEFAULT_FONT.replace('italic', 'normal')
            );
          } else {
            this.state.canvas.context.fillStyle = '#666';

            this.state.canvas.context.font = (
              DEFAULT_FONT.replace('normal', 'italic')
            );
          }

          attributes.left = textComponent.left;
          attributes.top = textComponent.top;
          attributes.width = textComponent.width;
          attributes.height = textComponent.height;

          this.state.canvas.context.fillText(
            this.state.search || placeholder,
            textComponent.x,
            textComponent.y,
            textComponent.width
          );

          const inputEvent = {
            id,
            element: {
              ...element,
              ...attributes,

              tagName,
              localName: tagName.toLowerCase(),
              appearance: {
                [type]: true,
                style,
                left,
                top,
                width,
                maxWidth,
                height,
                shadowColor,
                shadowBlur,
                lineJoin,
                lineWidth
              }
            }
          };

          if (!this.listeners[id]) {
            this.listeners[id] = {
              left,
              top,
              width,
              height,
              onClick: null,
              onKeyDown: null,
              component: this.state.components[id],
              element: this.state.elements[id]
            };
          }

          this.listeners[id] = {
            ...this.listeners[id],

            component,

            onClick: nativeEvent => {
              const component = this.state.components[id];

              this.listeners[id].component =
              this.state.components[id] = {
                ...component,

                // isFocused: true,
                placeholder: '',

                textComponent: {
                  ...component.textComponent,

                  text: input.value
                }
              };
            },

            onKeyUp: nativeEvent => {
              const { key = '' } = nativeEvent;

              if (!key) return;

              this.keys[key] = false;
            },

            onKeyDown: nativeEvent => {
              const component = this.state.components[id];

              let { key = '' } = nativeEvent;

              if (!key) return;

              key = key.toLowerCase();

              this.keys[key] = key;

              switch (key) {
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
                  if (nativeEvent.ctrl) {
                    this.state.search = '';
                  } else {
                    this.state.search = (
                      this.state.search.substring(0, this.state.search.length - 1)
                    );
                  }

                  break;

                default:
                  if (nativeEvent.ctrl) return;

                  if (nativeEvent.shift) {
                    if (Object.keys(SHIFT_KEYS).includes(key)) {
                      key = SHIFT_KEYS[key];
                    } else {
                      key = nativeEvent.capslock
                        ? key.toLowerCase()
                        : key.toUpperCase();
                    }
                  } else {
                    key = nativeEvent.capslock
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
          };
        }

        break;

      /*******************************************
       * Script elements
       *******************************************/

      case 'DECLARE':
        const variables = Object.keys(attributes);

        for (const variable of variables) {
          const stateVariables = this.docState.read();

          if (!Object.keys(stateVariables).includes(variable)) {
            this.docState.set(variable, attributes[variable]);
          }
        }

        if (element.childNodes?.length) {
          const [{ _rawText } = {}] = element.childNodes;

          const state = this.docState;

          eval(`(() => { ${_rawText} })()`);
        }

        break;

      case 'EVENT':
        this.events[id] = event => {
          const [{ _rawText } = {}] = element.childNodes;

          const state = this.docState;

          eval(`(() => { ${_rawText} })()`);
        };

        break;
    }

    element.childNodes.forEach(child => this.renderElement(child));
  };

  /**
   * render
   * Parse JSX and render
   **/

  render = () => {
    if (this.value) {
      if (this.state.canvas.context) {
        this.state.canvas.context.clearRect(
          0,
          0,
          this.state.width,
          this.state.height
        );
      }

      this.state.elements.root = this.parseJSX();

      for (const element of Object.values(this.state.elements)) {
        this.renderElement(element);
      }
    }

    this.render2d();
  };

  /*******************************************
   * Events
   *******************************************/

  /**
   * onResize
   * Handle window resize
   **/

  onResize = () => {
    this.state.width = this.window.width;
    this.state.height = this.window.height;

    WINDOW_OPTIONS.width = this.state.width;
    WINDOW_OPTIONS.height = this.state.height;

    this.redraw();
  };

  /**
   * onReady
   * Handle window ready
   **/

  onReady = () => this.open();

  /**
   * onLoad
   * Handle window load
   **/

  onLoad = () => {
    const onResize = this.onResize.bind(this);
    const onClick = this.onClick.bind(this);
    const onHover = this.onHover.bind(this);
    const onKeyDown = this.onKeyDown.bind(this);

    this.window.off('resize', onResize);
    this.window.on('resize', onResize);

    this.window.off('mouseButtonDown', onClick);
    this.window.on('mouseButtonDown', onClick);

    this.window.off('mouseMove', onHover);
    this.window.on('mouseMove', onHover);

    this.window.off('keyDown', onKeyDown);
    this.window.on('keyDown', onKeyDown);

    this.state.canvas = Canvas.createCanvas(this.state.width, this.state.height);
    // this.interval = setInterval(this.render.bind(this), (1000 / FPS));
    this.render();
  };

  /**
   * onUnload
   * Handle window unload
   **/

  onUnload = () => {
    this.window.off('resize', this.onResize.bind(this));
    this.window.off('mouseButtonDown', this.onClick.bind(this));
    this.window.off('mouseMove', this.onHover.bind(this));
    this.window.off('keyDown', this.onKeyDown.bind(this));
    clearInterval(this.interval);
  };

  /**
   * onHover
   * Global hover router
   **/

  onHover = event => {
    if (this._nextEvent > Date.now()) return;

    const { x, y } = event;

    let isX = false;
    let isY = false;

    let listenerElement;

    for (const listener of Object.keys(this.listeners)) {
      listenerElement = this.listeners[listener];

      if (!listenerElement?.onHover) continue;

      const { left, top, width, height } = listenerElement;

      isX = x > left && x < +left + +width;
      isY = y > top && y < +top + +height;
    }

    if (!listenerElement?.onKeyDown || !isX || !isY) return;

    listenerElement.onHover.call(listenerElement, event);

    this._nextEvent = Date.now() + +DEBOUNCE_INTERVAL;
  };

  /**
   * onClick
   * Global click router
   **/

  onClick = event => {
    if (this._nextEvent > Date.now()) return;

    const { x, y } = event;

    let isX = false;
    let isY = false;

    let listenerElement;

    for (const listener of Object.keys(this.listeners)) {
      listenerElement = this.listeners[listener];

      if (!listenerElement?.onClick) continue;

      const { left, top, width, height } = listenerElement;

      isX = x > left && x < +left + +width;
      isY = y > top && y < +top + +height;
    }

    if (!listenerElement?.onKeyDown || !isX || !isY) return;

    listenerElement.onClick.call(listenerElement, event);

    this._nextEvent = Date.now() + +DEBOUNCE_INTERVAL;
  };

  /**
   * onKeyDown
   * Global keydown router
   **/

  onKeyDown = event => {
    if (this._nextEvent > Date.now()) return;

    let listenerElement;

    for (const listener of Object.keys(this.listeners)) {
      listenerElement = this.listeners[listener];

      if (!listenerElement?.onKeyDown) continue;
    }

    if (!listenerElement?.onKeyDown) return;

    listenerElement.onKeyDown.call(listenerElement, event);

    this._nextEvent = Date.now() + +DEBOUNCE_INTERVAL;
  };

  /*******************************************
   * Instance methods
   *******************************************/

  open () {
    this.onLoad();
  }

  close () {
    this.onUnload();
  }
}

export default Vasari;
