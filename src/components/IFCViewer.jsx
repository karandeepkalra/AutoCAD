import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as WebIFC from 'web-ifc'

export default function IFCViewer({ ifcData }) {
  const containerRef = useRef(null)
  const cleanupRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !ifcData) return

    // Wait one frame so the container has layout dimensions
    const timer = requestAnimationFrame(() => {
      if (!containerRef.current) return

      // Clean up previous viewer if any
      if (cleanupRef.current) cleanupRef.current()

      const container = containerRef.current
      const cw = container.clientWidth || 800
      const ch = container.clientHeight || 600

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf7f8fa)

      // Strong ambient so nothing is dark
      scene.add(new THREE.AmbientLight(0xffffff, 1.2))

      // Multiple directional lights from all sides
      const addDir = (x, y, z, intensity) => {
        const l = new THREE.DirectionalLight(0xffffff, intensity)
        l.position.set(x, y, z)
        scene.add(l)
      }
      addDir(1, 2, 1, 0.8)
      addDir(-1, 2, -1, 0.5)
      addDir(0, -1, 0, 0.4)
      addDir(1, 0, -1, 0.3)

      // Hemisphere light for soft fill
      scene.add(new THREE.HemisphereLight(0xffffff, 0xcccccc, 0.6))

      const camera = new THREE.PerspectiveCamera(45, cw / ch, 1, 100000)
      camera.position.set(5000, 5000, 5000)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(cw, ch)
      container.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true

      // Load IFC
      ;(async () => {
        try {
          const api = new WebIFC.IfcAPI()
          api.SetWasmPath('/')
          await api.Init()

          const bytes = typeof ifcData === 'string'
            ? new TextEncoder().encode(ifcData)
            : new Uint8Array(ifcData)

          const modelId = api.OpenModel(bytes)
          const group = new THREE.Group()
          const meshes = api.LoadAllGeometry(modelId)

          // IFC type constants for color mapping
          const WALL = 687, SLAB = 1687, DOOR = 395, WINDOW = 3856, FURNISHING = 1795
          const OPENING = 3512 // IFCOPENINGELEMENT

          for (let i = 0; i < meshes.size(); i++) {
            const mesh = meshes.get(i)
            const expressID = mesh.expressID
            const placed = mesh.geometries

            // Determine element type for color/opacity
            let ifcType = 0
            try { ifcType = api.GetLine(modelId, expressID)?.type || 0 } catch(e) {}

            // Skip doors, windows, and opening elements — show cutouts only
            if (ifcType === DOOR || ifcType === WINDOW || ifcType === OPENING) continue

            for (let j = 0; j < placed.size(); j++) {
              const pg = placed.get(j)
              const geo = api.GetGeometry(modelId, pg.geometryExpressID)
              const verts = api.GetVertexArray(geo.GetVertexData(), geo.GetVertexDataSize())
              const indices = api.GetIndexArray(geo.GetIndexData(), geo.GetIndexDataSize())
              if (!verts.length || !indices.length) continue

              const geometry = new THREE.BufferGeometry()
              const pos = new Float32Array(verts.length / 2)
              const norm = new Float32Array(verts.length / 2)
              for (let k = 0; k < verts.length; k += 6) {
                const idx = k / 2
                pos[idx] = verts[k]; pos[idx+1] = verts[k+1]; pos[idx+2] = verts[k+2]
                norm[idx] = verts[k+3]; norm[idx+1] = verts[k+4]; norm[idx+2] = verts[k+5]
              }
              geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
              geometry.setAttribute('normal', new THREE.BufferAttribute(norm, 3))
              geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))

              // Color/opacity by element type
              let color, opacity
              if (ifcType === WALL) {
                color = new THREE.Color(0xd0d0d0)
                opacity = 0.25
              } else if (ifcType === SLAB) {
                color = new THREE.Color(0xe8e0d0)
                opacity = 0.4
              } else if (ifcType === FURNISHING) {
                color = new THREE.Color(0xB4825A)
                opacity = 0.9
              } else {
                color = new THREE.Color(pg.color.x, pg.color.y, pg.color.z)
                opacity = pg.color.w
              }

              const mat = new THREE.MeshPhongMaterial({
                color, opacity, transparent: true, side: THREE.DoubleSide, depthWrite: opacity > 0.5,
              })
              const m = new THREE.Mesh(geometry, mat)
              const fm = pg.flatTransformation
              const mx = new THREE.Matrix4()
              mx.set(fm[0],fm[4],fm[8],fm[12], fm[1],fm[5],fm[9],fm[13], fm[2],fm[6],fm[10],fm[14], fm[3],fm[7],fm[11],fm[15])
              m.applyMatrix4(mx)
              group.add(m)
            }
          }

          scene.add(group)

          const box = new THREE.Box3().setFromObject(group)
          if (!box.isEmpty()) {
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            const fov = camera.fov * (Math.PI / 180)
            const dist = (maxDim / 2) / Math.tan(fov / 2) * 1.5
            camera.position.set(center.x + dist * 0.5, center.y + dist * 0.7, center.z + dist * 0.5)
            camera.lookAt(center)
            controls.target.copy(center)
            controls.update()
          }

          api.CloseModel(modelId)
        } catch (err) {
          console.error('IFC load error:', err)
        }
      })()

      let animationId
      const animate = () => {
        controls.update()
        renderer.render(scene, camera)
        animationId = requestAnimationFrame(animate)
      }
      animate()

      const handleResize = () => {
        if (!container) return
        const w = container.clientWidth, h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', handleResize)

      cleanupRef.current = () => {
        window.removeEventListener('resize', handleResize)
        cancelAnimationFrame(animationId)
        renderer.dispose()
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
        cleanupRef.current = null
      }
    })

    return () => {
      cancelAnimationFrame(timer)
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [ifcData])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
