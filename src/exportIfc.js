/**
 * IFC BIM Export Utility for Ikarus Sauna CAD
 * Generates a Revit-compatible hierarchical JSON structure 
 * following IFC schema concepts.
 */

const uuid = () => 'ifc-' + Math.random().toString(36).substr(2, 9)

export function generateSaunaIFC(saunaType, dims, placedComps) {
  const mm = (cm) => Math.round(cm * 10)
  const S = 1.25 // Scale factor from App.jsx
  
  // 1. Root Hierarchy
  const projectId = uuid()
  const siteId = uuid()
  const buildingId = uuid()
  const storeyId = uuid()
  const spaceId = uuid()

  const ifcDesign = {
    IfcProject: {
      GlobalId: projectId,
      Name: "Ikarus Sauna Project",
      Units: "Millimeters",
      Site: {
        GlobalId: siteId,
        Name: "Sauna Site",
        Building: {
          GlobalId: buildingId,
          Name: "Ikarus Sauna Unit",
          Storey: {
            GlobalId: storeyId,
            Name: "Ground Floor",
            Elevation: 0,
            Space: {
              GlobalId: spaceId,
              Name: "Sauna Interior",
              LongName: saunaType === 'barrel' ? "Barrel Sauna Interior" : "Cube Sauna Interior",
              Dimensions: {
                Length: mm(dims.length),
                Width: mm(dims.width),
                Height: mm(dims.height)
              },
              Elements: []
            }
          }
        }
      }
    }
  }

  const elements = ifcDesign.IfcProject.Site.Building.Storey.Space.Elements

  // 2. Structural Elements (Walls, Floor, Root)
  // For Cube, 4 walls. For Barrel, 2 end walls + 1 shell.
  if (saunaType === 'cube') {
    const wallThick = mm(dims.wall)
    const wallHeight = mm(dims.height)
    const L = mm(dims.length)
    const W = mm(dims.width)

    // Floor
    elements.push({
      GlobalId: uuid(),
      IfcClass: "IfcSlab",
      Name: "Sauna Floor",
      PredefinedType: "FLOOR",
      Dimensions: { Length: L, Width: W, Thickness: wallThick },
      Placement: { x: 0, y: 0, z: 0 },
      Material: "Nordic Spruce"
    })

    // Roof
    elements.push({
      GlobalId: uuid(),
      IfcClass: "IfcRoof",
      Name: "Sauna Roof",
      PredefinedType: "FLAT_ROOF",
      Dimensions: { Length: L, Width: W, Thickness: wallThick },
      Placement: { x: 0, y: 0, z: wallHeight },
      Material: "Nordic Spruce"
    })

    // 4 Walls
    const wallData = [
      { name: "Front Wall", x: 0, y: W/2, rot: 0, len: L },
      { name: "Back Wall",  x: 0, y: -W/2, rot: 180, len: L },
      { name: "Left Wall",  x: -L/2, y: 0, rot: 90, len: W },
      { name: "Right Wall", x: L/2, y: 0, rot: -90, len: W }
    ]

    wallData.forEach(w => {
      elements.push({
        GlobalId: uuid(),
        IfcClass: "IfcWall",
        Name: w.name,
        Dimensions: { Length: w.len, Height: wallHeight, Thickness: wallThick },
        Placement: { x: w.x, y: w.y, z: 0, Rotation: w.rot },
        Material: "Solid Wood",
        RevitCategory: "Walls"
      })
    })
  } else {
    // Barrel
    const L = mm(dims.length)
    const R = mm(dims.width / 2)
    const wallThick = mm(dims.wall)

    // Curved Shell
    elements.push({
      GlobalId: uuid(),
      IfcClass: "IfcWall",
      Name: "Barrel Shell",
      ObjectType: "CURVED_SHELL",
      Dimensions: { Length: L, Radius: R, ArcAngle: 360, Thickness: wallThick },
      Placement: { x: 0, y: 0, z: R },
      CurvedGeometryMetadata: { CenterX: 0, CenterY: 0, Radius: R },
      Material: "ThermoWood",
      RevitCategory: "Roof" // Often mapped to roof for curved geometry in Revit
    })

    // End Walls
    const endWalls = [
      { name: "Front Face", x: L/2 },
      { name: "Back Face", x: -L/2 }
    ]
    endWalls.forEach(w => {
      elements.push({
        GlobalId: uuid(),
        IfcClass: "IfcWall",
        Name: w.name,
        Dimensions: { Radius: R, Thickness: wallThick },
        Placement: { x: w.x, y: 0, z: R, Rotation: 90 },
        Material: "Solid Wood"
      })
    })
  }

  // 3. Internal Components
  placedComps.forEach(comp => {
    let ifcClass = "IfcFurnishingElement"
    let revitCat = "Furniture"

    switch(comp.type) {
      case 'heater': ifcClass = "IfcSpaceHeater"; revitCat = "Mechanical Equipment"; break;
      case 'bench':  ifcClass = "IfcFurniture";   revitCat = "Furniture"; break;
      case 'door':   ifcClass = "IfcDoor";        revitCat = "Doors"; break;
      case 'window': ifcClass = "IfcWindow";      revitCat = "Windows"; break;
      case 'light':        ifcClass = "IfcLightFixture";      revitCat = "Lighting Fixtures"; break;
      case 'vent':         ifcClass = "IfcFlowTerminal";      revitCat = "Mechanical Equipment"; break;
      case 'speaker':      ifcClass = "IfcAudioVisualAppliance"; revitCat = "Communication Devices"; break;
      case 'controlunit':  ifcClass = "IfcController";        revitCat = "Electrical Fixtures"; break;
      case 'thermometer':  ifcClass = "IfcSensor";            revitCat = "Specialty Equipment"; break;
      case 'timer':        ifcClass = "IfcActuator";          revitCat = "Electrical Fixtures"; break;
    }

    elements.push({
      GlobalId: comp.id || uuid(),
      IfcClass: ifcClass,
      Name: `${comp.type.toUpperCase()} - ${comp.style || 'Standard'}`,
      ObjectType: comp.style || "DEFAULT",
      Placement: {
        x: mm(comp.x / S),
        y: mm(comp.y / S),
        z: mm(comp.z / S),
        Rotation: comp.rot || 0
      },
      Dimensions: {
        Width: mm(comp.w),
        Height: mm(comp.h),
        Depth: comp.type === 'bench' ? 450 : 200 // default depths in mm
      },
      Metadata: {
        FamilySourceId: `IKARUS_${comp.type.toUpperCase()}_v1`,
        LinkedAssetPath: `/assets/bim/v1/${comp.type}.glb`,
        CollisionSafeZone: "300mm Clearance",
        BOM_ID: `BOM-${comp.id || '000'}`,
        PricingMetadata: { Currency: "EUR", BasePrice: 150.00 }
      },
      RevitCategory: revitCat
    })
  })

  return ifcDesign
}
