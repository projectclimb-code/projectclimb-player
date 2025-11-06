import Konva from 'konva'

// Load canvg library
const script = document.createElement('script')
script.src = 'https://cdn.jsdelivr.net/npm/canvg/dist/browser/canvg.min.js'
document.head.appendChild(script)

console.log('Konva version:', Konva.version)
const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
})

const layer = new Konva.Layer()
stage.add(layer)

const SOURCE = 'https://konvajs.org/assets/tiger.svg'

// try to draw SVG natively
Konva.Image.fromURL(SOURCE, (imageNode) => {
  layer.add(imageNode)
  imageNode.setAttrs({
    width: 150,
    height: 150,
  })
})

// draw svg with external library
script.onload = () => {
  const canvas = document.createElement('canvas')
  canvg(canvas, SOURCE, {
    renderCallback: function () {
      const image = new Konva.Image({
        image: canvas,
        x: 200,
        width: 150,
        height: 150,
      })
      layer.add(image)
    },
  })
}
