import { randomUUID } from 'crypto';

import { Media } from '../index.js';

/**
 * Image
 */

class Image extends Media {
  static fit (isContain) {
    return (
      parentWidth,
      parentHeight,
      childWidth,
      childHeight,
      scale = 1,
      offsetX = 0.5,
      offsetY = 0.5
    ) => {
      const childRatio = childWidth / childHeight;
      const parentRatio = parentWidth / parentHeight;

      let width = parentWidth * scale;
      let height = parentHeight * scale;

      if (isContain ? (childRatio > parentRatio) : (childRatio < parentRatio)) {
        height = width / childRatio;
      } else {
        width = height * childRatio;
      }

      return {
        width,
        height,
        offsetX: (parentWidth - width) * offsetX,
        offsetY: (parentHeight - height) * offsetY
      };
    }
  }

  static contain = Image.fit(true)

  static cover = Image.fit(false)

  /*******************************************
   * Init
   *******************************************/

  constructor (
    path,
    {
      x = 0,
      y = 0,
      width = 0,
      height = 0,
      tags = [],
      attributes = {}
    } = {
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      tags: [],
      attributes: {}
    },
    onReady = source => this.onReady(source)
  ) {
    super(path, onReady);

    this.type = 'image';
    this.id = `${this.type}-${randomUUID().slice(0, 8)}`;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.tags = [...new Set(tags)];
    this.attributes = attributes;
  }

  get pixelWidth () {
    return `${this.width}px`;
  }

  get pixelHeight () {
    return `${this.height}px`;
  }

  /*******************************************
   * Instance methods
   *******************************************/

  toString () {
    return `<Image #${this.id}>`;
  }

  onHover (event, component) {
    console.log('Image.onHover', event, component.id);
  }

  onClick (event, component) {
    console.log('Image.onClick', event, component.id);
  }
}

export default Image;
