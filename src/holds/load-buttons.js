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

    // 5️⃣ Create Konva.Path
    const konvaPath = new Konva.Path({
      id: p.id,
      data: d,
      draggable: true,
      opacity: 0.5,
    })

    // 2️⃣ Get bounding box
    const box = konvaPath.getClientRect({ skipTransform: true })
    // compute gradient center and radius
    const cx = box.x + box.width / 2
    const cy = box.y + box.height / 2


    // apply radial gradient
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
  holds.forEach((hold) => {
    assignHoldStyle(hold, hold.id() + '_inactive')
  })
  buttonsGroup.width(settings.wallWidth)
  buttonsGroup.height(settings.wallHeight)
  websocketService.subscribe((data) => {
    console.log(data)
    holds.forEach((hold) => {
      if (data.mode === hold.id()) {
        assignHoldStyle(hold, hold.id() + '_active')
      } else {
        assignHoldStyle(hold, hold.id() + '_inactive')
      }

    })
    stage.batchDraw()
    return
  }, 'session')
  return { buttonsGroup }
}
const assignHoldStyle = (hold, holdStyle) => {
  let style = {}
  if (styles[holdStyle]) {
    style = styles[holdStyle]
  } else {
    style = styles['normal']
  }
  if (hold) {
    Object.entries(style).forEach(([key, value]) => {
      hold.setAttr(key, value)
    })
  }
}

const styles = {
  normal: {
    fill: '#ffffff',
    stroke: '#fff',
    strokeWidth: 12,
    opacity: 1,
  },
  easy_active: {
    fill: '#00ff00',
    stroke: '#009900',
    strokeWidth: 12,
    opacity: 1,
  },
  hard_active: {
    fill: '#ff5900ff',
    stroke: '#f00707ff',
    strokeWidth: 12,
    opacity: 1,
  },
  medium_active: {
    fill: '#265af5',
    stroke: '#2014d2',
    strokeWidth: 12,
    opacity: 1,
  },
  easy_inactive: {
    fill: '#ffffff',
    stroke: '#009900',
    strokeWidth: 12,
    opacity: 1,
  },
  hard_inactive: {
    fill: 'rgb(255, 255, 255)',
    stroke: '#f00707ff',
    strokeWidth: 12,
    opacity: 1,
  },
  medium_inactive: {
    fill: '#ffffff',
    stroke: '#2014d2',
    strokeWidth: 12,
    opacity: 1,
  },
  draw_active: {
    fill: '#adbbe5',
    stroke: '#2014d2',
    strokeWidth: 12,
    opacity: 1,
  },
  draw_inactive: {
    fill: '#ffffff',
    stroke: '#2014d2',
    strokeWidth: 12,
    opacity: 1,
  }
}
