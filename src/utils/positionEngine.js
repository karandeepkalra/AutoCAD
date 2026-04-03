// ─────────────────────────────────────────────────────────────────────────────
// Position Engine
//
// Given the current room state, computes every valid placement slot for a
// component type. Returns an array of { x, y, rot, label } objects that the
// UI turns into clickable markers / list items.
//
// The engine is deliberately stateless: feed it the same inputs and you get
// the same output. All rules come from componentConstraints.js.
// ─────────────────────────────────────────────────────────────────────────────

import { S } from '../constants.jsx'
import { COMPONENT_CONSTRAINTS } from './componentConstraints'
import { checkCollision } from './constraints'

// ─── Shared position fractions (0 → 1 along a scannable axis) ───────────────
const FRACS = [0, 0.25, 0.5, 0.75, 1]

// ─── Human-readable label tables ─────────────────────────────────────────────
const H_LABELS = ['Far Left', 'Left', 'Center', 'Right', 'Far Right'] // horizontal axis
const V_LABELS = ['Far Top',  'Upper', 'Center', 'Lower', 'Far Bottom'] // vertical axis
const IX_LABELS = ['Far Left', 'Left', 'Center', 'Right', 'Far Right']
const IY_LABELS = ['Back', 'Back-Center', 'Center', 'Front-Center', 'Front']

const WALL_NAMES = {
  bottom: 'Bottom Wall',
  top:    'Top Wall',
  left:   'Left Wall',
  right:  'Right Wall',
}

// 12 evenly-spaced positions around a barrel (every 30°)
const BARREL_WALL_LABELS = [
  'Right',          // 0°
  'Right – Front',  // 30°
  'Front – Right',  // 60°
  'Front',          // 90°
  'Front – Left',   // 120°
  'Left – Front',   // 150°
  'Left',           // 180°
  'Left – Back',    // 210°
  'Back – Left',    // 240°
  'Back',           // 270°
  'Back – Right',   // 300°
  'Right – Back',   // 330°
]

function fracLabel(labels, frac) {
  const idx = Math.round(frac * (labels.length - 1))
  return labels[Math.max(0, Math.min(labels.length - 1, idx))]
}

function interiorLabel(xi, yi) {
  const x = IX_LABELS[xi]
  const y = IY_LABELS[yi]
  if (xi === 2 && yi === 2) return 'Center'
  if (xi === 2) return y
  if (yi === 2) return x
  return `${y} – ${x}`
}

// ─── Cube: wall slots ─────────────────────────────────────────────────────────
function generateWallSlotsCube(dims, constraints) {
  const rx = (dims.length / 2) * S
  const ry = (dims.width  / 2) * S
  const tw = dims.wall * S
  const cornerMargin = (constraints.minDistanceFromCorner || 0) * S

  // Each wall: fixed coordinate, scan axis, label array
  const wallDefs = {
    bottom: { fixedX: null,          fixedY:  ry - tw / 2, rot: 0,  scanMin: -rx, scanMax: rx, labels: H_LABELS },
    top:    { fixedX: null,          fixedY: -ry + tw / 2, rot: 0,  scanMin: -rx, scanMax: rx, labels: H_LABELS },
    left:   { fixedX: -rx + tw / 2,  fixedY: null,         rot: 90, scanMin: -ry, scanMax: ry, labels: V_LABELS },
    right:  { fixedX:  rx - tw / 2,  fixedY: null,         rot: 90, scanMin: -ry, scanMax: ry, labels: V_LABELS },
  }

  const slots = []

  for (const wallKey of (constraints.allowedWalls || [])) {
    const w = wallDefs[wallKey]
    if (!w) continue

    const rangeStart = w.scanMin + cornerMargin
    const rangeEnd   = w.scanMax - cornerMargin
    if (rangeStart >= rangeEnd) continue // wall too small for this component

    for (let fi = 0; fi < FRACS.length; fi++) {
      const scanPos = rangeStart + (rangeEnd - rangeStart) * FRACS[fi]
      const x = w.fixedX !== null ? w.fixedX : scanPos
      const y = w.fixedY !== null ? w.fixedY : scanPos
      const posLabel = fracLabel(w.labels, FRACS[fi])
      slots.push({ x, y, rot: w.rot, label: `${WALL_NAMES[wallKey]} – ${posLabel}`, wall: wallKey })
    }
  }

  return slots
}

// ─── Cube: interior slots ─────────────────────────────────────────────────────
function generateInteriorSlotsCube(dims, constraints) {
  const rx = (dims.length / 2) * S
  const ry = (dims.width  / 2) * S
  const tw = dims.wall * S
  const pad = (constraints.minDistanceFromWall || 10) * S

  const minX = -rx + tw + pad
  const maxX =  rx - tw - pad
  const minY = -ry + tw + pad
  const maxY =  ry - tw - pad

  if (minX >= maxX || minY >= maxY) return []

  const slots = []
  for (let yi = 0; yi < FRACS.length; yi++) {
    for (let xi = 0; xi < FRACS.length; xi++) {
      const x = minX + (maxX - minX) * FRACS[xi]
      const y = minY + (maxY - minY) * FRACS[yi]
      slots.push({ x, y, rot: 0, label: interiorLabel(xi, yi) })
    }
  }
  return slots
}

// ─── Barrel: wall slots ───────────────────────────────────────────────────────
function generateWallSlotsBarrel(dims, constraints) {
  const rx = (dims.length / 2) * S
  const ry = (dims.width  / 2) * S
  const tw = dims.wall * S
  const wallRx = rx - tw / 2
  const wallRy = ry - tw / 2

  const slots = []
  const count = BARREL_WALL_LABELS.length

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI
    const x   = wallRx * Math.cos(angle)
    const y   = wallRy * Math.sin(angle)
    const rot = (angle * 180 / Math.PI) + 90
    slots.push({ x, y, rot, label: BARREL_WALL_LABELS[i] })
  }
  return slots
}

// ─── Barrel: interior slots ───────────────────────────────────────────────────
function generateInteriorSlotsBarrel(dims, constraints) {
  const rx = (dims.length / 2) * S
  const ry = (dims.width  / 2) * S
  const tw = dims.wall * S
  const pad = (constraints.minDistanceFromWall || 10) * S
  const intRx = rx - tw - pad
  const intRy = ry - tw - pad

  if (intRx <= 0 || intRy <= 0) return []

  const slots = []
  for (let yi = 0; yi < FRACS.length; yi++) {
    for (let xi = 0; xi < FRACS.length; xi++) {
      const x = (FRACS[xi] - 0.5) * 2 * intRx
      const y = (FRACS[yi] - 0.5) * 2 * intRy
      // Reject points outside the ellipse boundary (with a small margin)
      if ((x / intRx) ** 2 + (y / intRy) ** 2 > 0.9) continue
      slots.push({ x, y, rot: 0, label: interiorLabel(xi, yi) })
    }
  }
  return slots
}

// ─── Distance rule checker ────────────────────────────────────────────────────
function passesDistanceRules(slot, constraints, placedComps) {
  const rules = constraints.minDistanceFromType || {}
  for (const [otherType, minDistCm] of Object.entries(rules)) {
    const minDist = minDistCm * S
    for (const other of placedComps) {
      if (other.type !== otherType) continue
      const d = Math.sqrt((slot.x - other.x) ** 2 + (slot.y - other.y) ** 2)
      if (d < minDist) return false
    }
  }
  return true
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute all valid placement positions for a given component type.
 *
 * Returns [] when:
 *   - type is unknown
 *   - max count is already reached
 *   - no positions pass all constraint checks
 *
 * Each returned slot: { x, y, rot, label }
 */
export function computeValidPositions(targetType, dims, saunaType, placedComps) {
  const constraints = COMPONENT_CONSTRAINTS[targetType]
  if (!constraints) return []

  // Fast-exit: already at max
  const placed = placedComps.filter(c => c.type === targetType).length
  if (placed >= constraints.maxCount) return []

  // Generate raw candidate positions
  let slots
  if (saunaType === 'cube') {
    slots = constraints.placementZone === 'wall'
      ? generateWallSlotsCube(dims, constraints)
      : generateInteriorSlotsCube(dims, constraints)
  } else {
    slots = constraints.placementZone === 'wall'
      ? generateWallSlotsBarrel(dims, constraints)
      : generateInteriorSlotsBarrel(dims, constraints)
  }

  const { w, h } = constraints.defaultSize

  // Filter: keep only slots that pass collision + distance rules
  return slots.filter(slot => {
    const candidate = {
      id: -999,           // sentinel — won't match any real comp
      type: targetType,
      x: slot.x, y: slot.y, rot: slot.rot,
      w, h,
    }
    if (checkCollision(candidate, placedComps)) return false
    if (!passesDistanceRules(slot, constraints, placedComps)) return false
    return true
  })
}

/** How many of this type are allowed. */
export function getMaxCount(type) {
  return COMPONENT_CONSTRAINTS[type]?.maxCount ?? Infinity
}

/** How many of this type are already on the canvas. */
export function getPlacedCount(type, placedComps) {
  return placedComps.filter(c => c.type === type).length
}
