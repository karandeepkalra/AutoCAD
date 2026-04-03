import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { generateSaunaIFC } from './exportIfc'
import { uid } from './constants.jsx'
import { getDefaultComps } from './utils/getDefaultComps'
import { constrainComponent, checkCollision } from './utils/constraints'
import { computeValidPositions } from './utils/positionEngine'
import { COMPONENT_CONSTRAINTS } from './utils/componentConstraints'
import SelectionScreen from './components/SelectionScreen'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import StatusBar from './components/StatusBar'
import './App.css'

export default function App() {
  const [screen, setScreen]         = useState('selection')
  const [saunaType, setSaunaType]   = useState('barrel')
  const [step, setStep]             = useState(0)

  const [projectName, setProjectName] = useState('My Sauna Project')
  const [zoom, setZoom]             = useState(1.1)
  const [pan, setPan]               = useState({ x: 0, y: 0 })
  const [cursor, setCursor]         = useState({ x: 0, y: 0 })
  const [isMoving, setIsMoving]     = useState(false)
  const [dims, setDims] = useState({ length: 370, width: 370, height: 220, wall: 9 })

  const [placedComps, setPlacedComps] = useState(getDefaultComps('barrel', { length: 370, width: 370, height: 220, wall: 9 }))
  const [selectedCompId, setSelectedCompId] = useState(null)

  // ─── Slot placement state ────────────────────────────────────────────────────
  const [pendingPlacementType, setPendingPlacementType] = useState(null)
  const [hoveredSlotIdx, setHoveredSlotIdx]             = useState(null)
  // Tracks the component being repositioned via canvas drag (excluded from collision check)
  const [movingCompId, setMovingCompId]                 = useState(null)

  // Compute valid slots — exclude the component being repositioned so it doesn't block its own slots
  const validSlots = useMemo(() => {
    if (!pendingPlacementType) return []
    const baseComps = movingCompId
      ? placedComps.filter(c => c.id !== movingCompId)
      : placedComps
    return computeValidPositions(pendingPlacementType, dims, saunaType, baseComps)
  }, [pendingPlacementType, movingCompId, dims, saunaType, placedComps])

  const cancelPlacement = useCallback(() => {
    setPendingPlacementType(null)
    setHoveredSlotIdx(null)
    setMovingCompId(null)
  }, [])

  // Called by Canvas when the user starts dragging a placed component
  const handleStartMove = useCallback((comp) => {
    setPendingPlacementType(comp.type)
    setMovingCompId(comp.id)
    setHoveredSlotIdx(null)
  }, [])

  // ─── Undo / Redo History ─────────────────────────────────────────────────────
  const [history, setHistory] = useState([])
  const [historyPtr, setHistoryPtr] = useState(-1)

  const saveToHistory = useCallback((currentType, currentDims, currentComps) => {
    const snapshot = JSON.parse(JSON.stringify({
      saunaType: currentType || saunaType,
      dims: currentDims || dims,
      placedComps: currentComps || placedComps
    }))
    setHistory(prev => {
      const newHistory = prev.slice(0, historyPtr + 1)
      newHistory.push(snapshot)
      if (newHistory.length > 50) newHistory.shift()
      return newHistory
    })
    setHistoryPtr(prev => Math.min(49, prev + 1))
  }, [saunaType, dims, placedComps, historyPtr])

  useEffect(() => {
    if (history.length === 0) saveToHistory(saunaType, dims, placedComps)
  }, [])

  const undo = useCallback(() => {
    if (historyPtr > 0) {
      const prevState = history[historyPtr - 1]
      setSaunaType(prevState.saunaType)
      setDims(prevState.dims)
      setPlacedComps(prevState.placedComps)
      setHistoryPtr(historyPtr - 1)
    }
  }, [history, historyPtr])

  const redo = useCallback(() => {
    if (historyPtr < history.length - 1) {
      const nextState = history[historyPtr + 1]
      setSaunaType(nextState.saunaType)
      setDims(nextState.dims)
      setPlacedComps(nextState.placedComps)
      setHistoryPtr(historyPtr + 1)
    }
  }, [history, historyPtr])

  // Initial pan: center of viewport
  const appRef = useRef(null)
  useEffect(() => {
    if (screen === 'editor' && appRef.current) {
      const ws = appRef.current.querySelector('.canvas-wrapper')
      if (ws) {
        const { width, height } = ws.getBoundingClientRect()
        setPan({ x: width / 2, y: height / 2 })
      }
    }
  }, [screen])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) { e.preventDefault(); redo() }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCompId !== null) {
        const nextComps = placedComps.filter(c => c.id !== selectedCompId)
        setPlacedComps(nextComps)
        saveToHistory(null, null, nextComps)
        setSelectedCompId(null)
      }
      if (e.key === 'Escape') {
        setSelectedCompId(null)
        cancelPlacement()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedCompId, placedComps, undo, redo, saveToHistory, cancelPlacement])

  // ─── Sidebar component click → enter placement mode ──────────────────────────
  const handleSidebarCompClick = useCallback((type) => {
    // Toggle off if clicking same type again
    setPendingPlacementType(prev => prev === type ? null : type)
    setHoveredSlotIdx(null)
    setSelectedCompId(null)
  }, [])

  // ─── Slot placement ───────────────────────────────────────────────────────────
  const handleSlotPlace = useCallback((slot) => {
    const type = pendingPlacementType
    if (!type) return

    const compSize = COMPONENT_CONSTRAINTS[type]?.defaultSize || { w: 44, h: 40 }
    let newComp = {
      id: uid(), type,
      x: slot.x, y: slot.y,
      z: 45,
      ...compSize,
      rot: slot.rot || 0,
    }
    newComp = constrainComponent(newComp, dims, saunaType)

    const nextComps = [...placedComps, newComp]
    setPlacedComps(nextComps)
    saveToHistory(null, null, nextComps)
    setPendingPlacementType(null)
    setHoveredSlotIdx(null)
  }, [pendingPlacementType, placedComps, dims, saunaType, saveToHistory])

  // ─── On-canvas drag (repositioning placed components) ────────────────────────
  const handleCompMove = useCallback((id, x, y) => {
    setPlacedComps(prev => {
      const currentComp = prev.find(c => c.id === id)
      if (!currentComp || currentComp.locked) return prev
      let proposed = { ...currentComp, x, y }
      const constrained = constrainComponent(proposed, dims, saunaType, prev)
      if (constrained.type !== 'bench' && checkCollision(constrained, prev)) return prev
      return prev.map(c => c.id === id ? constrained : c)
    })
  }, [dims, saunaType])

  const handleUpdateComp = useCallback((id, updates, saveHistory = true) => {
    setPlacedComps(prev => {
      const current = prev.find(c => c.id === id)
      if (!current) return prev
      if (prev.find(c => c.id === id)?.locked) return prev
      const updated = { ...current, ...updates }
      const constrained = constrainComponent(updated, dims, saunaType, prev)
      if (constrained.type !== 'bench' && checkCollision(constrained, prev)) return prev
      const nextComps = prev.map(c => c.id === id ? constrained : c)
      if (saveHistory) setTimeout(() => saveToHistory(null, null, nextComps), 0)
      return nextComps
    })
  }, [dims, saunaType, saveToHistory])

  const handleUpdateDims = useCallback((nextDims, saveHistory = true) => {
    const S = 1.25
    setDims(prevDims => {
      const oldW = prevDims.length * S
      const oldH = prevDims.width  * S
      const newW = nextDims.length * S
      const newH = nextDims.width  * S

      setPlacedComps(prevComps => {
        const adjusted = prevComps.map(comp => {
          let nx = comp.x, ny = comp.y
          if (saunaType === 'cube') {
            nx = (comp.x / oldW) * newW
            ny = (comp.y / oldH) * newH
          } else {
            const angle = Math.atan2(comp.y, comp.x)
            const dist  = Math.sqrt(comp.x ** 2 + comp.y ** 2)
            const oldR  = Math.min(oldW, oldH) / 2
            const newR  = Math.min(newW, newH) / 2
            const relDist = dist / oldR
            nx = relDist * newR * Math.cos(angle)
            ny = relDist * newR * Math.sin(angle)
          }
          return constrainComponent({ ...comp, x: nx, y: ny }, nextDims, saunaType, prevComps)
        })
        if (saveHistory) setTimeout(() => saveToHistory(null, nextDims, adjusted), 0)
        return adjusted
      })
      return nextDims
    })
  }, [saunaType, saveToHistory])

  const handleMoveEnd = useCallback(() => {
    if (movingCompId !== null && validSlots.length > 0) {
      // Find nearest valid slot to the component's current dragged position
      setPlacedComps(prev => {
        const comp = prev.find(c => c.id === movingCompId)
        if (!comp) return prev

        let minDist = Infinity, nearestSlot = validSlots[0]
        validSlots.forEach(slot => {
          const d = Math.sqrt((slot.x - comp.x) ** 2 + (slot.y - comp.y) ** 2)
          if (d < minDist) { minDist = d; nearestSlot = slot }
        })

        const snapped = constrainComponent(
          { ...comp, x: nearestSlot.x, y: nearestSlot.y, rot: nearestSlot.rot },
          dims, saunaType, prev
        )
        const nextComps = prev.map(c => c.id === movingCompId ? snapped : c)
        saveToHistory(null, null, nextComps)
        return nextComps
      })
    } else {
      saveToHistory(null, null, placedComps)
    }
    setMovingCompId(null)
    setPendingPlacementType(null)
    setHoveredSlotIdx(null)
  }, [movingCompId, validSlots, placedComps, dims, saunaType, saveToHistory])

  const handleExportIFC = () => {
    const ifcData = generateSaunaIFC(saunaType, dims, placedComps)
    const blob = new Blob([JSON.stringify(ifcData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${projectName.replace(/\s+/g, '-')}.ifc`; a.click()
    URL.revokeObjectURL(url)
  }

  if (screen === 'selection') {
    return (
      <SelectionScreen
        selected={saunaType}
        onSelect={setSaunaType}
        onLaunch={() => setScreen('editor')}
      />
    )
  }

  return (
    <div
      className="app"
      ref={appRef}
      onClick={() => { setSelectedCompId(null); cancelPlacement() }}
    >
      <Navbar step={step} onStepChange={setStep} onExportIFC={handleExportIFC} />
      <div className="workspace">
        <Sidebar
          saunaType={saunaType}
          step={step}
          onTypeSwitch={t => {
            const nextComps = getDefaultComps(t, dims)
            setSaunaType(t)
            setPlacedComps(nextComps)
            saveToHistory(t, null, nextComps)
            cancelPlacement()
          }}
          dims={dims}
          onUpdateDims={handleUpdateDims}
          selectedComp={placedComps.find(c => c.id === selectedCompId)}
          onUpdateComp={handleUpdateComp}
          placedComps={placedComps}
          pendingPlacementType={pendingPlacementType}
          validSlots={validSlots}
          hoveredSlotIdx={hoveredSlotIdx}
          onCompClick={handleSidebarCompClick}
          onSlotHover={setHoveredSlotIdx}
          onSlotPlace={handleSlotPlace}
          onCancelPlacement={cancelPlacement}
        />
        <Canvas
          saunaType={saunaType}
          dims={dims}
          placedComps={placedComps}
          onCompMove={handleCompMove}
          onMoveEnd={handleMoveEnd}
          onCompSelect={setSelectedCompId}
          selectedCompId={selectedCompId}
          zoom={zoom}
          pan={pan}
          onZoomChange={setZoom}
          onPanChange={setPan}
          isMoving={isMoving}
          setIsMoving={setIsMoving}
          validSlots={validSlots}
          hoveredSlotIdx={hoveredSlotIdx}
          pendingPlacementType={pendingPlacementType}
          movingCompId={movingCompId}
          onSlotPlace={handleSlotPlace}
          onSlotHover={setHoveredSlotIdx}
          onStartMove={handleStartMove}
        />
      </div>
      <StatusBar
        saunaType={saunaType}
        cursor={cursor}
        objCount={placedComps.length + 1}
      />
    </div>
  )
}
