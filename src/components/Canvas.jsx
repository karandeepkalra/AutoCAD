import { useState, useRef, useCallback, useEffect } from 'react'
import { S } from '../constants.jsx'
import BarrelTopView from './BarrelTopView'
import CubeTopView from './CubeTopView'
import CompShape from './CompShape'

export default function Canvas({
  saunaType, dims, placedComps,
  onCompMove, onMoveEnd, onCompSelect, selectedCompId,
  zoom, pan, onZoomChange, onPanChange,
  isMoving, setIsMoving,
  // Slot placement
  validSlots, hoveredSlotIdx, pendingPlacementType,
  onSlotPlace, onSlotHover, onStartMove,
}) {
  const wrapperRef  = useRef(null)
  const svgRef      = useRef(null)
  const movingRef   = useRef(null)   // { id, offX, offY }
  const panningRef  = useRef(null)   // { startX, startY, originX, originY }
  const [activeTool, setActiveTool] = useState('select')
  const [snapLine, setSnapLine]     = useState(null)
  const [isDraggingComp, setIsDraggingComp] = useState(false)

  // Convert screen → SVG world coords
  const toWorld = useCallback((clientX, clientY) => {
    const rect = wrapperRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top  - pan.y) / zoom,
    }
  }, [zoom, pan])

  // ── Wheel: zoom toward cursor ────────────────────────────────────────────
  const onWheel = useCallback(e => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.12 : 0.89
    const rect = wrapperRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    onPanChange(prev => ({
      x: mx - (mx - prev.x) * factor,
      y: my - (my - prev.y) * factor,
    }))
    onZoomChange(prev => Math.max(0.1, Math.min(5, prev * factor)))
  }, [onZoomChange, onPanChange])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  // ── Mouse down ────────────────────────────────────────────────────────────
  const onMouseDown = e => {
    if (e.button === 1 || activeTool === 'pan') {
      panningRef.current = { startX: e.clientX, startY: e.clientY, originX: pan.x, originY: pan.y }
      e.preventDefault()
    }
  }

  // ── Mouse move / up (global) ─────────────────────────────────────────────
  useEffect(() => {
    const onMove = e => {
      if (!wrapperRef.current) return
      const w = toWorld(e.clientX, e.clientY)

      if (panningRef.current) {
        const { startX, startY, originX, originY } = panningRef.current
        onPanChange({ x: originX + e.clientX - startX, y: originY + e.clientY - startY })
        return
      }

      if (movingRef.current) {
        const { id, offX, offY } = movingRef.current
        const nx = w.x + offX
        const ny = w.y + offY
        setSnapLine({ x: nx, y: ny })
        setIsMoving(true)
        setIsDraggingComp(true)
        onCompMove(id, nx, ny)

        // Highlight nearest valid slot so user can see where it will snap
        if (validSlots.length > 0) {
          let minDist = Infinity, nearestIdx = 0
          validSlots.forEach((slot, idx) => {
            const d = Math.sqrt((slot.x - nx) ** 2 + (slot.y - ny) ** 2)
            if (d < minDist) { minDist = d; nearestIdx = idx }
          })
          onSlotHover(nearestIdx)
        }
      }
    }

    const onUp = e => {
      if (e.button === 1 || panningRef.current) { panningRef.current = null; return }
      if (movingRef.current) {
        movingRef.current = null
        setSnapLine(null)
        setIsMoving(false)
        setIsDraggingComp(false)
        onMoveEnd()
      }
      setIsMoving(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',  onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',  onUp)
    }
  }, [toWorld, onPanChange, onCompMove, onMoveEnd, setIsMoving])

  // ── Start moving a placed component ──────────────────────────────────────
  const startCompMove = (e, comp) => {
    e.stopPropagation()
    e.preventDefault()
    onCompSelect(comp.id)
    const w = toWorld(e.clientX, e.clientY)
    movingRef.current = { id: comp.id, offX: comp.x - w.x, offY: comp.y - w.y }
    // Enter slot mode for this component type (excludes self from collision check)
    onStartMove(comp)
  }

  // ── Sidebar drag-in: snap to nearest valid slot ─────────────────────────
  const onDragOver = e => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!wrapperRef.current || validSlots.length === 0) return
    const w = toWorld(e.clientX, e.clientY)
    let minDist = Infinity, nearestIdx = 0
    validSlots.forEach((slot, idx) => {
      const d = Math.sqrt((slot.x - w.x) ** 2 + (slot.y - w.y) ** 2)
      if (d < minDist) { minDist = d; nearestIdx = idx }
    })
    onSlotHover(nearestIdx)
  }
  const onDragLeave = () => onSlotHover(null)
  const onDropCanvas = e => {
    e.preventDefault()
    if (validSlots.length > 0 && hoveredSlotIdx !== null) {
      onSlotPlace(validSlots[hoveredSlotIdx])
    } else if (validSlots.length > 0) {
      onSlotPlace(validSlots[0])
    }
    onSlotHover(null)
  }

  // ── Fit view ──────────────────────────────────────────────────────────────
  const fitView = () => {
    if (!wrapperRef.current) return
    const { width, height } = wrapperRef.current.getBoundingClientRect()
    onZoomChange(0.88)
    onPanChange({ x: width / 2, y: height / 2 })
  }

  const transform = `translate(${pan.x}, ${pan.y}) scale(${zoom})`

  // Ghost slot — only shown on sidebar hover, not while physically dragging a component
  const ghostSlot = (pendingPlacementType && hoveredSlotIdx !== null && !isDraggingComp)
    ? validSlots[hoveredSlotIdx]
    : null

  return (
    <div className="canvas-area">
      <div
        ref={wrapperRef}
        className={`canvas-wrapper ${activeTool === 'pan' ? 'pan-cursor' : ''}${pendingPlacementType ? ' placement-mode' : ''}`}
        onMouseDown={onMouseDown}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDropCanvas}
      >
        <svg ref={svgRef} className="main-svg">
          <defs>
            <pattern id="gridSm" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0L0 0 0 10" fill="none" stroke="#EAECEF" strokeWidth="0.5" />
            </pattern>
            <pattern id="gridLg" width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill="url(#gridSm)" />
              <path d="M50 0L0 0 0 50" fill="none" stroke="#D8DCE1" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#gridLg)" />

          <g transform={transform}>

            {/* Snap lines during manual drag */}
            {snapLine && (
              <g opacity="0.65">
                <line x1={snapLine.x} y1={-5000} x2={snapLine.x} y2={5000}
                  stroke="#F26419" strokeWidth="0.8" strokeDasharray="5,4" />
                <line x1={-5000} y1={snapLine.y} x2={5000} y2={snapLine.y}
                  stroke="#F26419" strokeWidth="0.8" strokeDasharray="5,4" />
              </g>
            )}

            {/* Safe interior highlight during drag */}
            {isMoving && (
              <>
                {saunaType === 'cube' ? (
                  <rect
                    x={-dims.length*S/2 + dims.wall*S} y={-dims.width*S/2 + dims.wall*S}
                    width={dims.length*S - dims.wall*S*2} height={dims.width*S - dims.wall*S*2}
                    fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)"
                    strokeWidth="1.5" strokeDasharray="4,4" style={{ pointerEvents: 'none' }}
                  />
                ) : (
                  <ellipse cx={0} cy={0}
                    rx={(dims.length/2)*S - dims.wall*S - 5}
                    ry={(dims.width/2)*S  - dims.wall*S - 5}
                    fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)"
                    strokeWidth="1.5" strokeDasharray="4,4" style={{ pointerEvents: 'none' }}
                  />
                )}
                {placedComps.map(other => {
                  if (selectedCompId === other.id || !['heater','bench'].includes(other.type)) return null
                  return (
                    <g key={`occ-${other.id}`}>
                      <rect
                        x={other.x - (other.w||44)/2} y={other.y - (other.h||40)/2}
                        width={other.w||44} height={other.h||40}
                        fill="rgba(239,68,68,0.22)" stroke="rgba(239,68,68,0.45)"
                        strokeWidth="1.2" strokeDasharray="3,2" style={{ pointerEvents: 'none' }}
                      />
                      <text x={other.x} y={other.y + 4}
                        fill="#EF4444" fontSize="8" fontWeight="bold" textAnchor="middle"
                        style={{ pointerEvents: 'none' }}>LOCKED</text>
                    </g>
                  )
                })}
              </>
            )}

            {/* Room outline */}
            {saunaType === 'barrel' ? <BarrelTopView dims={dims} /> : <CubeTopView dims={dims} />}

            {/* Placed components */}
            {placedComps.map(comp => (
              <g
                key={comp.id}
                transform={`translate(${comp.x}, ${comp.y})`}
                style={{ cursor: 'move', userSelect: 'none' }}
                onMouseDown={e => startCompMove(e, comp)}
                onClick={e => { e.stopPropagation(); onCompSelect(comp.id) }}
              >
                <rect x={-42} y={-42} width={84} height={84} fill="transparent" />
                <g transform={`rotate(${comp.rot || 0})`}>
                  <CompShape type={comp.type} style={comp.style}
                    w={comp.w} h={comp.h} id={comp.id} allComps={placedComps} />
                </g>
                {selectedCompId === comp.id && (
                  <rect x={-40} y={-40} width={80} height={80}
                    fill="none" stroke="#F26419" strokeWidth="1.5"
                    strokeDasharray="5,3" rx="4" style={{ pointerEvents: 'none' }} />
                )}
              </g>
            ))}

            {/* ── Slot placement overlay ─────────────────────────────────── */}
            {pendingPlacementType && (
              <>
                {/* Ghost component at hovered slot position */}
                {ghostSlot && (
                  <g
                    transform={`translate(${ghostSlot.x}, ${ghostSlot.y})`}
                    opacity={0.5}
                    style={{ pointerEvents: 'none' }}
                  >
                    <g transform={`rotate(${ghostSlot.rot || 0})`}>
                      <CompShape
                        type={pendingPlacementType}
                        w={44} h={40}
                        id={-999}
                        allComps={placedComps}
                      />
                    </g>
                    {/* Dashed outline around ghost */}
                    <rect x={-40} y={-40} width={80} height={80}
                      fill="rgba(242,100,25,0.06)"
                      stroke="#F26419" strokeWidth="1.5"
                      strokeDasharray="5,3" rx="4"
                      style={{ pointerEvents: 'none' }} />
                  </g>
                )}

                {/* Slot markers */}
                {validSlots.map((slot, idx) => {
                  const isHovered = hoveredSlotIdx === idx
                  return (
                    <g
                      key={idx}
                      transform={`translate(${slot.x}, ${slot.y})`}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => onSlotHover(idx)}
                      onMouseLeave={() => onSlotHover(null)}
                      onClick={e => { e.stopPropagation(); onSlotPlace(slot) }}
                    >
                      {/* Subtle pulse ring on hover */}
                      {isHovered && (
                        <circle r={17} fill="none"
                          stroke="rgba(242,100,25,0.2)" strokeWidth="6"
                          style={{ pointerEvents: 'none' }} />
                      )}
                      {/* Main dot */}
                      <circle
                        r={isHovered ? 11 : 8}
                        fill={isHovered ? '#F26419' : '#fff'}
                        stroke="#F26419"
                        strokeWidth={isHovered ? 0 : 1.5}
                        strokeDasharray={isHovered ? '' : '2.5,2'}
                      />
                      {/* Number */}
                      <text
                        y="3.5" textAnchor="middle"
                        fontSize="7.5" fontWeight="700"
                        fill={isHovered ? '#fff' : '#F26419'}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >{idx + 1}</text>
                    </g>
                  )
                })}

                {/* "No positions available" indicator */}
                {validSlots.length === 0 && (
                  <text
                    x={0} y={0} textAnchor="middle"
                    fontSize="11" fill="rgba(239,68,68,0.7)"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >No valid positions</text>
                )}
              </>
            )}

          </g>
        </svg>

        {/* Placement mode banner */}
        {/* {pendingPlacementType && (
          <div className="placement-banner" onClick={e => e.stopPropagation()}>
            <span>
              Placing <strong>{pendingPlacementType}</strong> —
              {validSlots.length > 0
                ? ` ${validSlots.length} position${validSlots.length !== 1 ? 's' : ''} available`
                : ' no valid positions'}
            </span>
            <button className="placement-banner-cancel" onClick={onCancelPlacement}>
              ✕ Cancel
            </button>
          </div>
        )} */}

        {/* Floating toolbar */}
        <div className="canvas-toolbar" onClick={e => e.stopPropagation()}>
          {[
            { id: 'select', title: 'Select', icon: <path d="M5 3l14 9-7 1-4 7-3-17z" /> },
            { id: 'pan',    title: 'Pan',    icon: <path d="M5 9V5a2 2 0 0 1 4 0v4m4-3a2 2 0 0 1 4 0v5m-4-3a2 2 0 0 1 4 0v6a8 8 0 0 1-16 0v-5a2 2 0 0 1 4 0" /> },
          ].map(t => (
            <button key={t.id}
              className={`tool-btn ${activeTool === t.id ? 'tool-active' : ''}`}
              title={t.title} onClick={() => setActiveTool(t.id)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{t.icon}</svg>
            </button>
          ))}
          <div className="toolbar-sep" />
          <button className="tool-btn" title="Zoom In"  onClick={() => onZoomChange(z => Math.min(5, z * 1.25))}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button className="tool-btn" title="Zoom Out" onClick={() => onZoomChange(z => Math.max(0.1, z / 1.25))}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button className="tool-btn" title="Fit View" onClick={fitView}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          <div className="toolbar-sep" />
          <span className="zoom-display">{Math.round(zoom * 100)}%</span>
        </div>

      </div>
    </div>
  )
}
