import { randomUUID } from 'crypto';

import { Media } from '../index.js';

/**
 * Video
 */

class Video extends Media {
  constructor (
    path,
    {
      volume,
      start,
      tags,
      attributes
    } = {
      volume: 1.0,
      start: 0,
      tags: [],
      attributes: {}
    },
    onLoad = async source => this.onLoad(source)
  ) {
    super(path, onLoad);

    this.type = 'video';
    this.id = `${this.type}-${randomUUID().slice(0, 8)}`;
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

  onReady () {
    this.play();
  }

  play () {
    console.log('Play Video');
  }

  stop () {
    console.log('Stop Video');
  }
}

export default Video;
