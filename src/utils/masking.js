import { settings } from '@/settings'
import Konva from 'konva'

export function setupMasking(layer) {
  // Calculate centered rectangle with 0.75 aspect ratio
  const stage = layer.getStage()
  const stageWidth = stage.width()
  const stageHeight = stage.height()

  // Calculate dimensions maintaining 0.75 aspect ratio
  let rectWidth, rectHeight
  if (stageWidth / stageHeight > 0.75) {
    // Stage is wider, constrain by height
    rectHeight = stageHeight
    rectWidth = rectHeight * 0.75
  } else {
    // Stage is taller, constrain by width
    rectWidth = stageWidth
    rectHeight = rectWidth / 0.75
  }
  const rectR = new Konva.Rect({
    x: (stageWidth - rectWidth) / 2 - 20,
    y: (stageHeight - rectHeight) / 2,
    width: settings.beamWidth + 18,
    height: settings.beamHeight,
    fill: 'black',
  })

  const rectL = new Konva.Rect({
    x: (stageWidth - rectWidth) / 2 + rectWidth - settings.beamWidth,
    y: (stageHeight - rectHeight) / 2,
    width: settings.beamWidth + 18,
    height: settings.beamHeight,
    fill: 'black',
  })
  layer.add(rectR)
  layer.add(rectL)
}
