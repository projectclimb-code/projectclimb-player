import { websocketService } from '@/services/ws.service'
import { settings } from '@/settings'
import Konva from 'konva'

export async function loadPalms(stage) {

  const palmsGroup = new Konva.Group()
  const leftPalm = new Konva.Circle({
    x: 400,
    y: 400,
    radius: 50,
    fill: 'yellow'
  });
  const rightPalm = new Konva.Circle({
    x: 200,
    y: 400,
    radius: 50,
    fill: 'yellow'
  });
  palmsGroup.add(leftPalm)
  palmsGroup.add(rightPalm)

  palmsGroup.width(settings.wallWidth)
  palmsGroup.height(settings.wallHeight)
  websocketService.subscribe((data) => {
    if (data.palms.left_img) {
      leftPalm.x(data.palms.left_img.x * settings.wallWidth)
      leftPalm.y(data.palms.left_img.y * settings.wallHeight)
    }
    if (data.palms.right_img) {
      rightPalm.x(data.palms.right_img.x * settings.wallWidth)
      rightPalm.y(data.palms.right_img.y * settings.wallHeight)
    }
    stage.batchDraw()
  }, 'session')

  return { palmsGroup }
}
