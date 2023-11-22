# Medici
A JSX-native peer-to-peer browser

![screenshot](https://github.com/bennyschmidt/medici/assets/45407493/d148be80-5048-4832-b63a-48d478a72ce3)

`featured.jsx`

```jsx
<>
  <Text fill style="linear-gradient(purple, red, 150, 50, 0, 0)" size={26} text="Featured files" x={8} y={36} />
  <Link source="@exactchange:text:example" text="Example text link" id="link1" x={0} y={50} width={200} height={24} />
  <Link source="@exactchange:data:example" text="Example data link" id="link2" x={0} y={74} width={200} height={24} />
  <Link source="@exactchange:image:example" text="Example image link" id="link3" x={0} y={98} width={200} height={24} />
  <Link source="@exactchange:image:davinci" text="Davinci drawing link" id="link4" x={0} y={122} width={200} height={24} />
  <Link source="@exactchange:audio:example" text="Example audio link" id="link5" x={0} y={146} width={200} height={24} />
  <Link source="@exactchange:video:example" text="Example video link" id="link6" x={0} y={170} width={200} height={24} />
  <Link source="@exactchange:page:example" text="Example page link" id="link7" x={0} y={194} width={200} height={24} />
  <Link source="@exactchange:app:example" text="Example app link" id="link8" x={0} y={218} width={200} height={24} />
</>
```

Navigate to files in the peer network:

![screenshot(1)](https://github.com/bennyschmidt/medici/assets/45407493/bb418f52-41f0-4eff-9e64-3c4b1430e9f2)

##### Peer-to-peer

Claim your `@alias` by adding it to [`peers.json`](https://github.com/bennyschmidt/medici/blob/master/peers.json) via a [Pull Request](https://github.com/bennyschmidt/medici/pulls). When approved, your content will be public in the network.

An entry in `peers.json` is as simple as:

```json
{
  "@youralias": "https://your.domain/somefolder"
}
```

When a user navigates to `@youralias` in Medici, the browser knows to look at `https://your.domain/somefolder` for the following sub-directories:

    /app
    /audio 
    /data 
    /image
    /page
    /text
    /video

These directories correspond to native content types in Medici:

`Text` - A raw text string

`Data` - A key/value data structure

`Image` - An image

`Audio` - An audio file

`Video` - A video file

`Page` - A static JSX page that renders to `Canvas` (via [`node-canvas`](https://www.npmjs.com/package/canvas))

`App` - A `Page` with events & scripting

##### JSX-to-Canvas Renderer

- [Vasari](https://github.com/bennyschmidt/medici/blob/master/renderers/Vasari/index.js): Built using [`node-sdl`](https://github.com/kmamal/node-sdl)
- Cross-platform: SDL is based on C and is naturally cross-platform.
- No relation to conventional browsers: Not based on Chromium or Blink, WebKit, or any mainstream rendering engine.
- JSX is native code in Medici and transpiles to `Canvas` (not HTML/CSS rendering). 
- Supports native 2D and 3D drawing via `Canvas`, `WebGL`, and/or `WebGPU`.

##### Stateful JSX (native!) example

```jsx
<>
  <Declare foo={0} bar="baz">
    /* could be a self-closing tag if only defining vars */
  </Declare>

  <Declare qux={true} />

  <Declare>
    /* runs on every render */

    console.log('render', state);
  </Declare>

  <Event id="handleHover">
    /* event handling */

    console.log('hover', event, state.bar);

    state.bar = 'quux';
  </Event>

  <Event id="handleClick">
    /* state management */

    const { foo } = state;

    console.log('click', foo);
    state.set('foo', foo + 1);

    if (foo > 10) {
      console.log('click', event, foo);
    }
  </Event>

  <Text id="heading" fill style="white" text="Interactive Squares. The number is ${foo}" x={15} y={20} />

  <Rect id="redBox" fill style="red" x={0} y={30} width={100} height={100} hover={handleHover} />
  <Rect id="yellowBox" fill style="yellow" x={130} y={30} width={100} height={100} click={handleClick} />
  <Rect id="blueBox" fill style="blue" x={260} y={30} width={100} height={100} />
</>
```
