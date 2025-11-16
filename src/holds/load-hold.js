import { settings } from '@/settings'
import Konva from 'konva'
import paper from 'paper'
import { PaperOffset } from 'paperjs-offset'

export async function loadHolds() {
  const res = await fetch('/wall.svg')
  const svgText = await res.text()

  // 3️⃣ Parse SVG text into DOM
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')

  // 4️⃣ Find all <path> elements
  const paths = svgDoc.querySelectorAll('path')
  const holds = []
  const holdsgroup = new Konva.Group()
  const canvas = document.createElement('canvas')
  paper.setup(canvas)

  paths.forEach((p) => {
    // Get basic attributes

    const pp = paper.project.importSVG(p)
    const d = PaperOffset.offset(pp, 22, { miterLimit: 10 }).pathData
    const fill = p.getAttribute('fill') || 'white'
    const stroke = p.getAttribute('stroke') || 'black'
    const strokeWidth = parseFloat(p.getAttribute('stroke-width') || 1)
    const id = p.getAttribute('id').substring(5)
    // 5️⃣ Create Konva.Path
    const konvaPath = new Konva.Path({
      id: `${id}`,
      data: d,
      fill,
      stroke,
      strokeWidth,
      draggable: true,
    })
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

    holdsgroup.add(konvaPath)
    holds.push(konvaPath)
  })

  paths.forEach((p) => {
    // Get basic attributes

    const pp = paper.project.importSVG(p)
    const d = PaperOffset.offset(pp, 0, { miterLimit: 10 }).pathData
    const fill = p.getAttribute('fill') || 'black'
    const stroke = p.getAttribute('stroke') || 'black'
    const strokeWidth = parseFloat(p.getAttribute('stroke-width') || 1)
    const id = p.getAttribute('id').substring(5)
    // 5️⃣ Create Konva.Path
    const konvaPath = new Konva.Path({
      id: `${id}`,
      data: d,
      fill,
      stroke,
      strokeWidth,
    })
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

    holdsgroup.add(konvaPath)
    holds.push(konvaPath)
  })

  const state = holds.map((hold) => ({
    node: hold,
    id: hold.id(),
  }))

  holdsgroup.width(settings.wallWidth)
  holdsgroup.height(settings.wallHeight)

  return { holdsGroup: holdsgroup, state }
}
