const stage = new Konva.Stage({
  container: 'container',
  width: 600,
  height: 400,
})
const layer = new Konva.Layer()
stage.add(layer)

// 2) Source image
const img = new Image()
img.crossOrigin = 'anonymous'
img.src = 'https://picsum.photos/600/400' // replace with your image URL

img.onload = () => {
  // 3) Create temp canvas for perspective warp
  const warpCanvas = document.createElement('canvas')
  warpCanvas.width = img.width
  warpCanvas.height = img.height
  const ctx = warpCanvas.getContext('2d')

  // 4) Define perspective transform
  // original corners (TL, TR, BR, BL)
  const src = [0, 0, img.width, 0, img.width, img.height, 0, img.height]

  // destination corners (warp target)
  // tweak these 8 numbers to change perspective shape
  const dst = [40, 20, img.width - 80, 40, img.width - 20, img.height - 40, 60, img.height - 20]

  const matrix = PerspT(src, dst)

  // 5) Apply transform and draw
  ctx.setTransform(matrix[0], matrix[3], matrix[1], matrix[4], matrix[2], matrix[5])
  ctx.drawImage(img, 0, 0)

  // 6) Convert to Image so Konva can use it
  const warpedImg = new Image()
  warpedImg.src = warpCanvas.toDataURL()

  warpedImg.onload = () => {
    const konvaImage = new Konva.Image({
      image: warpedImg,
      x: 0,
      y: 0,
      draggable: true,
    })

    layer.add(konvaImage)
    layer.draw()
  }
}
