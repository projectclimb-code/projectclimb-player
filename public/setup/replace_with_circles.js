#!/usr/bin/env node
import fs from 'fs'

// ===== CONFIG =====
const RADIUS = 3
// ==================

if (process.argv.length < 3) {
  console.error('Usage: centroidify-svg.mjs <input.svg>')
  process.exit(1)
}

const inputFile = process.argv[2]
const svg = fs.readFileSync(inputFile, 'utf8')

// Parse all <path> tags
const pathRegex = /<path\b([^>]*)\bd="([^"]+)"([^>]*)>/gi

function boundingBoxFromD(d) {
  const commands = d.match(/[A-Za-z][^A-Za-z]*/g)
  if (!commands) return null

  let x = 0,
    y = 0
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity

  for (const cmd of commands) {
    const type = cmd[0]
    const args = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number)

    switch (type) {
      case 'M':
      case 'L':
        for (let i = 0; i < args.length; i += 2) {
          x = args[i]
          y = args[i + 1]
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        }
        break
      case 'H':
        x = args[0]
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        break
      case 'V':
        y = args[0]
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
        break
      default:
        // ignore other commands
        break
    }
  }

  if (!isFinite(minX)) return null

  return { minX, minY, maxX, maxY }
}

let outputSvg = svg
let match
const replacements = []

while ((match = pathRegex.exec(svg)) !== null) {
  const fullTag = match[0]
  const d = match[2]

  // Extract id
  const idMatch = fullTag.match(/id="([^"]+)"/)
  const idValue = idMatch ? idMatch[1] : null

  const box = boundingBoxFromD(d)
  if (!box) continue

  const cx = (box.minX + box.maxX) / 2
  const cy = (box.minY + box.maxY) / 2

  const idAttr = idValue ? `id="${idValue}" ` : ''
  const circleTag = `<circle class="hold" ${idAttr}cx="${cx}" cy="${cy}" r="${RADIUS}" />`

  replacements.push({ fullTag, newTag: circleTag })
}

// Replace paths safely
for (const { fullTag, newTag } of replacements) {
  const regex = new RegExp(fullTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
  outputSvg = outputSvg.replace(regex, newTag)
}

process.stdout.write(outputSvg)
