import Konva from 'konva'
import { settings } from './settings'
import { scaleToScreen } from './utils/scale-to-screen'
import { websocketService } from './services/ws.service'
import { loadHolds } from './holds/load-hold'
import { createHelpers } from './utils/helpers'
import { setupHolds } from './holds/setup-holds'
import { loadFootholds } from './holds/load-footholds'
import { setupPoseCanvas } from './pose/pose'
import { playVideo } from './video/play-video'

websocketService.connect(import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080')

const stage = new Konva.Stage({
  container: 'drawingContainer',
  width: window.innerWidth,
  height: window.innerHeight,
})

const layer = new Konva.Layer()
stage.add(layer)
createHelpers(layer)

async function initialize() {
  const { holdsFootGroup } = await loadFootholds(stage)
  const { holdsGroup, state } = await loadHolds()
  // playVideo()
  setupPoseCanvas()
  setupHolds(state, stage)
  scaleToScreen(holdsGroup, settings)
  scaleToScreen(holdsFootGroup, settings)
  layer.add(holdsFootGroup)
  layer.add(holdsGroup)
  stage.batchDraw()
}

initialize()
