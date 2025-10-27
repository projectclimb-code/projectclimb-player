import Konva from 'konva'

export function createGridLayer({
  width,
  height,
  frequency = 200,
  xOffset = 50,
  yOffset = 140,
  color = 'white',
  lineWidth = 1,
}) {
  const gridLayer = new Konva.Group()
  gridLayer.height(height)
  gridLayer.width(width)

  // ---- Vertical lines (left → right, offset applied) ----
  for (let x = xOffset; x <= width; x += frequency) {
    gridLayer.add(
      new Konva.Line({
        points: [x, 0, x, height],
        stroke: color,
        strokeWidth: lineWidth,
      }),
    )
  }

  // ---- Horizontal lines (bottom → top, offset applied) ----
  for (let y = height - yOffset; y >= 0; y -= frequency) {
    gridLayer.add(
      new Konva.Line({
        points: [0, y, width, y],
        stroke: color,
        strokeWidth: lineWidth,
      }),
    )
  }

  return gridLayer
}
