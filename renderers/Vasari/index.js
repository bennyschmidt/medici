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
  Link,
  View
} from '../../components/index.js';

import {
  DEBOUNCE_INTERVAL,
  WINDOW_OPTIONS,
  DEFAULT_FONT
} from '../../constants.js';

class Vasari extends App {

  /*******************************************
   * Init
   *******************************************/

  constructor (path, title = 'Vasari', state = {}) {
    const window = sdl.video.createWindow(WINDOW_OPTIONS);

    const { width, height } = window;
    const stride = width * 4;

    super({
      path,
      variables: {
        title
      }
    });

    this.state = {
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
    };

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

    this.events = {};
    this.listeners = {};
    this._nextEvent = Date.now() + +DEBOUNCE_INTERVAL;

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
    const html = HTMLParser.parse(
      this.value.replace(/\n/g, '').trim()
    );

    const { firstChild: rootElement } = html;

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

    const tagName = method.toUpperCase();
    const generatedId = `${method.toLowerCase()}-${randomUUID().slice(0, 8)}`;
    const { id = generatedId } = attributes;

    let component = this.state.components[id];

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

                  ...event
                };

                this.events[attributes.hover](syntheticEvent);
                this.state.components[id].onHover.call(this, syntheticEvent, this.state.components[id]);
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

                  ...event
                };

                this.events[attributes.click](syntheticEvent);
                this.state.components[id].onClick.call(this, syntheticEvent, this.state.components[id]);
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
        this.state.components[id] = new Rect({
          id,
          x: left,
          y: top,
          width,
          height
        });

        this.state.canvas.context[methodName](
          left,
          top,
          width,
          height
        );

        break;

      case 'TEXT':
        this.state.components[id] = (
          new Text({
            id,
            text: attributes.text,
            x: left,
            y: top,
            maxWidth
          })
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
          new Data({
            id,
            list: attributes.list,
            x: left,
            y: top,
            width,
            height
          })
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
        const image = new Image({
          id,
          path: attributes.path,
          x: left,
          y: top,
          width,
          height,

          onReady: () => {
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
        });

        this.state.components[id] = image;

        break;

      case 'VIEW':
        this.state.components[id] = (
          new View({
            x: left,
            y: top,
            width,
            height
          })
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
        if (!component || component.value !== this.state.search) {
          const placeholder = (
            component?.placeholder || 'Search apps & content...'
          );

          const value = (
            component?.value || ''
          );

          const input = (
            new Input({
              id,
              x: left,
              y: top,
              width,
              height,
              placeholder,
              value,
              textStyle: attributes.textStyle
            })
          );

          component = this.state.components[id] = input;

          if (component?.value) {
            this.state.search = component.value;
          }

          this.state.canvas.context[`${type}Rect`](
            left,
            top,
            width,
            height
          );

          const { textComponent } = input;

          this.state.components[textComponent.id] = textComponent;

          if (this.state.search) {
            this.state.canvas.context.fillStyle = textComponent.attributes.style;

            this.state.canvas.context.font = (
              DEFAULT_FONT.replace('italic', 'normal')
            );
          } else {
            this.state.canvas.context.fillStyle = '#666';

            this.state.canvas.context.font = (
              DEFAULT_FONT.replace('normal', 'italic')
            );
          }

          attributes.left = textComponent.attributes.left;
          attributes.top = textComponent.attributes.top;
          attributes.width = textComponent.attributes.width;
          attributes.height = textComponent.attributes.height;

          this.state.canvas.context.fillText(
            this.state.search || placeholder,
            textComponent.attributes.x,
            textComponent.attributes.y,
            textComponent.attributes.width
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

            onClick: nativeEvent => (
              component.onClick.call(
                this,
                {
                  ...nativeEvent,

                  ...inputEvent
                },
                component
              )
            ),

            onKeyDown: nativeEvent => (
              component.onKeyDown.call(
                this,
                {
                  ...nativeEvent,

                  ...inputEvent
                },
                component
              )
            ),
          };
        }

        break;

      case 'LINK':
        const link = (
          new Link({
            id,
            x: left,
            y: top,
            width,
            height,
            source: attributes.source,
            text: attributes.text,
            textStyle: attributes.textStyle
          })
        );

        component = this.state.components[id] = link;

        this.state.canvas.context[`${type}Rect`](
          left,
          top,
          width,
          height
        );

        const { textComponent } = link;

        this.state.components[textComponent.id] = textComponent;

        attributes.left = textComponent.attributes.left;
        attributes.top = textComponent.attributes.top;
        attributes.width = textComponent.attributes.width;
        attributes.height = textComponent.attributes.height;

        textComponent.attributes.style = (
          this.state.hoverTarget === id
            ? 'linear-gradient(purple, #111, 150, 50, 0, 0)'
            : (textComponent.attributes.style || 'white')
        );

        this.state.canvas.context.fillStyle = textComponent.attributes.style;

        this.state.canvas.context.fillText(
          textComponent.attributes.text || textComponent.attributes.source,
          textComponent.attributes.x,
          textComponent.attributes.y,
          textComponent.attributes.width
        );

        const pointerEvent = {
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
            onHover: null,
            onClick: null,
            component: this.state.components[id],
            element: this.state.elements[id]
          };
        }

        this.listeners[id] = {
          ...this.listeners[id],

          component,

          onHover: nativeEvent => (
            component.onHover.call(
              this,
              {
                ...nativeEvent,

                ...pointerEvent
              },
              component
            )
          ),

          onClick: nativeEvent => (
            component.onClick.call(
              this,
              {
                ...nativeEvent,

                ...pointerEvent
              },
              component
            )
          ),
        };

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
  };

  /**
   * onHover
   * Global hover router
   **/

  onHover = event => {
    if (this._nextEvent > Date.now()) return;

    this.state.hoverTarget = null;

    const { x, y } = event;

    let isX = false;
    let isY = false;

    let listenerElement;

    for (const listener of Object.keys(this.listeners)) {
      listenerElement = this.listeners[listener];

      if (!listenerElement?.onHover) continue;

      const {
        left,
        top,
        width,
        height
      } = listenerElement;

      isX = x >= left && x <= (left + +width);
      isY = y >= top && y <= (top + +height);

      if (isX && isY) {
        listenerElement.onHover(event);
      }
    }

    this._nextEvent = Date.now() + +DEBOUNCE_INTERVAL;
    this.render();
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

      const {
        left,
        top,
        width,
        height
      } = listenerElement;

      isX = x >= left && x <= (left + +width);
      isY = y >= top && y <= (top + +height);

      if (isX && isY) {
        listenerElement.onClick(event);
      }
    }

    this._nextEvent = Date.now() + +DEBOUNCE_INTERVAL;
    this.render();
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
    this.render();
  };
}

export default Vasari;
