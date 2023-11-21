import { Playable } from '../index.js';

/**
 * Video
 */

class Video extends Playable {

  /*******************************************
   * Init
   *******************************************/

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
    }
  ) {
    super(
      path,

      {
        volume,
        start,
        tags,
        attributes
      }
    );

    this.type = 'video';
  }
}

export default Video;
