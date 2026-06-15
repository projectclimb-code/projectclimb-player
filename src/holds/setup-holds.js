import { websocketService } from '@/services/ws.service'

export function setupHolds(state, stage) {
  state.forEach((hold) => {
    assignHoldStyle(hold.node, ['normal1', 'normal2', 'normal3'][Math.floor(Math.random() * 3)])
  })
  websocketService.subscribe((data) => {
    if (data.type === 'preview') {
      state.forEach((hold) => {
        const updatedHold = data.route.data.problem.holds.find((h) => h.id === hold.id)
        if (updatedHold) {
          console.log(`Hold ${hold.id} is ${updatedHold.type}`)
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

  // websocketService.subscribe((data) => {
  //   state.forEach((hold) => {
  //     assignHoldStyle(hold.node, 'inactive')
  //   })
  //   console.log(data);
  //   if (data) {
  //     state.forEach((hold) => {
  //       assignHoldStyle(hold.node, 'inactive')
  //       const sessionHold = data.active_holds.find((sh) => sh === hold.id)

  //       if (sessionHold) {
  //         assignHoldStyle(hold.node, 'normal')
  //       }
  //     })
  //     stage.batchDraw()
  //   }
  // }, 'session')
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
    stroke: 'rgb(0, 255, 4)',
    strokeWidth: 12,
    opacity: 0,
  },
  normal1: {
    fill: '#ffffff77',
    stroke: 'rgb(255, 5, 251)',
    strokeWidth: 12,
    opacity: 1,
  },
  normal2: {
    fill: '#ffffff77',
    stroke: 'rgb(248, 226, 29)',
    strokeWidth: 12,
    opacity: 1,
  },
  normal3: {
    fill: '#ffffff77',
    stroke: 'rgb(5, 255, 0)',
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
