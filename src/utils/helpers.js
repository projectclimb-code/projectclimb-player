import { settings } from '@/settings'
import { createGridLayer } from './grid'
import Konva from 'konva'
import { scaleToScreen } from './scale-to-screen'
import { websocketService } from '@/services/ws.service'

export function createHelpers(layer) {
  // Add any helper functions here if needed in the future

  const wallGrid = createGridLayer({
    width: settings.wallWidth,
    height: settings.wallHeight,
    frequency: settings.gridFrequency, // horizontal spacing (x direction)
    color: 'white',
    lineWidth: 3,
    bottom: true,
  })

  const wallBackground = new Konva.Rect({
    x: 0,
    y: 0,
    width: settings.wallWidth,
    height: settings.wallHeight,
    fill: 'red',
    strokeWidth: 8,
    opacity: 1,
  })

  const background = new Konva.Rect({
    x: 0,
    y: 0,
    width: settings.screenWidth,
    height: settings.screenHeight,
    fill: 'white',
    strokeWidth: 4,
    opacity: 1,
  })
  scaleToScreen(wallBackground, settings)
  scaleToScreen(wallGrid, settings)
  background.visible(false)
  wallBackground.visible(false)
  wallGrid.visible(false)
  layer.add(background)
  layer.add(wallBackground)
  layer.add(wallGrid)

  websocketService.subscribe((data) => {
    if (data.type === 'display') {
      switch (data.layer) {
        case 'background':
          if (data.color) {
            background.fill(`#${data.color}`)
          } else {
            background.visible(!background.visible())
          }
          break
        case 'wallBackground':
          if (data.color) {
            wallBackground.fill(`#${data.color}`)
          } else {
            wallBackground.visible(!wallBackground.visible())
          }
          break
        case 'wallGrid':
          wallGrid.visible(!wallGrid.visible())
          break
        default:
          // console.warn('Unknown display action:', data.action)
          break
      }
    }
  })
  return { wallGrid, wallBackground, background }
}
