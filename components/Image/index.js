/*******************************************
 * Image
 *
 * A viewable image
 *******************************************/

import { randomUUID } from 'crypto';

import { WINDOW_OPTIONS } from '../../constants.js';

import { Media } from '../index.js';

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

  constructor ({
    id,
    path = '',
    x = 0,
    y = 0,
    width = WINDOW_OPTIONS.width,
    height = WINDOW_OPTIONS.height,
    tags = [],
    onReady = () => null
  }) {
    super({
      id,
      path,
      x,
      y,
      width,
      height,
      tags: [...new Set(tags)]
    });

    this.type = 'image';

    this.id = this.attributes.id = (
      id || `${this.type}-${randomUUID().slice(0, 8)}`
    );

    onReady();
  }

  get pixelWidth () {
    return this.width;
  }

  get pixelHeight () {
    return this.height;
  }

  /**
   * onHover
   * Handle hover
   **/

  onHover (event, component) {
    console.log('Image.onHover', event, component.id);
  }

  /**
   * onClick
   * Handle click
   **/

  onClick (event, component) {
    console.log('Image.onClick', event, component.id);
  }
}

export default Image;
