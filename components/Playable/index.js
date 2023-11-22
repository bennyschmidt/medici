/*******************************************
 * Playable
 *
 * Extends Media with base methods and
 * properties for media playback
 *******************************************/

import { randomUUID } from 'crypto';

import { Media } from '../index.js';

class Playable extends Media {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    path,
    volume = 1.0,
    start = 0,
    tags = []
  }) {
    super({
      id,
      path,
      volume,
      start,
      tags: [...new Set(tags)]
    });

    this.type = 'playable';
    this.time = start;

    this.id = this.attributes.id = (
      id || `${this.type}-${randomUUID().slice(0, 8)}`
    );
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
