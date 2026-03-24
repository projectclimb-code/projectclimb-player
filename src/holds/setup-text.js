import { websocketService } from '@/services/ws.service'
import { settings } from '@/settings'
import Konva from 'konva'

export async function loadText(stage) {

  const textGroup = new Konva.Group()
  const textNode = new Konva.Text({
    x: 50,
    y: settings.wallHeight - 200,
    text: 'Hello',
    fontSize: 100,
    fill: 'white'
  });
  textGroup.add(textNode)

  textGroup.width(settings.wallWidth)
  textGroup.height(settings.wallHeight)
  websocketService.subscribe((data) => {
    if (data.type === 'display' && data.layer === 'text') {
      textNode.setText(data.text)
      stage.batchDraw()
    }
    return
  })
  return { textGroup }
}
