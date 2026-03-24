import { websocketService } from '@/services/ws.service'
import { settings } from '@/settings'
import Konva from 'konva'
import paper from 'paper'
import { PaperOffset } from 'paperjs-offset'

export async function loadButtons(stage) {
  const res = await fetch('wall_buttons.svg')
  const svgText = await res.text()
  // 3️⃣ Parse SVG text into DOM
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')

  // 4️⃣ Find all <path> elements
  const paths = svgDoc.querySelectorAll('path')
  const holds = []
  const buttonsGroup = new Konva.Group()
  const canvas = document.createElement('canvas')
  paper.setup(canvas)
  paths.forEach((p, i) => {
    // Get basic attributes

    const pp = paper.project.importSVG(p)
    const d = PaperOffset.offset(pp, 22, { miterLimit: 10 }).pathData
    // const fill = p.getAttribute('fill') || 'white'
    const stroke = p.getAttribute('stroke') || 'transparent'
    const strokeWidth = parseFloat(p.getAttribute('stroke-width') || 1)
    // 5️⃣ Create Konva.Path
    const konvaPath = new Konva.Path({
      id: `${i}`,
      data: d,
      stroke,
      strokeWidth,
      draggable: true,
      opacity: 0.5,
    })

    // 2️⃣ Get bounding box
    const box = konvaPath.getClientRect({ skipTransform: true })
    // compute gradient center and radius
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2
    const radius = Math.max(box.width, box.height) / 3 // cover full shape

    // apply radial gradient
    konvaPath.fill('white')
    // konvaPath.fillRadialGradientStartPoint({ x: cx, y: cy })
    // konvaPath.fillRadialGradientEndPoint({ x: cx, y: cy })
    // konvaPath.fillRadialGradientStartRadius(0)
    // konvaPath.fillRadialGradientEndRadius(radius)
    // konvaPath.fillRadialGradientColorStops([0.8, 'white', 1, 'transparent'])
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

    buttonsGroup.add(konvaPath)
    holds.push(konvaPath)
  })

  const state = holds.map((hold) => ({
    node: hold,
    id: hold.id(),
    // to: Math.random() < 0.5 ? 1 : -1,
    progress: 0,
    direction: Math.random() < 0.5 ? 1 : -1,
  }))
  // buttonsGroup.cache({ offset: 110 }) // you MUST cache before filtering
  // buttonsGroup.filters([Konva.Filters.Blur])
  // buttonsGroup.blurRadius(100)
  buttonsGroup.width(settings.wallWidth)
  buttonsGroup.height(settings.wallHeight)
  websocketService.subscribe((data) => {
    if (data.type === 'display' && data.layer === 'footholds') {
      holds.forEach((hold) => {
        hold.visible(!!data.visibility)
      })
      stage.batchDraw()
    }
    return
  })
  return { buttonsGroup, state }
}
