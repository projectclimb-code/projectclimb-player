#!/usr/bin/env node
/**
 * process.mjs
 *
 * Usage:
 *   node process.mjs input.svg output.svg
 * or:
 *   node process.mjs input.svg > output.svg
 *
 * Replaces <path id="hold_*" d="..."> with:
 *   - a <rect id="hold_*" x=... y=... width=... height=... .../>
 *   - a <text ...>label</text> placed in a separate <g id="labels"> layer
 *
 * Geometry bbox (ignores stroke) is computed by sampling curves.
 */

import fs from 'fs'

const CURVE_SAMPLES = 30 // more samples => more accurate curve bbox
const FONT_SIZE = 30
const DEFAULT_FILL = 'none'
const DEFAULT_STROKE = '#000'

if (process.argv.length < 3) {
  console.error('Usage: node process.mjs input.svg [output.svg]')
  process.exit(1)
}

const inputPath = process.argv[2]
const outputPath = process.argv[3] || null

// const svgText = fs.readFileSync(inputPath, 'utf8')

// find all <path ... id="hold_..."> tags (capture full tag)
const pathIdRegex = /<path\b([^>]*)\bid=["'](hold_[^"']+)["']([^>]*)>/gi

const matches = []
let m
// while ((m = pathIdRegex.exec(svgText)) !== null) {
//   const fullTag = m[0]
//   const attrsBefore = m[1] // attrs that were before id (maybe)
//   const idValue = m[2]
//   const attrsAfter = m[3]

//   // find d="..."
//   const dMatch = fullTag.match(/\bd=["']([^"']+)["']/)
//   if (!dMatch) continue
//   const d = dMatch[1]

//   matches.push({ fullTag, idValue, d })
// }

// if (matches.length === 0) {
//   // nothing to do; write original
//   if (outputPath) fs.writeFileSync(outputPath, svgText, 'utf8')
//   else process.stdout.write(svgText)
//   process.exit(0)
// }

// ---------- helper math: sampling bezier curves ----------
function cubicBezierPoint(p0, p1, p2, p3, t) {
  const u = 1 - t
  const tt = t * t
  const uu = u * u
  const uuu = uu * u
  const ttt = tt * t
  const x = uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0]
  const y = uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1]
  return [x, y]
}

function quadraticBezierPoint(p0, p1, p2, t) {
  const u = 1 - t
  const tt = t * t
  const uu = u * u
  const x = uu * p0[0] + 2 * u * t * p1[0] + tt * p2[0]
  const y = uu * p0[1] + 2 * u * t * p1[1] + tt * p2[1]
  return [x, y]
}

// ---------- parse path 'd' and compute bounding box (absolute + relative support) ----------
function computeBBoxFromPathD(d) {
  // break into commands like 'M10 10', 'C30 30 40 40 50 50', etc.
  const commands = d.match(/[AaCcHhLlMmQqSsTtVvZz][^AaCcHhLlMmQqSsTtVvZz]*/g)
  if (!commands) return null

  let curX = 0,
    curY = 0
  let startX = null,
    startY = null // subpath start (for Z)
  let lastCubicCtrl = null // for 'S' reflection
  let lastQuadCtrl = null // for 'T' reflection

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  function savePoint(px, py) {
    if (!Number.isFinite(px) || !Number.isFinite(py)) return
    if (px < minX) minX = px
    if (py < minY) minY = py
    if (px > maxX) maxX = px
    if (py > maxY) maxY = py
  }

  for (const token of commands) {
    const cmd = token[0]
    const isRelative = cmd === cmd.toLowerCase()
    const type = cmd.toUpperCase()
    // parse numbers:
    const args = token.slice(1).trim().replace(/,/g, ' ').split(/\s+/).filter(Boolean).map(Number)

    let i = 0
    switch (type) {
      case 'M':
        while (i < args.length) {
          const x = isRelative ? curX + args[i++] : args[i++]
          const y = isRelative ? curY + args[i++] : args[i++]
          curX = x
          curY = y
          if (startX === null) {
            startX = curX
            startY = curY
          }
          savePoint(curX, curY)
          // subsequent pairs are treated as implicit 'L'
          lastCubicCtrl = null
          lastQuadCtrl = null
        }
        break

      case 'L':
        while (i < args.length) {
          const x = isRelative ? curX + args[i++] : args[i++]
          const y = isRelative ? curY + args[i++] : args[i++]
          // line from curX,curY -> x,y
          savePoint(curX, curY)
          savePoint(x, y)
          curX = x
          curY = y
          lastCubicCtrl = null
          lastQuadCtrl = null
        }
        break

      case 'H':
        while (i < args.length) {
          const x = isRelative ? curX + args[i++] : args[i++]
          savePoint(curX, curY)
          savePoint(x, curY)
          curX = x
          lastCubicCtrl = null
          lastQuadCtrl = null
        }
        break

      case 'V':
        while (i < args.length) {
          const y = isRelative ? curY + args[i++] : args[i++]
          savePoint(curX, curY)
          savePoint(curX, y)
          curY = y
          lastCubicCtrl = null
          lastQuadCtrl = null
        }
        break

      case 'C':
        while (i + 5 < args.length) {
          const x1 = isRelative ? curX + args[i++] : args[i++]
          const y1 = isRelative ? curY + args[i++] : args[i++]
          const x2 = isRelative ? curX + args[i++] : args[i++]
          const y2 = isRelative ? curY + args[i++] : args[i++]
          const x = isRelative ? curX + args[i++] : args[i++]
          const y = isRelative ? curY + args[i++] : args[i++]

          const p0 = [curX, curY]
          const p1 = [x1, y1]
          const p2 = [x2, y2]
          const p3 = [x, y]

          // sample cubic
          for (let s = 0; s <= CURVE_SAMPLES; s++) {
            const t = s / CURVE_SAMPLES
            const [px, py] = cubicBezierPoint(p0, p1, p2, p3, t)
            savePoint(px, py)
          }

          curX = x
          curY = y
          lastCubicCtrl = [x2, y2]
          lastQuadCtrl = null
        }
        break

      case 'S':
        while (i + 3 < args.length) {
          let x1, y1
          if (lastCubicCtrl) {
            x1 = 2 * curX - lastCubicCtrl[0]
            y1 = 2 * curY - lastCubicCtrl[1]
          } else {
            x1 = curX
            y1 = curY
          }
          const x2 = isRelative ? curX + args[i++] : args[i++]
          const y2 = isRelative ? curY + args[i++] : args[i++]
          const x = isRelative ? curX + args[i++] : args[i++]
          const y = isRelative ? curY + args[i++] : args[i++]

          const p0 = [curX, curY]
          const p1 = [x1, y1]
          const p2 = [x2, y2]
          const p3 = [x, y]

          for (let s = 0; s <= CURVE_SAMPLES; s++) {
            const t = s / CURVE_SAMPLES
            const [px, py] = cubicBezierPoint(p0, p1, p2, p3, t)
            savePoint(px, py)
          }

          curX = x
          curY = y
          lastCubicCtrl = [x2, y2]
          lastQuadCtrl = null
        }
        break

      case 'Q':
        while (i + 3 < args.length) {
          const x1 = isRelative ? curX + args[i++] : args[i++]
          const y1 = isRelative ? curY + args[i++] : args[i++]
          const x = isRelative ? curX + args[i++] : args[i++]
          const y = isRelative ? curY + args[i++] : args[i++]

          const p0 = [curX, curY]
          const p1 = [x1, y1]
          const p2 = [x, y]

          for (let s = 0; s <= CURVE_SAMPLES; s++) {
            const t = s / CURVE_SAMPLES
            const [px, py] = quadraticBezierPoint(p0, p1, p2, t)
            savePoint(px, py)
          }

          curX = x
          curY = y
          lastQuadCtrl = [x1, y1]
          lastCubicCtrl = null
        }
        break

      case 'T':
        while (i + 1 < args.length) {
          let x1, y1
          if (lastQuadCtrl) {
            x1 = 2 * curX - lastQuadCtrl[0]
            y1 = 2 * curY - lastQuadCtrl[1]
          } else {
            x1 = curX
            y1 = curY
          }
          const x = isRelative ? curX + args[i++] : args[i++]
          const y = isRelative ? curY + args[i++] : args[i++]

          const p0 = [curX, curY]
          const p1 = [x1, y1]
          const p2 = [x, y]

          for (let s = 0; s <= CURVE_SAMPLES; s++) {
            const t = s / CURVE_SAMPLES
            const [px, py] = quadraticBezierPoint(p0, p1, p2, t)
            savePoint(px, py)
          }

          curX = x
          curY = y
          lastQuadCtrl = [x1, y1]
          lastCubicCtrl = null
        }
        break

      case 'A':
        // Elliptical arc: token args = rx ry x-axis-rotation large-arc-flag sweep-flag x y
        // We'll approximate by saving the endpoint and the current point.
        // Full arc flattening is more complex; this approximation keeps geometry-level bbox looser.
        // parse in chunks of 7 (but sometimes numbers are adjacent)
        while (i + 6 < args.length) {
          const rx = args[i++],
            ry = args[i++],
            rot = args[i++],
            laf = args[i++],
            sf = args[i++]
          const x = isRelative ? curX + args[i++] : args[i++]
          const y = isRelative ? curY + args[i++] : args[i++]
          // save current and endpoint
          savePoint(curX, curY)
          savePoint(x, y)
          // also sample a few intermediate t values by linear interpolation of angle approx:
          // crude but better than nothing:
          for (let t = 0; t <= 1; t += 0.25) {
            const ix = curX + (x - curX) * t
            const iy = curY + (y - curY) * t
            savePoint(ix, iy)
          }
          curX = x
          curY = y
          lastCubicCtrl = null
          lastQuadCtrl = null
        }
        break

      case 'Z':
        // close path -> connect to start
        if (startX !== null) {
          savePoint(curX, curY)
          savePoint(startX, startY)
          curX = startX
          curY = startY
        }
        lastCubicCtrl = null
        lastQuadCtrl = null
        break

      default:
        // unsupported; try to skip
        break
    }
  }

  if (!isFinite(minX)) return null
  return { minX, minY, maxX, maxY }
}

// ---------- Build rects and labels while removing original paths ----------
let workingSvg = svgText
const rects = []
const labels = []

for (const item of matches) {
  const { fullTag, idValue, d } = item

  const box = computeBBoxFromPathD(d)
  if (!box) {
    // skip if we couldn't compute bbox
    continue
  }

  const x = box.minX
  const y = box.minY
  const width = box.maxX - box.minX
  const height = box.maxY - box.minY

  // create rect and label strings
  const rect = `<rect id="${escapeXmlAttr(idValue)}" x="${x}" y="${y}" width="${width}" height="${height}" fill="${DEFAULT_FILL}" stroke="${DEFAULT_STROKE}" />`
  const labelText = idValue.replace(/^hold_/, '')
  const cx = x + width / 2
  const cy = y + height / 2
  const text = `<text x="${cx}" y="${cy}" font-size="${FONT_SIZE}" text-anchor="middle" dominant-baseline="central">${escapeXml(labelText)}</text>`

  rects.push(rect)
  labels.push(text)

  // remove first occurrence of the original fullTag from workingSvg
  const escaped = escapeRegex(fullTag)
  workingSvg = workingSvg.replace(new RegExp(escaped), '')
}

// Insert groups before closing </svg>
const rectsGroup = `<g id="rects">\n${rects.join('\n')}\n</g>\n`
const labelsGroup = `<g id="labels">\n${labels.join('\n')}\n</g>\n`

// place groups before </svg> (if exists), otherwise append
if (workingSvg.includes('</svg>')) {
  workingSvg = workingSvg.replace(/<\/svg>/i, `${rectsGroup}${labelsGroup}</svg>`)
} else {
  workingSvg += `\n${rectsGroup}${labelsGroup}`
}

// write out
if (outputPath) {
  fs.writeFileSync(outputPath, workingSvg, 'utf8')
} else {
  process.stdout.write(workingSvg)
}

// ---------- helpers ----------
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escapeXmlAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
