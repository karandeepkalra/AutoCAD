/**
 * IFC STEP Export for Ikarus Sauna CAD
 * Generates a real IFC2X3 STEP file (.ifc)
 */

const S = 1.25

let eid = 0
function nextId() { return ++eid }

function ifcGuid() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$'
  let s = ''
  for (let i = 0; i < 22; i++) s += chars[Math.floor(Math.random() * 64)]
  return `'${s}'`
}

function pt3(x, y, z) { return `(${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)})` }
function pt2(x, y) { return `(${x.toFixed(4)},${y.toFixed(4)})` }

const mm = (cm) => cm * 10

export function generateSaunaIFC(saunaType, dims, placedComps) {
  eid = 0
  const lines = []
  const emit = (id, type, args) => { lines.push(`#${id}=${type}(${args});`); return id }

  const header = [
    'ISO-10303-21;', 'HEADER;',
    "FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');",
    "FILE_NAME('sauna.ifc','2026-01-01',('Ikarus CAD'),(''),'','','');",
    "FILE_SCHEMA(('IFC2X3'));", 'ENDSEC;', 'DATA;',
  ].join('\n')

  const origin3d = nextId(); emit(origin3d, 'IFCCARTESIANPOINT', pt3(0, 0, 0))
  const dirZ = nextId(); emit(dirZ, 'IFCDIRECTION', pt3(0, 0, 1))
  const dirX = nextId(); emit(dirX, 'IFCDIRECTION', pt3(1, 0, 0))
  const dirY = nextId(); emit(dirY, 'IFCDIRECTION', pt3(0, 1, 0))
  const worldPlacement = nextId(); emit(worldPlacement, 'IFCAXIS2PLACEMENT3D', `#${origin3d},#${dirZ},#${dirX}`)
  const context = nextId(); emit(context, 'IFCGEOMETRICREPRESENTATIONCONTEXT', `'Model','Model',3,1.0E-5,#${worldPlacement},$`)
  const subContext = nextId(); emit(subContext, 'IFCGEOMETRICREPRESENTATIONSUBCONTEXT', `'Body','Model',*,*,*,*,#${context},$,.MODEL_VIEW.,$`)

  const lengthUnit = nextId(); emit(lengthUnit, 'IFCSIUNIT', '*,.LENGTHUNIT.,.MILLI.,.METRE.')
  const areaUnit = nextId(); emit(areaUnit, 'IFCSIUNIT', '*,.AREAUNIT.,$,.SQUARE_METRE.')
  const volumeUnit = nextId(); emit(volumeUnit, 'IFCSIUNIT', '*,.VOLUMEUNIT.,$,.CUBIC_METRE.')
  const angleUnit = nextId(); emit(angleUnit, 'IFCSIUNIT', '*,.PLANEANGLEUNIT.,$,.RADIAN.')
  const units = nextId(); emit(units, 'IFCUNITASSIGNMENT', `(#${lengthUnit},#${areaUnit},#${volumeUnit},#${angleUnit})`)

  const project = nextId(); emit(project, 'IFCPROJECT', `${ifcGuid()},$,'Ikarus Sauna Project',$,$,$,$,(#${context}),#${units}`)
  const sitePlacement = nextId(); emit(sitePlacement, 'IFCLOCALPLACEMENT', `$,#${worldPlacement}`)
  const site = nextId(); emit(site, 'IFCSITE', `${ifcGuid()},$,'Sauna Site',$,$,#${sitePlacement},$,$,.ELEMENT.,$,$,$,$,$`)
  const buildingPlacement = nextId(); emit(buildingPlacement, 'IFCLOCALPLACEMENT', `#${sitePlacement},#${worldPlacement}`)
  const building = nextId(); emit(building, 'IFCBUILDING', `${ifcGuid()},$,'Ikarus Sauna',$,$,#${buildingPlacement},$,$,.ELEMENT.,$,$,$`)
  const storeyPlacement = nextId(); emit(storeyPlacement, 'IFCLOCALPLACEMENT', `#${buildingPlacement},#${worldPlacement}`)
  const storey = nextId(); emit(storey, 'IFCBUILDINGSTOREY', `${ifcGuid()},$,'Ground Floor',$,$,#${storeyPlacement},$,$,.ELEMENT.,0.0`)

  emit(nextId(), 'IFCRELAGGREGATES', `${ifcGuid()},$,$,$,#${project},(#${site})`)
  emit(nextId(), 'IFCRELAGGREGATES', `${ifcGuid()},$,$,$,#${site},(#${building})`)
  emit(nextId(), 'IFCRELAGGREGATES', `${ifcGuid()},$,$,$,#${building},(#${storey})`)

  function createPlacement(x, y, z, angle) {
    const pt = nextId(); emit(pt, 'IFCCARTESIANPOINT', pt3(x, y, z))
    const dir = nextId(); emit(dir, 'IFCDIRECTION', pt3(Math.cos(angle), Math.sin(angle), 0))
    const axis = nextId(); emit(axis, 'IFCAXIS2PLACEMENT3D', `#${pt},#${dirZ},#${dir}`)
    const lp = nextId(); emit(lp, 'IFCLOCALPLACEMENT', `#${storeyPlacement},#${axis}`)
    return lp
  }

  function createExtrudedBox(width, depth, height) {
    const p1 = nextId(); emit(p1, 'IFCCARTESIANPOINT', pt2(0, 0))
    const p2 = nextId(); emit(p2, 'IFCCARTESIANPOINT', pt2(width, 0))
    const p3 = nextId(); emit(p3, 'IFCCARTESIANPOINT', pt2(width, depth))
    const p4 = nextId(); emit(p4, 'IFCCARTESIANPOINT', pt2(0, depth))
    const poly = nextId(); emit(poly, 'IFCPOLYLINE', `(#${p1},#${p2},#${p3},#${p4},#${p1})`)
    const profile = nextId(); emit(profile, 'IFCARBITRARYCLOSEDPROFILEDEF', `.AREA.,$,#${poly}`)
    const pos = nextId(); emit(pos, 'IFCAXIS2PLACEMENT3D', `#${origin3d},#${dirZ},#${dirX}`)
    const solid = nextId(); emit(solid, 'IFCEXTRUDEDAREASOLID', `#${profile},#${pos},#${dirZ},${height.toFixed(4)}`)
    return solid
  }

  function createRepresentation(shapeId) {
    const shapeRep = nextId(); emit(shapeRep, 'IFCSHAPEREPRESENTATION', `#${subContext},'Body','SweptSolid',(#${shapeId})`)
    const prodShape = nextId(); emit(prodShape, 'IFCPRODUCTDEFINITIONSHAPE', `$,$,(#${shapeRep})`)
    return prodShape
  }

  const productIds = []

  // Track wall IDs: { name, id, x, y, z, angle, bw, bd, bh }
  const wallRegistry = []

  function addEl(ifcType, name, x, y, z, angle, bw, bd, bh, extra) {
    const lp = createPlacement(x, y, z, angle)
    const shape = createExtrudedBox(bw, bd, bh)
    const rep = createRepresentation(shape)
    const el = nextId()
    emit(el, ifcType, `${ifcGuid()},$,'${name}',$,$,#${lp},#${rep},$${extra || ''}`)
    productIds.push(el)
    return el
  }

  function addOpening(wallId, x, y, z, angle, ow, od, oh) {
    const lp = createPlacement(x, y, z, angle)
    const shape = createExtrudedBox(ow, od, oh)
    const rep = createRepresentation(shape)
    const opening = nextId()
    emit(opening, 'IFCOPENINGELEMENT', `${ifcGuid()},$,'Opening',$,$,#${lp},#${rep},$`)
    productIds.push(opening)
    emit(nextId(), 'IFCRELVOIDSELEMENT', `${ifcGuid()},$,$,$,#${wallId},#${opening}`)
  }

  const pxToMm = (px) => (px / S) * 10
  const L = mm(dims.length), W = mm(dims.width), H = mm(dims.height), wallT = mm(dims.wall)

  // Floor
  addEl('IFCSLAB', 'Floor', -L / 2, -W / 2, 0, 0, L, W, wallT, ',.FLOOR.')

  // 4 Walls — track their IDs for opening voids
  const frontWallId = addEl('IFCWALL', 'Front Wall', -L / 2, W / 2, 0, 0, L, wallT, H)
  wallRegistry.push({ name: 'front', id: frontWallId, x: -L/2, y: W/2, axis: 'y', coord: W/2 })
  const backWallId = addEl('IFCWALL', 'Back Wall', -L / 2, -W / 2 - wallT, 0, 0, L, wallT, H)
  wallRegistry.push({ name: 'back', id: backWallId, x: -L/2, y: -W/2-wallT, axis: 'y', coord: -W/2 })
  const leftWallId = addEl('IFCWALL', 'Left Wall', -L / 2 - wallT, -W / 2, 0, 0, wallT, W, H)
  wallRegistry.push({ name: 'left', id: leftWallId, x: -L/2-wallT, y: -W/2, axis: 'x', coord: -L/2 })
  const rightWallId = addEl('IFCWALL', 'Right Wall', L / 2, -W / 2, 0, 0, wallT, W, H)
  wallRegistry.push({ name: 'right', id: rightWallId, x: L/2, y: -W/2, axis: 'x', coord: L/2 })

  // Snap to nearest wall for doors/windows
  function snapToWall(px, py) {
    const halfL = L / 2, halfW = W / 2
    const dists = [
      { wall: 'front', d: Math.abs(py - halfW), wy: halfW, axis: 'y' },
      { wall: 'back', d: Math.abs(py + halfW), wy: -halfW, axis: 'y' },
      { wall: 'left', d: Math.abs(px + halfL), wy: -halfL, axis: 'x' },
      { wall: 'right', d: Math.abs(px - halfL), wy: halfL, axis: 'x' },
    ]
    dists.sort((a, b) => a.d - b.d)
    return dists[0]
  }

  placedComps.forEach(comp => {
    const cx = pxToMm(comp.x), cy = pxToMm(comp.y)
    const cw = pxToMm(comp.w || 44), ch = pxToMm(comp.h || 40)
    const rot = (comp.rot || 0) * (Math.PI / 180)

    switch (comp.type) {
      case 'door': {
        const doorH = H - wallT, doorW = cw
        const nearest = snapToWall(cx, cy)
        let dx, dy, dAngle
        if (nearest.axis === 'y') { dx = cx - doorW / 2; dy = nearest.wy - wallT / 2; dAngle = rot }
        else { dx = nearest.wy - wallT / 2; dy = cy - doorW / 2; dAngle = Math.PI / 2 + rot }
        addEl('IFCDOOR', `Door - ${comp.style || 'Standard'}`, dx, dy, 0, dAngle, doorW, wallT + 100, doorH, `,${doorH.toFixed(4)},${doorW.toFixed(4)}`)

        // Create opening in the nearest wall
        const nearestWall = wallRegistry.find(w => w.name === nearest.wall)
        if (nearestWall) {
          addOpening(nearestWall.id, dx, dy, 0, dAngle, doorW, wallT + 200, doorH)
        }
        break
      }
      case 'window': {
        const winH = 600, sill = 900, winW = cw
        const nearest = snapToWall(cx, cy)
        let wx, wy, wAngle
        if (nearest.axis === 'y') { wx = cx - winW / 2; wy = nearest.wy - wallT / 2; wAngle = rot }
        else { wx = nearest.wy - wallT / 2; wy = cy - winW / 2; wAngle = Math.PI / 2 + rot }
        addEl('IFCWINDOW', `Window - ${comp.style || 'Standard'}`, wx, wy, sill, wAngle, winW, wallT + 100, winH, `,${winH.toFixed(4)},${winW.toFixed(4)}`)

        // Create opening in the nearest wall
        const nearestWall = wallRegistry.find(w => w.name === nearest.wall)
        if (nearestWall) {
          addOpening(nearestWall.id, wx, wy, sill, wAngle, winW, wallT + 200, winH)
        }
        break
      }
      case 'heater':
        addEl('IFCFURNISHINGELEMENT', 'Heater', cx - cw / 2, cy - ch / 2, 0, rot, cw, ch, 800)
        break
      case 'bench': {
        const benchH = 450, benchD = 450
        addEl('IFCFURNISHINGELEMENT', `Bench - ${comp.style || 'Standard'}`, cx - cw / 2, cy - benchD / 2, 0, rot, cw, benchD, benchH)
        if (comp.style === 'L-Shape') {
          const sw = Math.min(cw, ch) * 0.8, armD = cw * 0.6
          addEl('IFCFURNISHINGELEMENT', 'Bench Arm', cx - cw / 2, cy + ch / 2, 0, rot, sw, armD, benchH)
        }
        if (comp.style === 'U-Shape') {
          const sw = Math.min(cw, ch) * 0.8, armD = cw * 0.5
          addEl('IFCFURNISHINGELEMENT', 'Bench Arm L', cx - cw / 2, cy + ch / 2, 0, rot, sw, armD, benchH)
          addEl('IFCFURNISHINGELEMENT', 'Bench Arm R', cx + cw / 2 - sw, cy + ch / 2, 0, rot, sw, armD, benchH)
        }
        break
      }
      case 'vent':
        addEl('IFCFURNISHINGELEMENT', 'Vent', cx - 100, cy - 100, pxToMm(comp.z || 0), rot, 200, 200, 50)
        break
      case 'light':
        addEl('IFCFURNISHINGELEMENT', 'Light', cx - 100, cy - 100, H - 100, rot, 200, 200, 50)
        break
    }
  })

  if (productIds.length > 0) {
    emit(nextId(), 'IFCRELCONTAINEDINSPATIALSTRUCTURE',
      `${ifcGuid()},$,$,$,(${productIds.map(id => '#' + id).join(',')}),#${storey}`)
  }

  return header + '\n' + lines.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;'
}
