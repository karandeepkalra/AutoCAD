import { useState, useRef, useCallback, useEffect } from 'react'
import { generateSaunaIFC } from './exportIfc'
import { uid } from './constants.jsx'
import { getDefaultComps } from './utils/getDefaultComps'
import { constrainComponent, checkCollision } from './utils/constraints'
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

  // ─── Undo / Redo History ─────────────────────────────────────────
  const [history, setHistory] = useState([])
  const [historyPtr, setHistoryPtr] = useState(-1)

  // Save current design state to history
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

  // Initialize history on first load
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory(saunaType, dims, placedComps)
    }
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

  // Keyboard shortcuts (Del, Esc, Undo/Redo)
  useEffect(() => {
    const onKey = e => {
      // Undo / Redo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
      }

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCompId !== null) {
        const nextComps = placedComps.filter(c => c.id !== selectedCompId)
        setPlacedComps(nextComps)
        saveToHistory(null, null, nextComps)
        setSelectedCompId(null)
      }
      if (e.key === 'Escape') setSelectedCompId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedCompId, placedComps, undo, redo, saveToHistory])

  const handleDrop = useCallback((type, x, y) => {
    let nx = x, ny = y, nz = 45

    let newComp = { id: uid(), type, x: nx, y: ny, z: nz, w: 44, h: 40 }
    newComp = constrainComponent(newComp, dims, saunaType)

    const nextComps = [...placedComps, newComp]
    setPlacedComps(nextComps)
    saveToHistory(null, null, nextComps)
  }, [placedComps, saveToHistory, dims, saunaType])


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
          let nx = comp.x
          let ny = comp.y

          if (saunaType === 'cube') {
            // Rectangular scaling
            nx = (comp.x / oldW) * newW
            ny = (comp.y / oldH) * newH
          } else {
            // Circular/Polar scaling for Barrel
            const angle = Math.atan2(comp.y, comp.x)
            const dist  = Math.sqrt(comp.x**2 + comp.y**2)
            const oldR  = Math.min(oldW, oldH) / 2
            const newR  = Math.min(newW, newH) / 2
            const relDist = dist / oldR
            const newDist = relDist * newR
            nx = newDist * Math.cos(angle)
            ny = newDist * Math.sin(angle)
          }

          // Re-apply boundary constraints with the new dimensions
          return constrainComponent({ ...comp, x: nx, y: ny }, nextDims, saunaType, prevComps)
        })

        if (saveHistory) setTimeout(() => saveToHistory(null, nextDims, adjusted), 0)
        return adjusted
      })

      return nextDims
    })
  }, [saunaType, saveToHistory])

  const handleMoveEnd = useCallback(() => {
    saveToHistory(null, null, placedComps)
  }, [placedComps, saveToHistory])

  const handleCompDragStart = (e, type, directAdd = false) => {
    if (directAdd) {
      handleDrop(type, 0, 0)
      return
    }
    setIsMoving(true)
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', type)
      e.dataTransfer.effectAllowed = 'copy'
    }
  }



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
    <div className="app" ref={appRef} onClick={() => setSelectedCompId(null)}>
      <Navbar
        step={step}
        onStepChange={setStep}
        onExportIFC={handleExportIFC}
      />
      <div className="workspace">
        <Sidebar
          saunaType={saunaType}
          step={step}
          onTypeSwitch={t => {
            const nextComps = getDefaultComps(t, dims)
            setSaunaType(t)
            setPlacedComps(nextComps)
            saveToHistory(t, null, nextComps)
          }}
          onCompDragStart={handleCompDragStart}
          dims={dims}
          onUpdateDims={handleUpdateDims}
          selectedComp={placedComps.find(c => c.id === selectedCompId)}
          onUpdateComp={handleUpdateComp}
        />
        <Canvas
          saunaType={saunaType}
          dims={dims}
          placedComps={placedComps}
          onDrop={handleDrop}
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
