export function animatePaths(frame, state, points) {
  const dt = frame.timeDiff / 1000
  const speed = 2
  state.forEach((s) => {
    if (!points.includes(parseInt(s.id))) {
      s.progress += ((0 - s.progress) / speed) * dt * 10
    } else {
      s.progress += ((1 - s.progress) / speed) * dt * 10
    }
    s.node.strokeWidth(s.progress * 10 > 2 ? s.progress * 10 : 0)
    s.node.opacity(s.progress)
    s.node.fill(`rgb(255,255,255)`)
    s.node.scale({ x: 1 + (1 - s.progress) * 0.2, y: 1 + (1 - s.progress) * 0.2 })
  })
}

export function updatePoints() {
  const min = 0
  const max = 142
  let points = []
  const count = 10 + Math.floor(Math.random() * 31) // 10–40 numbers

  // Create array [0, 1, 2, ..., 142]
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min)

  // Shuffle pool using Fisher–Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  // Take first N unique numbers
  points = pool.slice(0, count)
  return points
}
