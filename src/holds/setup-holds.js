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
  websocketService.subscribe((data) => {
    if (data.session) {
      state.forEach((hold) => {
        assignHoldStyle(hold.node, 'normal')
      })
      data.session.holds.forEach((sessionHold) => {
        if (sessionHold.status == 'touched') {
          console.warrning('hold already touched', sessionHold.id)
        }
        const id = sessionHold.id.substring(5)
        const hold = state.find((h) => h.id === id)
        if (hold == null) {
          // console.error('hold not found', id)
          return
        }
        assignHoldStyle(hold.node, 'touched')
      })
      stage.batchDraw()
    }
  }, 'session')
}

const assignHoldStyle = (hold, holdStyle) => {
  let style = {}
  if (styles[holdStyle]) {
    style = styles[holdStyle]
  } else {
    style = styles['inactive']
  }

  Object.entries(style).forEach(([key, value]) => {
    hold.setAttr(key, value)
  })
}

const styles = {
  inactive: {
    fill: 'rgba(203, 22, 22, 1)',
    stroke: 'rgba(219, 19, 19, 1)',
    strokeWidth: 12,
    opacity: 0,
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
    fill: '#ff5900ff',
    stroke: '#f00707ff',
    strokeWidth: 12,
    opacity: 1,
  },
  untouched: {
    fill: '#ffffff77',
    stroke: '#fff',
    strokeWidth: 12,
    opacity: 0,
  },
  touched: {
    fill: '#00ff00',
    stroke: '#009900',
    strokeWidth: 12,
    opacity: 1,
  },
  white: {
    fill: '#ffffff00',
    stroke: 'white',
    strokeWidth: 12,
    opacity: 1,
  },
}
