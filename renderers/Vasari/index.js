/*******************************************
 * Vasari
 * A JSX-to-Canvas Renderer
 *
 * You must extend this class with
 * controller logic and an accompanying
 * JSX file.
 *******************************************/

import __dirname from '../../__dirname.js';

import sdl from '@kmamal/sdl';
import HTMLParser from 'node-html-parser';
import Canvas from 'canvas';

import {
  App,
  Rect,
  Text,
  Data,
  Image
} from '../../components/index.js';

const FPS = 30;

const WINDOW_OPTIONS = {
  title: "Window",
  accelerated: true,
  popupMenu: false,
  width: 1024,
  height: 576,
  resizable: true
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
          elements: [],
          components: []
        }
      }
    );

    this.window = window;

    this.location = {
      host: null
    };

    this.events = {};
    this.listeners = {};

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
   * onAnimate
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

    this.state.elements = [rootElement];

    this.state.elements.forEach(this.renderElement.bind(this));
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
    const { id } = attributes;

    switch (tagName) {
      case 'RECT':
      case 'TEXT':
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
                hover: null,
                click: null
              };
            }

            this.listeners[id] = {
              ...this.listeners[id],

              hover: nativeEvent => {
                this.events[attributes.hover]({
                  ...nativeEvent,

                  event
                });
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
                hover: null,
                click: null
              };
            }

            this.listeners[id] = {
              ...this.listeners[id],

              click: nativeEvent => {
                this.events[attributes.click]({
                  ...nativeEvent,

                  event
                });
              }
            };
          }
        }
    }

    switch (tagName) {
      case 'RECT':
        this.state.components.push(
          new Rect(
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
          )
        );

        this.state.canvas.context[methodName](
          left,
          top,
          width,
          height
        );

        break;

      case 'TEXT':
        this.state.components.push(
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
        this.state.components.push(
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

            const isContain = !!attributes.cover;

            canvasImage.onload = () => {
              const {
                width: imageWidth,
                height: imageHeight
              } = Image[isContain ? 'contain' : 'cover'](
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

              this.render2d();
            };

            canvasImage.src = attributes.path;
          }
        );

        this.state.components.push(image);

        break;

      case 'VIEW':
        this.state.components.push(
          new Rect(
            left,
            top,
            width,
            height,
            {
              id: attributes.id,
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`
            }
          )
        );

        this.state.canvas.context.fillStyle = element.childNodes.length
          ? '#fff'
          : '#111';

        this.state.canvas.context.fillRect(
          0,
          60,
          width,
          height
        );

        break;

      case 'EVENT':
        this.events[id] = function (event) {
          const [{ _rawText } = {}] = element.childNodes;

          eval(`(event => { ${_rawText} })(event)`);
        };

        break;
    }

    element.childNodes.forEach(child => this.renderElement(child));
  };

  open = () => this.onLoad();

  close = () => this.onUnload();

  /*******************************************
   * Events
   *******************************************/

  /**
   * onResize
   * Handle window resize
   **/

  onResize = () => this.redraw();

  /**
   * onReady
   * Handle window ready
   **/

  onReady = () => this.open();

  /**
   * onAnimate
   * Handle window animate
   **/

  onAnimate = () => {
    let { elements } = this.state;

    if (elements?.length) {
      elements = elements.pop();

      this.state.components = [];
      this.state.elements = [];
    }

    if (this.value) {
      if (this.state.canvas.context) {
        this.state.canvas.context.clearRect(
          0,
          0,
          this.state.width,
          this.state.height
        );
      }

      this.parseJSX();
    }

    this.render2d();
  };

  /**
   * onLoad
   * Handle window load
   **/

  onLoad = () => {
    const onResize = this.onResize.bind(this);
    const onClick = this.onClick.bind(this);
    const onHover = this.onHover.bind(this);

    this.window.off('resize', onResize);
    this.window.on('resize', onResize);

    this.window.off('mouseButtonDown', onClick);
    this.window.on('mouseButtonDown', onClick);

    this.window.off('mouseMove', onHover);
    this.window.on('mouseMove', onHover);

    this.state.canvas = Canvas.createCanvas(this.state.width, this.state.height);
    this.interval = setInterval(this.onAnimate.bind(this), (1000 / FPS));
  };

  /**
   * onUnload
   * Handle window unload
   **/

  onUnload = () => {
    this.window.off('resize', this.onResize.bind(this));
    this.window.off('mouseButtonDown', this.onClick.bind(this));
    this.window.off('mouseMove', onHover);
    clearInterval(this.interval);
  };

  /**
   * onHover
   * Global hover router
   **/

  onHover = event => {
    const { x, y } = event;

    for (const listener of Object.keys(this.listeners)) {
      const listenerElement = this.listeners[listener];

      if (!listenerElement?.hover) continue;

      const { left, top, width, height } = listenerElement;

      const isX = x > left && x < +left + +width;
      const isY = y > top && y < +top + +height;

      if (isX && isY) {
        listenerElement.hover.call(listenerElement, event);
      }
    }
  };

  /**
   * onClick
   * Global click router
   **/

  onClick = event => {
    const { x, y } = event;

    for (const listener of Object.keys(this.listeners)) {
      const listenerElement = this.listeners[listener];

      if (!listenerElement?.click) continue;

      const { left, top, width, height } = listenerElement;

      const isX = x > left && x < +left + +width;
      const isY = y > top && y < +top + +height;

      if (isX && isY) {
        listenerElement.click.call(listenerElement, event);
      }
    }
  };
}

export default Vasari;
