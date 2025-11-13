import { websocketService } from '@/services/ws.service'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { POSE_CONNECTIONS } from '@mediapipe/pose'
import { settings } from '@/settings'

export function setupPoseCanvas() {
  const canvas = document.getElementById('poseCanvas')
  canvas.width = settings.wallWidth * (window.innerHeight / settings.wallHeight)
  canvas.height = window.innerHeight
  // Get the 2D drawing context
  const ctx = canvas.getContext('2d')
  // ctx.fillStyle = 'rgba(232, 0, 0, 1)'
  // ctx.fillRect(0, 0, canvas.width, canvas.height)
  websocketService.subscribe((data) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (data.type === 'pose') {
      drawConnectors(ctx, data.landmarks, POSE_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 4,
      })
      drawLandmarks(ctx, data.landmarks, {
        color: '#f2ff00ff',
        lineWidth: 2,
      })
    }
  })
}
