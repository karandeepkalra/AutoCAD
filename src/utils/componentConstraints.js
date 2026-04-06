// ─────────────────────────────────────────────────────────────────────────────
// Component Constraints — Replaceable Config
//
// Each entry defines the placement rules for one component type.
// The position engine reads ONLY this file — swap or extend it to change all
// placement behaviour without touching engine logic.
//
// Fields:
//   maxCount            — max instances allowed in one design
//   placementZone       — 'wall' | 'interior'
//   allowedWalls        — (wall only) which walls are valid
//   preferredWalls      — (wall only) cosmetic hint, not enforced by engine
//   minDistanceFromCorner — (wall only, cm) min distance from room corner
//   minDistanceFromWall — (interior only, cm) padding from wall boundary
//   minDistanceFromType — { otherType: minCm } distance rules between types
//   snapGrid            — cm between candidate scan positions
//   defaultSize         — { w, h } in canvas units (pixels = cm × 1.25)
// ─────────────────────────────────────────────────────────────────────────────

export const COMPONENT_CONSTRAINTS = {
  door: {
    maxCount: 1,
    placementZone: 'wall',
    allowedWalls: ['bottom', 'left', 'right', 'top'],
    preferredWalls: ['bottom'],
    minDistanceFromCorner: 30,
    minDistanceFromType: {
      window: 20,
    },
    snapGrid: 5,
    defaultSize: { w: 44, h: 40 },
  },

  window: {
    maxCount: 2,
    placementZone: 'wall',
    allowedWalls: ['left', 'right', 'top', 'bottom'],
    preferredWalls: ['left', 'right', 'top'],
    minDistanceFromCorner: 20,
    minDistanceFromType: {
      door: 20,
      window: 35,
    },
    snapGrid: 5,
    defaultSize: { w: 44, h: 40 },
  },

  vent: {
    maxCount: 2,
    placementZone: 'wall',
    allowedWalls: ['left', 'right', 'top', 'bottom'],
    preferredWalls: ['top', 'left', 'right'],
    minDistanceFromCorner: 15,
    minDistanceFromType: {
      vent: 40,
    },
    snapGrid: 5,
    defaultSize: { w: 44, h: 40 },
  },

  heater: {
    maxCount: 1,
    placementZone: 'interior',
    minDistanceFromWall: 15,
    minDistanceFromType: {
      bench: 40,
      door:  50,
    },
    snapGrid: 10,
    defaultSize: { w: 44, h: 40 },
  },

  bench: {
    maxCount: 2,
    placementZone: 'interior',
    minDistanceFromWall: 5,
    minDistanceFromType: {
      heater: 40,
    },
    snapGrid: 10,
    defaultSize: { w: 44, h: 40 },
  },

  light: {
    maxCount: 3,
    placementZone: 'interior',     // ceiling position shown in top-view interior
    minDistanceFromWall: 10,
    minDistanceFromType: {
      light: 40,
    },
    snapGrid: 10,
    defaultSize: { w: 44, h: 40 },
  },

  speaker: {
    maxCount: 2,
    placementZone: 'wall',
    allowedWalls: ['left', 'right', 'top', 'bottom'],
    preferredWalls: ['top', 'left', 'right'],
    minDistanceFromCorner: 15,
    minDistanceFromType: {
      speaker: 60,
    },
    snapGrid: 5,
    defaultSize: { w: 44, h: 40 },
  },

  controlunit: {
    maxCount: 1,
    placementZone: 'wall',
    allowedWalls: ['bottom', 'left', 'right'],
    preferredWalls: ['bottom'],
    minDistanceFromCorner: 20,
    minDistanceFromType: {
      door: 15,
    },
    snapGrid: 5,
    defaultSize: { w: 44, h: 40 },
  },

  thermometer: {
    maxCount: 1,
    placementZone: 'wall',
    allowedWalls: ['left', 'right', 'top', 'bottom'],
    preferredWalls: ['left', 'right'],
    minDistanceFromCorner: 15,
    minDistanceFromType: {
      heater: 30,
    },
    snapGrid: 5,
    defaultSize: { w: 44, h: 40 },
  },

  timer: {
    maxCount: 1,
    placementZone: 'wall',
    allowedWalls: ['bottom', 'left', 'right'],
    preferredWalls: ['bottom'],
    minDistanceFromCorner: 15,
    minDistanceFromType: {
      door: 10,
    },
    snapGrid: 5,
    defaultSize: { w: 44, h: 40 },
  },
}
