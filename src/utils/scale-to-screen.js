export function scaleToScreen(node, settings, zoom) {
  console.log(node.width(), node.height())
  node.offsetX(node.width() / 2)
  node.offsetY(node.height() / 2)
  node.position({
    x: settings.screenWidth / 2,
    y: settings.screenHeight / 2,
  })
  node.rotation(90)
  node.scale({
    x: (settings.screenHeight / settings.wallWidth) * zoom,
    y: (settings.screenHeight / settings.wallWidth) * zoom,
  })
}
