import { randomUUID } from 'crypto';

import { Playable } from '../index.js';

/**
 * Video
 */

class Video extends Playable {

  /*******************************************
   * Init
   *******************************************/

  constructor ({
    id,
    path = '',
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

    this.type = 'video';

    this.id = this.attributes.id = (
      id || `${this.type}-${randomUUID().slice(0, 8)}`
    );
  }
}

export default Video;
