import { Playable } from '../index.js';

/**
 * Audio
 */

class Audio extends Playable {

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

    this.type = 'audio';
  }
}

export default Audio;
