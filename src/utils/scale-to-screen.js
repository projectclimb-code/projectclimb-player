export function scaleToScreen(node, settings, zoom = 1) {
  node.offsetX(node.width() / 2)
  node.offsetY(node.height() / 2)
  node.position({
    x: settings.screenWidth / 2,
    y: settings.screenHeight / 2,
  })
  node.scale({
    x: (settings.screenHeight / settings.wallHeight) * zoom,
    y: (settings.screenHeight / settings.wallHeight) * zoom,
  })
}
