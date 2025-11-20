import { websocketService } from '@/services/ws.service'

export function setupHolds(state, stage) {
  state.forEach((hold) => {
    assignHoldStyle(hold.node, 'inactive')
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
        const sessionHold = data.session.holds.find((sh) => sh.id.substring(5) === hold.id)
        if (sessionHold.status !== 'untouched') {
          console.log('sessionHold', sessionHold)
        }

        if (sessionHold) {
          assignHoldStyle(hold.node, sessionHold.status)
        }
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
    fill: 'rgba(255, 255, 255, 0)',
    stroke: 'rgba(255, 255, 255, 1)',
    strokeWidth: 12,
    opacity: 0.5,
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
    fill: '#ffffff33',
    stroke: '#ffffff00',
    strokeWidth: 12,
    opacity: 1,
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
