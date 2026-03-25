import { websocketService } from '@/services/ws.service'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { POSE_CONNECTIONS } from '@mediapipe/pose'
import { settings } from '@/settings'

export function setupPoseCanvas() {
  const canvas = document.getElementById('poseCanvas')
  canvas.width = settings.wallWidth * (window.innerHeight / settings.wallHeight)
  canvas.height = settings.wallHeight * (window.innerHeight / settings.wallHeight)
  const ctx = canvas.getContext('2d')
  let lastPose = new Date()
  setInterval(() => {
    if (new Date() - lastPose > 2000) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, 1000)
  websocketService.subscribe((data) => {
    console.log(data)
    lastPose = new Date()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    console.log(ctx)
    drawConnectors(ctx, data.landmarks, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 4,
    })
    drawLandmarks(ctx, data.landmarks, {
      color: '#f2ff00ff',
      lineWidth: 2,
    })
  }, 'pose')
}
