import Konva from 'konva'
import { Settings } from './settings'
import { createGridLayer } from './utils/grid'
import { animatePaths, updatePoints } from './utils/animate'
import { scaleToScreen } from './utils/scale-to-screen'
const settings = new Settings()
let zoom = parseFloat(localStorage.getItem('zoom')) || 1
let konvaImage
let holdsgroup
const stage = new Konva.Stage({
  container: 'drawingContainer',
  width: window.innerWidth,
  height: window.innerHeight,
})
const layer = new Konva.Layer()

const wallGridFreq = 200
const wallGrid = createGridLayer({
  width: settings.wallWidth,
  height: settings.wallHeight,
  frequency: wallGridFreq, // horizontal spacing (x direction)
  color: 'black',
  lineWidth: 2,
  bottom: true,
})

const rect = new Konva.Rect({
  x: 0,
  y: 0,
  width: settings.wallWidth,
  height: settings.wallHeight,
  fill: 'red',
  strokeWidth: 4,
  opacity: 0.5,
})

const rect2 = new Konva.Rect({
  x: 0,
  y: 0,
  width: settings.screenWidth,
  height: settings.screenHeight,
  fill: 'white',
  strokeWidth: 4,
  opacity: 1,
})

scaleToScreen(rect, settings, zoom)
scaleToScreen(wallGrid, settings, zoom)
layer.add(rect2)

layer.add(rect)
// layer.add(gridLayer)
stage.add(layer)
layer.add(wallGrid)

stage.batchDraw()

const imageObj = new Image()
imageObj.src = 'wall.png' // replace with your image path

const holds = []
let points = []
let state

points = updatePoints(points)
imageObj.onload = function () {
  // 3️⃣ Create Konva.Image
  konvaImage = new Konva.Image({
    x: 0,
    y: 0,
    image: imageObj,
  })
  scaleToScreen(konvaImage, settings, zoom)
  // layer.add(konvaImage)
  // konvaImage.moveToBottom()
  stage.batchDraw()
}

fetch('wall_ext.svg')
  .then((res) => res.text())
  .then((svgText) => {
    // 3️⃣ Parse SVG text into DOM
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')

    // 4️⃣ Find all <path> elements
    const paths = svgDoc.querySelectorAll('path')
    console.log('Found paths:', paths.length)

    holdsgroup = new Konva.Group()
    paths.forEach((p, i) => {
      // Get basic attributes
      const d = p.getAttribute('d')
      const fill = p.getAttribute('fill') || 'white'
      const stroke = p.getAttribute('stroke') || 'red'
      const strokeWidth = parseFloat(p.getAttribute('stroke-width') || 1)

      // 5️⃣ Create Konva.Path
      const konvaPath = new Konva.Path({
        id: `${i}`,
        data: d,
        fill,
        stroke,
        strokeWidth,
        draggable: true,
      })
      // const transformer = new Konva.Transformer({
      //   nodes: [konvaPath], // attach to the path
      //   enabledAnchors: [], // disable resizing anchors
      //   rotateEnabled: true,
      //   ignoreStroke: false, // include stroke in bounding box
      // })
      // 1️⃣ Get current absolute position
      // const absPos = konvaPath.getAbsolutePosition()

      // 2️⃣ Get bounding box
      const box = konvaPath.getClientRect({ skipTransform: true })

      // 3️⃣ Compute center of bounding box
      const centerX = box.x + box.width / 2
      const centerY = box.y + box.height / 2

      // 4️⃣ Compute offset shift
      const offsetShiftX = centerX - konvaPath.x()
      const offsetShiftY = centerY - konvaPath.y()

      // 5️⃣ Set offset to center
      konvaPath.offsetX(offsetShiftX)
      konvaPath.offsetY(offsetShiftY)

      // 6️⃣ Move path so it visually stays in the same place
      konvaPath.x(konvaPath.x() + offsetShiftX)
      konvaPath.y(konvaPath.y() + offsetShiftY)

      // Optional: redraw layer

      // Add to layer

      holdsgroup.add(konvaPath)
      // holdsgroup.add(transformer)
      holds.push(konvaPath)
    })
    holdsgroup.width(settings.wallWidth)
    holdsgroup.height(settings.wallHeight)
    scaleToScreen(holdsgroup, settings, zoom)
    state = holds.map((hold) => ({
      node: hold,
      id: hold.id(),
      // to: Math.random() < 0.5 ? 1 : -1,
      progress: 0,
      direction: Math.random() < 0.5 ? 1 : -1,
    }))
    layer.add(holdsgroup)
    const anim = new Konva.Animation((frame) => {
      animatePaths(frame, state, points)
    })
    anim.start()
  })
setInterval(() => {
  console.log('Updating points...')
  points = updatePoints(points)
}, 1000)
// window.addEventListener('keydown', (e) => {
//   const step = 0.01
//   if (e.key.toLowerCase() === 'o') {
//     zoom += step
//     console.log('Zoom increased:', zoom.toFixed(2))
//   }

//   if (e.key.toLowerCase() === 'l') {
//     zoom -= step
//     console.log('Zoom decreased:', zoom.toFixed(2))
//   }
//   if (e.key.toLowerCase() === 'i') {
//     zoom = 1
//     console.log('Zoom reset:', zoom.toFixed(2))
//   }
//   if (e.key.toLowerCase() === 'g') {
//     if (gridLayer.parent) {
//       gridLayer.remove()
//     } else {
//       layer.add(gridLayer)
//     }
//   }

//   scaleToScreen(konvaImage, settings, zoom)
//   scaleToScreen(rect, settings, zoom)
//   scaleToScreen(holdsgroup, settings, zoom)
//   scaleToScreen(wallGrid, settings, zoom)
//   stage.draw()
// })

// function saveZoom() {
//   localStorage.setItem('zoom', zoom.toString())
//   console.log('Zoom saved:', zoom)
// }
