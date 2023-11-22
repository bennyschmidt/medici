const FPS = 30;
const DEBOUNCE_INTERVAL = 30;

const WINDOW_OPTIONS = {
  title: 'Medici',
  width: 1024,
  height: 576,
  borderless: true
};

const DEFAULT_FONT_SIZE = 13;
const DEFAULT_FONT = `normal 500 ${DEFAULT_FONT_SIZE}px sans-serif`;

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

const DEFAULT_PATH = '@exactchange:page:featured';

const PRINTABLE_KEYS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
  'q',
  'w',
  'e',
  'r',
  't',
  'y',
  'u',
  'i',
  'o',
  'p',
  'a',
  's',
  'd',
  'f',
  'g',
  'h',
  'j',
  'k',
  'l',
  'z',
  'x',
  'c',
  'v',
  'b',
  'n',
  'm',
  '`',
  '~',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  '[',
  '{',
  ']',
  '}',
  '-',
  '_',
  '=',
  '+',
  ';',
  ':',
  '\'',
  '"',
  ',',
  '<',
  '.',
  '>',
  '/',
  '?',
  '\\',
  '|'
];

const SHIFT_KEYS = {
  '`': '~',
  '1': '!',
  '2': '@',
  '3': '#',
  '4': '$',
  '5': '%',
  '6': '^',
  '7': '&',
  '8': '*',
  '9': '(',
  '10': ')',
  '[': '{',
  ']': '}',
  '-': '_',
  '=': '+',
  ';': ':',
  '\'': '"',
  ',': '<',
  '.': '>',
  '/': '?',
  '\\': '|'
};

export {
  FPS,
  DEBOUNCE_INTERVAL,
  WINDOW_OPTIONS,
  DEFAULT_FONT,
  DEFAULT_FONT_SIZE,
  FILE_EXTENSIONS,
  ERROR_MESSAGE,
  DEFAULT_PATH,
  PRINTABLE_KEYS,
  SHIFT_KEYS
};
