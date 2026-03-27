export function scaleToScreen(node, settings, zoom = 0.78) {
  node.offsetX(node.width() / 2)
  node.offsetY(node.height() / 2)
  node.position({
    x: settings.screenWidth / 2 - 200,
    y: settings.screenHeight / 2 - 60,
  })
  node.scale({
    x: (settings.screenHeight / settings.wallHeight) * zoom,
    y: (settings.screenHeight / settings.wallHeight) * zoom,
  })
}
