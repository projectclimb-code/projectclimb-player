import { websocketService } from '@/services/ws.service'

export function setupHolds(state, stage) {
  state.forEach((hold) => {
    assignHoldStyle(hold.node, 'normal')
  })
  websocketService.subscribe((data) => {
    if (data.type === 'preview') {
      state.forEach((hold) => {
        const updatedHold = data.route.data.problem.holds.find((h) => h.id === hold.id)
        if (updatedHold) {
          assignHoldStyle(hold.node, updatedHold.type)
        } else {
          assignHoldStyle(hold.node, 'inactive')
        }
      })
      stage.batchDraw()
    }
    if (data.type === 'display' && data.layer === 'holds') {
      if (data.visibility) {
        state.forEach((hold) => {
          assignHoldStyle(hold.node, 'normal')
        })
      } else {
        state.forEach((hold) => {
          assignHoldStyle(hold.node, 'inactive')
        })
      }
    }
    return
  })
}

const assignHoldStyle = (hold, style) => {
  switch (style) {
    case 'start':
      style = styles.start
      break
    case 'finish':
      style = styles.finish
      break
    case 'normal':
      style = styles.normal
      break
    default:
      style = styles.inactive
  }
  Object.entries(style).forEach(([key, value]) => {
    hold.setAttr(key, value)
  })
}

const styles = {
  inactive: {
    fill: '#888888',
    stroke: '#555555',
    strokeWidth: 12,
    opacity: 0.2,
  },
  normal: {
    fill: '#ffffff77',
    stroke: '#fff',
    strokeWidth: 12,
    opacity: 1,
  },
  start: {
    fill: '#00ff00',
    stroke: '#009900',
    strokeWidth: 12,
    opacity: 1,
  },
  finish: {
    fill: '#e6e6f0ff',
    stroke: '#ffffffff',
    strokeWidth: 12,
    opacity: 1,
  },
}
