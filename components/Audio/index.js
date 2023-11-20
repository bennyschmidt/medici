import { randomUUID } from 'crypto';

import { Media } from '../index.js';

/**
 * Audio
 */

class Audio extends Media {

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
    },
    onLoad = async source => this.onLoad(source)
  ) {
    super(path, onLoad);

    this.type = 'audio';
    this.id = attributes.id || `${this.type}-${randomUUID().slice(0, 8)}`;
    this.volume = volume;
    this.time = start;
    this.tags = [...new Set(tags)];
    this.attributes = attributes;
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

  /*******************************************
   * Instance methods
   *******************************************/

  onReady () {
    this.play();
  }

  toString () {
    return `<Video #${this.id}>`;
  }

  play () {
    console.log('Play Video');
  }

  stop () {
    console.log('Stop Video');
  }
}

export default Audio;
