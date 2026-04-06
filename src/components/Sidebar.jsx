import { COMPONENTS, COMP_SVG, DOOR_OPTIONS, WINDOW_OPTIONS, BENCH_OPTIONS, SPEAKER_OPTIONS, CONTROLUNIT_OPTIONS, THERMOMETER_OPTIONS, TIMER_OPTIONS } from '../constants.jsx'
import { getMaxCount } from '../utils/positionEngine'

const STEP_TYPES = {
  0: [],
  1: ['door', 'window'],
  2: ['heater', 'bench'],
  3: ['light', 'vent', 'speaker', 'controlunit', 'thermometer', 'timer'],
  4: [],
}

const STEP_HINTS = {
  0: 'Adjust room dimensions below.',
  4: 'Your design is ready. Click BIM (IFC) to export.',
}

export default function Sidebar({
  saunaType, onTypeSwitch, step, dims, onUpdateDims,
  selectedComp, onUpdateComp,
  placedComps, pendingPlacementType, validSlots, hoveredSlotIdx,
  onCompClick, onSlotHover, onSlotPlace, onCancelPlacement,
}) {
  const visibleTypes = STEP_TYPES[step] ?? []
  const visibleComps = COMPONENTS.filter(c => visibleTypes.includes(c.type))
  const isInPlacementMode = !!pendingPlacementType

  const updateDim = (key, val, commit = false) => {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) onUpdateDims({ ...dims, [key]: n }, commit)
  }

  return (
    <aside className="sidebar" onClick={e => e.stopPropagation()}>

      {/* ── Sauna type switcher ── */}
      <div className="sb-section">
        <div className="sb-label">Sauna Type</div>
        <div className="type-btns">
          <div className={`type-btn ${saunaType === 'barrel' ? 'tb-active' : ''}`} onClick={() => onTypeSwitch('barrel')}>
            <svg viewBox="0 0 40 22" fill="none">
              <ellipse cx="20" cy="11" rx="18" ry="10" stroke="currentColor" strokeWidth="1.5" />
              {[11,20,29].map(x => <line key={x} x1={x} y1={2} x2={x} y2={20} stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,1.5" />)}
            </svg>
            Barrel
          </div>
          <div className={`type-btn ${saunaType === 'cube' ? 'tb-active' : ''}`} onClick={() => onTypeSwitch('cube')}>
            <svg viewBox="0 0 40 22" fill="none">
              <rect x="4" y="2" width="32" height="18" stroke="currentColor" strokeWidth="1.5" rx="1" />
              <rect x="8" y="6" width="24" height="10" stroke="currentColor" strokeWidth="0.7" strokeDasharray="2,1.5" />
            </svg>
            Cube
          </div>
        </div>
      </div>

      {/* ── Component library (steps 1–3) ── */}
      {visibleComps.length > 0 && (
        <div style={{
          flex: isInPlacementMode ? '1 1 0' : '0 0 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 12px 0',
          borderBottom: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {/* Fixed header — never scrolls */}
          <div className="sb-label">Components</div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 8, fontStyle: 'italic', flexShrink: 0 }}>
            Click a component to see valid placement options
          </div>

          {/* Scrollable list (non-placement mode) or flex-fill column (placement mode) */}
          <div style={{
            flex: isInPlacementMode ? '1 1 0' : '0 0 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: isInPlacementMode ? 'hidden' : 'hidden',
            maxHeight: isInPlacementMode ? 'none' : 220,
            overflowY: isInPlacementMode ? 'hidden' : 'auto',
          }}>
            {visibleComps.map(c => {
              const maxCount  = getMaxCount(c.type)
              const placed    = placedComps.filter(p => p.type === c.type).length
              const isMaxed   = placed >= maxCount
              const isPending = pendingPlacementType === c.type

              return (
                <div key={c.type} style={isPending
                  ? { flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column' }
                  : { flexShrink: 0 }
                }>
                  {/* ── Component row ── */}
                  <div
                    className={`comp-item ${isPending ? 'comp-pending' : ''} ${isMaxed ? 'comp-maxed' : ''}`}
                    style={{ flexShrink: 0 }}
                    draggable={!isMaxed}
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', c.type)
                      e.dataTransfer.effectAllowed = 'copy'
                      onCompClick(c.type)
                    }}
                    onClick={() => !isMaxed && onCompClick(c.type)}
                    title={isMaxed ? `Max ${maxCount} allowed` : `Click to place · drag to canvas`}
                  >
                    <svg viewBox="-16 -16 32 32" width="22" height="22" fill="none" overflow="visible">
                      {COMP_SVG[c.type]}
                    </svg>
                    <span>{c.label}</span>
                    <span className={`comp-badge ${isPending ? 'badge-pending' : isMaxed ? 'badge-maxed' : ''}`}>
                      {isMaxed
                        ? `${placed}/${maxCount} max`
                        : isPending
                          ? 'Selecting…'
                          : `${placed}/${maxCount}`}
                    </span>
                  </div>

                  {/* ── Inline position cards ── */}
                  {isPending && (
                    <div style={{
                      flex: '1 1 0', minHeight: 0,
                      display: 'flex', flexDirection: 'column',
                      background: 'var(--bg)',
                      borderTop: '1px solid var(--border)',
                      overflow: 'hidden',
                    }}>
                      {/* Header */}
                      <div style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', padding: '8px 12px 7px',
                        background: '#fff', borderBottom: '1px solid var(--border)',
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.7px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                          Placement Slot
                          {validSlots.length > 0 && (
                            <span style={{ background: 'var(--orange)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>
                              {validSlots.length}
                            </span>
                          )}
                        </span>
                        <button
                          onClick={onCancelPlacement}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-2)', lineHeight: 1, padding: '0 2px', opacity: 0.45 }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0.45}
                        >✕</button>
                      </div>

                      {validSlots.length === 0 ? (
                        <p style={{ padding: '14px 12px', fontSize: 11, color: 'var(--text-2)', fontStyle: 'italic', margin: 0 }}>
                          No valid positions available.
                        </p>
                      ) : (
                        /* 2-col card grid — fills all remaining height, scrolls */
                        <div style={{
                          flex: '1 1 0', minHeight: 0,
                          overflowY: 'auto',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 8,
                          padding: '10px 10px 14px',
                          alignContent: 'start',
                        }}>
                          {validSlots.map((slot, idx) => {
                            const isHovered = hoveredSlotIdx === idx
                            // Split "Bottom Wall – Far Left" → ["Bottom Wall", "Far Left"]
                            const parts = slot.label.split(' – ')
                            const primary = parts[0] || slot.label
                            const secondary = parts[1] || ''
                            return (
                              <div
                                key={idx}
                                onMouseEnter={() => onSlotHover(idx)}
                                onMouseLeave={() => onSlotHover(null)}
                                onClick={() => onSlotPlace(slot)}
                                style={{
                                  display: 'flex', flexDirection: 'column', gap: 2,
                                  padding: '10px 12px',
                                  background: isHovered ? 'var(--orange-pale)' : '#fff',
                                  border: `1.5px solid ${isHovered ? 'var(--orange)' : 'var(--border)'}`,
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                  userSelect: 'none',
                                  transition: 'border-color 0.13s, background 0.13s',
                                  boxShadow: isHovered ? '0 2px 8px rgba(242,100,25,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                                }}
                              >
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
                                  {primary}
                                </span>
                                {secondary && (
                                  <span style={{ fontSize: 11, fontWeight: 400, color: isHovered ? 'var(--orange)' : 'var(--text-2)', lineHeight: 1.2 }}>
                                    {secondary}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 0 / 4 hint */}
      {visibleComps.length === 0 && STEP_HINTS[step] && (
        <div className="sb-step-hint" style={{ flex: 'none', padding: '10px 14px' }}>
          <p className="sb-hint-text" style={{ textAlign: 'left' }}>{STEP_HINTS[step]}</p>
        </div>
      )}

      {/* ── Properties panel ── */}
      <div className="sb-section" style={{ flex: isInPlacementMode ? 'none' : 1, overflowY: 'auto', borderBottom: 'none' }}>
        {selectedComp ? (
          <>
            <div className="sb-label">
              Properties — <span style={{ color: 'var(--orange)', textTransform: 'uppercase' }}>{selectedComp.type}</span>
            </div>
            <div className="prop-row">
              <span className="prop-label">Pos X</span>
              <input className="prop-input" type="number" value={Math.round(selectedComp.x)}
                onChange={e => onUpdateComp(selectedComp.id, { x: +e.target.value }, false)}
                onBlur={() => onUpdateComp(selectedComp.id, { x: selectedComp.x }, true)} />
            </div>
            <div className="prop-row">
              <span className="prop-label">Pos Y</span>
              <input className="prop-input" type="number" value={Math.round(selectedComp.y)}
                onChange={e => onUpdateComp(selectedComp.id, { y: +e.target.value }, false)}
                onBlur={() => onUpdateComp(selectedComp.id, { y: selectedComp.y }, true)} />
            </div>
            <div className="prop-row">
              <span className="prop-label">Height (Z)</span>
              <input className="prop-input" type="number" value={Math.round(selectedComp.z)}
                onChange={e => onUpdateComp(selectedComp.id, { z: +e.target.value }, false)}
                onBlur={() => onUpdateComp(selectedComp.id, { z: selectedComp.z }, true)} />
            </div>
            <div className="prop-row">
              <span className="prop-label">Width</span>
              <input className="prop-input" type="number" value={Math.round(selectedComp.w)}
                onChange={e => onUpdateComp(selectedComp.id, { w: +e.target.value }, false)}
                onBlur={() => onUpdateComp(selectedComp.id, { w: selectedComp.w }, true)} />
            </div>
            <div className="prop-row">
              <span className="prop-label">Length/H</span>
              <input className="prop-input" type="number" value={Math.round(selectedComp.h)}
                onChange={e => onUpdateComp(selectedComp.id, { h: +e.target.value }, false)}
                onBlur={() => onUpdateComp(selectedComp.id, { h: selectedComp.h }, true)} />
            </div>
            {selectedComp.type === 'door' && (
              <div className="prop-row">
                <span className="prop-label">Style</span>
                <select className="prop-input" value={selectedComp.style || 'Full Glass'}
                  onChange={e => onUpdateComp(selectedComp.id, { style: e.target.value }, true)}>
                  {DOOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
            {selectedComp.type === 'window' && (
              <div className="prop-row">
                <span className="prop-label">Style</span>
                <select className="prop-input" value={selectedComp.style || 'Clear Pane'}
                  onChange={e => onUpdateComp(selectedComp.id, { style: e.target.value }, true)}>
                  {WINDOW_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
            {selectedComp.type === 'bench' && (
              <div className="prop-row">
                <span className="prop-label">Style</span>
                <select className="prop-input" value={selectedComp.style || 'L-Shape'}
                  onChange={e => onUpdateComp(selectedComp.id, { style: e.target.value }, true)}>
                  {BENCH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
            {selectedComp.type === 'speaker' && (
              <div className="prop-row">
                <span className="prop-label">Type</span>
                <select className="prop-input" value={selectedComp.style || 'Wall Mount'}
                  onChange={e => onUpdateComp(selectedComp.id, { style: e.target.value }, true)}>
                  {SPEAKER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
            {selectedComp.type === 'controlunit' && (
              <div className="prop-row">
                <span className="prop-label">Type</span>
                <select className="prop-input" value={selectedComp.style || 'Digital'}
                  onChange={e => onUpdateComp(selectedComp.id, { style: e.target.value }, true)}>
                  {CONTROLUNIT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
            {selectedComp.type === 'thermometer' && (
              <div className="prop-row">
                <span className="prop-label">Type</span>
                <select className="prop-input" value={selectedComp.style || 'Digital'}
                  onChange={e => onUpdateComp(selectedComp.id, { style: e.target.value }, true)}>
                  {THERMOMETER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
            {selectedComp.type === 'timer' && (
              <div className="prop-row">
                <span className="prop-label">Type</span>
                <select className="prop-input" value={selectedComp.style || 'Digital'}
                  onChange={e => onUpdateComp(selectedComp.id, { style: e.target.value }, true)}>
                  {TIMER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
          </>
        ) : step === 0 ? (
          <>
            <div className="sb-label">Room Dimensions</div>
            {[
              { label: 'Length',         key: 'length' },
              { label: 'Width',          key: 'width' },
              { label: 'Height',         key: 'height' },
              { label: 'Wall Thickness', key: 'wall' },
            ].map(({ label, key }) => (
              <div className="prop-row" key={key}>
                <span className="prop-label">{label}</span>
                <input className="prop-input" type="number" value={dims[key]}
                  onChange={e => updateDim(key, e.target.value, false)}
                  onBlur={() => updateDim(key, dims[key], true)}
                  min="10" max="1000" />
                <span className="prop-unit">cm</span>
              </div>
            ))}
          </>
        ) : null}
      </div>

    </aside>
  )
}
