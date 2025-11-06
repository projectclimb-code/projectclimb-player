#!/usr/bin/env node
/**
 * Rename all <path> IDs in an SVG file sequentially.
 * Usage:
 *   node rename-path-ids.mjs input.svg [output.svg]
 * If no output is given, the input file will be overwritten.
 */

import { readFile, writeFile } from 'fs/promises'

// ---- Parse CLI arguments ----
const [inputFile, outputFile] = process.argv.slice(2)

if (!inputFile) {
  console.error('❌ Usage: node rename-path-ids.mjs input.svg [output.svg]')
  process.exit(1)
}

// ---- Read SVG file ----
let svg
try {
  svg = await readFile(inputFile, 'utf8')
} catch (err) {
  console.error(`❌ Failed to read "${inputFile}":`, err.message)
  process.exit(1)
}

// ---- Rename <path> IDs ----
let count = 0
let updated = svg.replace(
  /(<path[^>]*\bid\s*=\s*['"])([^'"]+)(['"][^>]*>)/gi,
  (_, before, oldId, after) => `${before}hold_${count++}${after}`,
)
updated = updated.replace(/\s*style="[^"]*"/g, '')

console.log(`✅ Renamed ${count - 1} path IDs`)

// ---- Write output ----
const target = outputFile || inputFile
await writeFile(target, updated, 'utf8')
console.log(`💾 Saved to ${target}`)
