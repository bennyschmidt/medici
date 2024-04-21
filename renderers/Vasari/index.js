/*******************************************
 * Vasari
 * A JSX-to-Canvas renderer
 *
 * Transpiles JSX markup to Canvas
 * drawing, manages a render loop,
 * tracks a component tree, binds
 * user events and scripting, and
 * retains window and document
 * states
 *******************************************/

import { exec } from 'child_process';
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
  DRAG_DROP_TIMEOUT,
  WINDOW_OPTIONS,
  DEFAULT_FONT,
  DEFAULT_FONT_SIZE,
  DEFAULT_PATH
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
      baseUrl: DEFAULT_PATH,
      input: {}
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
   * render
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
    const variables = this.value.match(/\$\{(.*?)\}/g);

    let outerJSX = this.value.slice();

    if (variables?.length) {
      for (const result of variables) {
        const parsedVariable = (
          result.slice(result.indexOf('{') + 1, result.indexOf('}'))
        );

        const stateValue = this.docState.get(parsedVariable);

        if (stateValue || parsedVariable in this.docState) {
          outerJSX = (
            this.value.replace(result, stateValue)
          );
        }
      }
    }

    const html = HTMLParser.parse(
      outerJSX.replace(/\n/g, '').trim()
    );

    const { firstChild: rootElement } = html;

    return rootElement;
  };

  /**
   * getComponentById
   * Query a state component
   **/

  getComponentById = id => this.state.components[id];

  /**
   * getElementById
   * Query a state element
   **/

  getElementById = id => {
    console.log(this.state.elements[id]);

    return this.state.elements[id];
  };

  /**
   * updateElementById
   * Query and update state element
   **/

  updateElementById = (id, update = {}) => {
    const component = this.getComponentById(id);
    const element = this.getElementById(id);

    if (!component?.attributes || !element?.attributes) return;

    for (const key of Object.keys(update)) {
      const value = update[key];

      component[key] = value;
      component.attributes[key] = value;
      element[key] = value;
      element.attributes[key] = value;
    }

    console.log(`<${element.rawTagName} ${element.rawAttrs}/>`);

    this.state.components[id] = component;
    this.state.elements[id] = element;

    this.render();
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

    const fontSize = (
      attributes?.size || DEFAULT_FONT_SIZE
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
      lineWidth,
      fontSize
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
      lineWidth,
      fontSize
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
      case 'INPUT':
        const isEventTarget = (
          attributes.hover ||
          attributes.click ||
          attributes.keydown
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
                onKeyDown: null,
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
                onKeyDown: null,
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

          if (attributes.keydown) {
            if (!this.listeners[id]) {
              this.listeners[id] = {
                left,
                top,
                width,
                height,
                onHover: null,
                onClick: null,
                onKeyDown: null,
                component: this.state.components[id],
                element: this.state.elements[id]
              };
            }

            this.listeners[id] = {
              ...this.listeners[id],

              onKeyDown: nativeEvent => {
                const syntheticEvent = {
                  ...nativeEvent,

                  ...event
                };

                this.events[attributes.keydown](syntheticEvent);
                this.state.components[id].onKeyDown.call(this, syntheticEvent, this.state.components[id]);
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
            maxWidth,
            size: fontSize
          })
        );

        if (fontSize) {
          this.state.canvas.context.font = (
            DEFAULT_FONT.replace(`${DEFAULT_FONT_SIZE}px`, `${fontSize}px`)
          );
        }

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
        if (!component || component.value !== this.state.input[component.id]) {
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
            this.state.input[component.id] = component.value;
          }

          const inputRectGradient = this.state.canvas.context.createLinearGradient(
            50,
            50,
            0,
            0
          );

          inputRectGradient.addColorStop(0, '#80008020');
          inputRectGradient.addColorStop(1, 'transparent');

          this.state.canvas.context.fillStyle = inputRectGradient;

          this.state.canvas.context.fillRect(
            left,
            top,
            width || 1024,
            height || 36
          );

          const inputBorderGradient = this.state.canvas.context.createLinearGradient(
            512,
            50,
            0,
            0
          );

          inputBorderGradient.addColorStop(0, '#80008020');
          inputBorderGradient.addColorStop(1, '#111');

          this.state.canvas.context.fillStyle = inputBorderGradient;

          this.state.canvas.context.fillRect(
            left,
            top + 36,
            width || 1024,
            1
          );

          const { textComponent } = input;

          this.state.components[textComponent.id] = textComponent;

          attributes.left = textComponent.attributes.left;
          attributes.top = textComponent.attributes.top;
          attributes.width = textComponent.attributes.width;
          attributes.height = textComponent.attributes.height;

          if (this.state.input[component.id]) {
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

          this.state.canvas.context.textRendering = 'optimizeLegibility';

          this.state.canvas.context.fillText(
            this.state.input[component.id] || placeholder,
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
              onHover: null,
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
            )
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
            ? 'indigo'
            : textComponent.attributes.style
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
            onKeyDown: null,
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
          )
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

          const state = {
            ...this.docState,

            exec
          };

          eval(`(() => { ${_rawText} })()`);
        }

        break;

      case 'EVENT':
        this.events[id] = event => {
          const [{ _rawText } = {}] = element.childNodes;

          const state = {
            ...this.docState,

            exec
          };

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

        this.state.canvas.context.font = DEFAULT_FONT;
        this.state.canvas.context.fillStyle = null;
        this.state.canvas.context.strokeStyle = null;
        this.state.canvas.context.shadowColor = null;
        this.state.canvas.context.shadowBlur = null;
        this.state.canvas.context.lineJoin = null;
        this.state.canvas.context.lineWidth = null;
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
   *
   * onResize
   * onLoad
   * onUnload
   * onHover
   * onClick
   * onKeyDown
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

  onLoad = (source) => {
    this.source = source;

    const onResize = this.onResize.bind(this);
    const onClick = this.onClick.bind(this);
    const onMouseUp = this.onMouseUp.bind(this);
    const onHover = this.onHover.bind(this);
    const onKeyDown = this.onKeyDown.bind(this);

    this.window.off('resize', onResize);
    this.window.on('resize', onResize);

    this.window.off('mouseButtonDown', onClick);
    this.window.on('mouseButtonDown', onClick);

    this.window.off('mouseButtonUp', onMouseUp);
    this.window.on('mouseButtonUp', onMouseUp);

    this.window.off('mouseMove', onHover);
    this.window.on('mouseMove', onHover);

    this.window.off('keyDown', onKeyDown);
    this.window.on('keyDown', onKeyDown);

    this.window.setAccelerated(true);

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
    this.window.off('mouseButtonUp', this.onMouseUp.bind(this));
    this.window.off('mouseMove', this.onHover.bind(this));
    this.window.off('keyDown', this.onKeyDown.bind(this));
  };

  /**
   * onHover
   * Global hover router
   **/

  onHover = event => {
    if (this._nextEvent > Date.now()) return;

    sdl.mouse.setCursor('arrow');

    const isDragging = Boolean(this.state.dragStart);
    const clickDuration = Date.now() - this.state.dragStart;

    if (isDragging && (clickDuration > DRAG_DROP_TIMEOUT)) {
      sdl.mouse.setCursor('crosshair');

      return;
    }

    this.state.hoverTarget = null;

    const { x, y } = event;

    let isX = false;
    let isY = false;

    let listenerElement;

    for (const listener of Object.keys(this.listeners)) {
      listenerElement = this.listeners[listener];

      const {
        left,
        top,
        width,
        height
      } = listenerElement;

      isX = x >= left && x <= (left + +width);
      isY = y >= top && y <= (top + +height);

      if (isX && isY) {
        const component = this.state.components[listener];

        if (listenerElement?.onHover) {
          listenerElement.onHover.call(this, event, component);
        } else {
          component.onHover.call(this, event, component);
        }
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
    const now = Date.now();

    this.state.dragStart = now;

    if (this._nextEvent > now) return;

    const { x, y } = event;

    let isX = false;
    let isY = false;

    let listenerElement;

    for (const listener of Object.keys(this.listeners)) {
      const element = this.listeners[listener];

      if (!element?.onClick) continue;

      listenerElement = element;

      const {
        left,
        top,
        width,
        height
      } = listenerElement;

      isX = x >= left && x <= (left + +width);
      isY = y >= top && y <= (top + +height);

      if (isX && isY) {
        const component = this.state.components[listener];

        if (listenerElement?.onClick) {
          listenerElement.onClick.call(this, event, component);
        } else {
          component.onClick.call(this, event, component);
        }
      }
    }

    this._nextEvent = Date.now() + +DEBOUNCE_INTERVAL;
    this.render();
  };

  /**
   * onMouseUp
   * Global mouseup router
   **/

  onMouseUp = event => {
    this.state.dragStart = null;
  };

  /**
   * onKeyDown
   * Global keydown router
   **/

  onKeyDown = event => {
    if (this._nextEvent > Date.now()) return;

    for (let listener of Object.keys(this.listeners)) {
      const listenerElement = this.listeners[listener];

      if (listenerElement?.onKeyDown) {
        const component = this.state.components[listener];

        if (listenerElement?.onKeyDown) {
          listenerElement.onKeyDown.call(this, event, component);
        } else {
          component.onKeyDown.call(this, event, component);
        }
      }
    }

    this._nextEvent = Date.now() + +DEBOUNCE_INTERVAL;
    this.render();
  };
}

export default Vasari;
