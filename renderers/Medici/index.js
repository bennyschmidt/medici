/*******************************************
 * Medici
 * A JSX-native peer-to-peer browser
 *******************************************/

import notifier from 'node-notifier';

import __dirname from '../../__dirname.js';
import Peers from '../../peers.json' assert { type: 'json' };

import { Vasari } from '../index.js';

const FILE_EXTENSIONS = {
  app: 'jsx',
  audio: 'mp3',
  data: 'json',
  image: 'png',
  page: 'jsx',
  text: 'txt',
  video: 'mp4'
};

const ERROR_MESSAGE = {
  'HTTP/404': 'Error fetching resource.'
};

class Medici extends Vasari {

  /*******************************************
   * Init
   *******************************************/

  constructor () {
    super(
      `${__dirname}/renderers/Medici/browser.jsx`,
      'Medici'
    );
  }

  /*******************************************
   * Methods
   *******************************************/

  onNavigate = async (path = '') => {
    if (!path) return;

    const [
      namespace = '',
      contentType = '',
      fileName = ''
    ] = path.toLowerCase().split(':');

    const type = contentType.toUpperCase();
    const isMedia = type === 'IMAGE' || type === 'VIDEO';

    let file = '';

    try {
      const response = await fetch(
        `${Peers[namespace]}/${contentType}/${fileName}.${FILE_EXTENSIONS[contentType]}`
      );

      if (!response?.ok) return;

      file = isMedia
        ? await response.arrayBuffer()
        : await response.text();

      if (!file?.toString) return;
    } catch (error) {
      const errorType = 'HTTP/404';
      const errorMessage = `${errorType} ${ERROR_MESSAGE[errorType]}`;

      console.warn(errorMessage, error?.message ||'(error)');
      notifier.notify(errorMessage);
    }

    const innerJSX = file.toString();

    if (isMedia) {
      const base64String = Buffer.from(file).toString('base64');
      const base64Prefix = base64String.slice(0, 3);

      switch (base64Prefix) {
        case '/9j':
          file = `data:image/jpg;base64,${base64String}`;

          break;
        case 'iVB':
          file = `data:image/png;base64,${base64String}`;

          break;
        case 'Qk0':
          file = `data:image/tiff;base64,${base64String}`;

          break;
        case '//v':
          file = `data:audio/mpeg;base64,${base64String}`;

          break;
        case 'AAA':
          file = `data:video/mpeg;base64,${base64String}`;

          break;
      }

      if (file.slice(0, 5) !== 'data:') {
        console.log('Error: Unknown file format.');
      }
    }

    switch (type) {
      case 'TEXT':
        this.value = `
          <Medici>
            <View id="root" x={0} y={0} width={1024} height={544}>
              <Text fill style="white" text="${file}" x={10} y={60} maxWidth={1024} />
            </View>
            <Input stroke id="search" lineWidth={0} style="transparent" placeholder="Search apps & content..." textStyle="white" x={5} y={5} width={1014} height={30} />
          </Medici>
        `;

        break;

      case 'DATA':
        const list = file
          .replace(/\n/g, '')
          .trim()
          .slice(1, -1)
          .trim();

        this.value = `
          <Medici>
            <View id="root" x={0} y={0} width={1024} height={544}>
              <Data style="white" list="${list}" x={10} y={60} maxWidth={1024} />
            </View>
            <Input stroke id="search" lineWidth={0} style="transparent" placeholder="Search apps & content..." textStyle="white" x={5} y={5} width={1014} height={30} />
          </Medici>
        `;

        break;

      case 'IMAGE':
        this.value = `
          <Medici>
            <View id="root" x={0} y={0} width={1024} height={544}>
              <Image path="${file}" x={0} y={0} width={1024} height={544} />
            </View>
            <Input stroke id="search" lineWidth={0} style="transparent" placeholder="Search apps & content..." textStyle="white" x={5} y={5} width={1014} height={30} />
          </Medici>
        `;

        break;

      case 'AUDIO':
        this.value = `
          <Medici>
            <View id="root" x={0} y={0} width={1024} height={544}>
              <Text fill style="white" text="Audio not yet supported." x={10} y={60} maxWidth={1024} />
              <Audio path="${file}" />
            </View>
            <Input stroke id="search" lineWidth={0} style="transparent" placeholder="Search apps & content..." textStyle="white" x={5} y={5} width={1014} height={30} />
          </Medici>
        `;

        break;

      case 'VIDEO':
        this.value = `
          <Medici>
            <View id="root" x={0} y={0} width={1024} height={544}>
              <Text fill style="white" text="Video not yet supported." x={10} y={56} maxWidth={1024} />
              <Video path="${file}" />
            </View>
            <Input stroke id="search" lineWidth={0} style="transparent" placeholder="Search apps & content..." textStyle="white" x={5} y={5} width={1014} height={30} />
          </Medici>
        `;

        break;

      case 'PAGE':
        const unsupportedTags = [
          ...rootElement.getElementsByTagName('Declare'),

          ...rootElement.getElementsByTagName('Event')
        ];

        for (const tag of unsupportedTags) {
          tag.remove();
        }

        this.value = `
          <Medici>
            <View id="root" x={0} y={0} width={1024} height={544}>
              ${innerJSX}
            </View>
            <Input stroke id="search" lineWidth={0} style="transparent" placeholder="Search apps & content..." textStyle="white" x={5} y={5} width={1014} height={30} />
          </Medici>
        `;

        break;

      case 'APP':
        this.value = `
          <Medici>
            <View id="root" x={0} y={0} width={1024} height={544}>
              ${innerJSX}
            </View>
            <Input stroke id="search" lineWidth={0} style="transparent" placeholder="Search apps & content..." textStyle="white" x={5} y={5} width={1014} height={30} />
          </Medici>
        `;

        break;
    }

    this.state.search = path;

    this.render();
  };

  /*******************************************
   * Instance methods
   *******************************************/

  open () {
    this.onLoad();
  }

  close () {
    this.onUnload();
  }
}

export default Medici;
