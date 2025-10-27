import Konva from 'konva'

export async function showHolds() {
  fetch('wall.svg')
    .then((res) => res.text())
    .then((svgText) => {
      // 3️⃣ Parse SVG text into DOM
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')

      // 4️⃣ Find all <path> elements
      const paths = svgDoc.querySelectorAll('path')
      console.log('Found paths:', paths.length)

      const holdsgroup = new Konva.Group()
      paths.forEach((p, i) => {
        // Get basic attributes
        const d = p.getAttribute('d')
        const fill = p.getAttribute('fill') || 'white'
        const stroke = p.getAttribute('stroke') || 'black'
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
      layer.add(holdsgroup)
      state = holds.map((hold) => ({
        node: hold,
        id: hold.id(),
        // to: Math.random() < 0.5 ? 1 : -1,
        progress: 0,
        direction: Math.random() < 0.5 ? 1 : -1,
      }))
      // animatePaths(holds, layer, state, points)
    })
}
