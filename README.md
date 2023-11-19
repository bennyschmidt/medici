# Medici
A JSX-native peer-to-peer browser

![screenshot](https://github.com/bennyschmidt/medici/assets/45407493/1d6c378a-2dcd-4806-b4cb-1e87ad0ece4a)

`featured.jsx`

```jsx
<>
  <Text 
    fill 
    style="linear-gradient(purple, red, 150, 50, 0, 0)" 
    text="Featured files" 
    x={0} 
    y={56} 
  />

  <Link 
    source="@exactchange:text:example" 
    text="Example text link" 
    id="link1" 
    x={0} 
    y={80} 
    width={200} 
    height={24} 
  />

  <Link 
    source="@exactchange:image:example" 
    text="Example image link" 
    id="link3" 
    x={0} 
    y={128} 
    width={200} 
    height={24} 
  />

  <Link 
    source="@exactchange:audio:example" 
    text="Example audio link" 
    id="link5" 
    x={0} 
    y={176} 
    width={200} 
    height={24} 
  />

  <Link 
    source="@exactchange:page:example" 
    text="Example page link" 
    id="link7" 
    x={0} 
    y={224} 
    width={200} 
    height={24} 
  />
</>
```

Navigate to files in the peer network:

![image](https://github.com/bennyschmidt/medici/assets/45407493/409aed09-0a2f-404d-8366-fb8202b8088f)

##### Peers

Claim your `@alias` by adding it to [`peers.json`](https://github.com/bennyschmidt/medici/blob/master/peers.json) via a [Pull Request](https://github.com/bennyschmidt/medici/pulls). When approved, your content will be public in the network.

An entry in `peers.json` is as simple as:

```json
{
  "@youralias": "https://your.domain/somefolder"
}
```

When a user navigates to `@youralias` in Medici, the browser knows to look at `https://your.domain/somefolder` for the following sub-directories:


`/`

  `/app`
  
  `/audio`
  
  `/data`
  
  `/image`
  
  `/page`
  
  `/text`
  
  `/video`

These directories correspond to native content types in Medici:

`Text` - A raw text string

`Data` - A key/value data structure

`Image` - An image

`Audio` - An audio file

`Video` - A video file

`Page` - A static JSX page

`App` - An interactive JSX page with events & scripting

