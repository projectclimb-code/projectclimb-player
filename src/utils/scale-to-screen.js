export function scaleToScreen(node, settings, zoom = 0.75) {
  node.offsetX(node.width() / 2)
  node.offsetY(node.height() / 2)
  node.position({
    x: settings.screenWidth / 2 - 170,
    y: settings.screenHeight / 2 + 30,
  })
  node.scale({
    x: (settings.screenHeight / settings.wallHeight) * zoom,
    y: (settings.screenHeight / settings.wallHeight) * zoom,
  })
}
