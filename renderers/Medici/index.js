/*******************************************
 * Medici
 * A JSX-native peer-to-peer browser
 *******************************************/

import __dirname from '../../__dirname.js';

import { Vasari } from '../index.js';

import Peers from '../../peers.json' assert { type: 'json' };

const FILE_EXTENSIONS = {
  app: 'jsx',
  audio: 'mp3',
  data: 'json',
  image: 'png',
  page: 'jsx',
  text: 'txt',
  video: 'mp4'
};

class Medici extends Vasari {

  /*******************************************
   * Init
   *******************************************/

  constructor () {
    super(
      `${__dirname}/renderers/Medici/home.jsx`,
      'Medici'
    );
  }

  /*******************************************
   * Methods
   *******************************************/

  onNavigate = async path => {
    const rootElement = this.state.elements.find(({ id, rawTagName }) => (
      id === 'root' || rawTagName === 'Medici'
    ));

    const [
      namespace,
      contentType,
      fileName
    ] = path.toLowerCase().split(':');

    const response = await fetch(
      `${Peers[namespace]}/${contentType}/${fileName}.${FILE_EXTENSIONS[contentType]}`
    );

    const type = contentType.toUpperCase();

    const isMedia = type === 'IMAGE' || type === 'VIDEO';

    if (!response?.ok) return;

    let file = isMedia
      ? await response.arrayBuffer()
      : await response.text();

    if (!file?.toString) return;

    rootElement.innerHTML = file.toString();

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
            <Text fill style="white" text="${file}" x={10} y={74} maxWidth={1024} />
            <Text stroke style="#666" text="Search apps & content..." x={20} y={33} maxWidth={984} />
            <Rect stroke lineJoin="bevel" lineWidth={2} style="linear-gradient(purple, red, 0, 0, 0, 150)" x={5} y={5} width={1014} height={50} />
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
            <Data style="white" list="${list}" x={10} y={74} maxWidth={1024} />
            <Text stroke style="#666" text="Search apps & content..." x={20} y={33} maxWidth={984} />
            <Rect stroke lineJoin="bevel" lineWidth={2} style="linear-gradient(purple, red, 0, 0, 0, 150)" x={5} y={5} width={1014} height={50} />
          </Medici>
        `;

        break;

      case 'IMAGE':
        this.value = `
          <Medici>
            <Image cover path="${file}" x={0} y={64} width={1024} height={515} />
            <Text stroke style="#666" text="Search apps & content..." x={20} y={33} maxWidth={984} />
            <Rect stroke lineJoin="bevel" lineWidth={2} style="linear-gradient(purple, red, 0, 0, 0, 150)" x={5} y={5} width={1014} height={50} />
          </Medici>
        `;

        break;

      case 'AUDIO':
        this.value = `
          <Medici>
            <Text fill style="white" text="Audio not yet supported." x={10} y={74} maxWidth={1024} />
            <Audio path="${file}" />
            <Text stroke style="#666" text="Search apps & content..." x={20} y={33} maxWidth={984} />
            <Rect stroke lineJoin="bevel" lineWidth={2} style="linear-gradient(purple, red, 0, 0, 0, 150)" x={5} y={5} width={1014} height={50} />
          </Medici>
        `;

        break;

      case 'VIDEO':
        this.value = `
          <Medici>
            <Text fill style="white" text="Video not yet supported." x={10} y={74} maxWidth={1024} />
            <Video path="${file}" />
            <Text stroke style="#666" text="Search apps & content..." x={20} y={33} maxWidth={984} />
            <Rect stroke lineJoin="bevel" lineWidth={2} style="linear-gradient(purple, red, 0, 0, 0, 150)" x={5} y={5} width={1014} height={50} />
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
            <Rect fill style="#222" x={0} y={64} width={1024} height={515}>
              ${rootElement.innerHTML}
            </Rect>
            <Text stroke style="#666" text="Search apps & content..." x={20} y={33} maxWidth={984} />
            <Rect stroke lineJoin="bevel" lineWidth={2} style="linear-gradient(purple, red, 0, 0, 0, 150)" x={5} y={5} width={1014} height={50} />
          </Medici>
        `;

        break;

      case 'APP':
        this.value = `
          <Medici>
            <Rect fill style="#222" x={0} y={64} width={1024} height={515}>
              ${rootElement.innerHTML}
            </Rect>
            <Text stroke style="#666" text="Search apps & content..." x={20} y={33} maxWidth={984} />
            <Rect stroke lineJoin="bevel" lineWidth={2} style="linear-gradient(purple, red, 0, 0, 0, 150)" x={5} y={5} width={1014} height={50} />
          </Medici>
        `;

        break;
    }
  };

  open = () => this.onLoad();

  close = () => this.onUnload();
}

export default Medici;
