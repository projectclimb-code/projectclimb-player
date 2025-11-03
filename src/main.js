import Konva from 'konva'
import { settings } from './settings'
import { scaleToScreen } from './utils/scale-to-screen'
import { websocketService } from './services/ws.service'
import { loadHolds } from './hold/load-hold'
import { createHelpers } from './utils/helpers'

websocketService.connect(import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080')
websocketService.subscribe((data) => {
  if (data.type === 'preview') {
    console.log('Preview data received:', data)
  }
})

const stage = new Konva.Stage({
  container: 'drawingContainer',
  width: window.innerWidth,
  height: window.innerHeight,
})
let holdsGroup

const layer = new Konva.Layer()
stage.add(layer)
createHelpers(layer)

const start = [130, 42]
const end = [106]
const boulder = [113, 41, 127, 124]

async function initialize() {
  holdsGroup = await loadHolds()

  scaleToScreen(holdsGroup, settings)
  layer.add(holdsGroup)
  stage.batchDraw()
}

initialize()
