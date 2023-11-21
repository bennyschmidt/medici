import { randomUUID } from 'crypto';

import { Media } from '../index.js';

/**
 * Playable
 */

class Playable extends Media {

  /*******************************************
   * Init
   *******************************************/

  constructor (
    path,
    {
      volume,
      start,
      tags,
      attributes = {}
    } = {
      volume: 1.0,
      start: 0,
      tags: [],
      attributes: {}
    }
  ) {
    super(path);

    this.type = 'playable';
    this.id = `${this.type}-${randomUUID().slice(0, 8)}`;
    this.volume = volume;
    this.time = start;
    this.tags = [...new Set(tags)];

    this.attributes = {
      ...this.attributes,

      ...attributes
    };
  }

  get currentTime () {
    return this.time;
  }

  set volumeUp (volume) {
    this.volume = Math.min(1, volume);
  }

  set volumeDown (volume) {
    this.volume = Math.max(0, volume);
  }

  play () {
    console.log('Play media');
  }

  stop () {
    console.log('Stop media');
  }
}

export default Playable;
