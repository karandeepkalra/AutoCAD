import { COMPONENTS, COMP_SVG, DOOR_OPTIONS, WINDOW_OPTIONS, BENCH_OPTIONS, SPEAKER_OPTIONS, CONTROLUNIT_OPTIONS, THERMOMETER_OPTIONS, TIMER_OPTIONS } from '../constants.jsx'

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

export default function Sidebar({ saunaType, onTypeSwitch, onCompDragStart, step, dims, onUpdateDims, selectedComp, onUpdateComp, onShowDashboard }) {
  const visibleTypes = STEP_TYPES[step] ?? []
  const visibleComps = COMPONENTS.filter(c => visibleTypes.includes(c.type))

  const updateDim = (key, val, commit = false) => {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) onUpdateDims({ ...dims, [key]: n }, commit)
  }

  return (
    <aside className="sidebar" onClick={e => e.stopPropagation()}>

      {/* Sauna type switcher */}
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

      {/* Component library (steps 1-3) */}
      {visibleComps.length > 0 && (
        <div className="sb-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="sb-label">Components</div>
          <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 8, fontStyle: 'italic' }}>Drag or click to place</div>
          <div className="comp-scroll" style={{ maxHeight: 160 }}>
            {visibleComps.map(c => (
              <div
                key={c.type}
                className="comp-item"
                draggable
                onDragStart={e => onCompDragStart(e, c.type)}
                onClick={() => onCompDragStart({ dataTransfer: { setData:()=>{} }, preventDefault:()=>{} }, c.type, true)}
              >
                <svg viewBox="-16 -16 32 32" width="22" height="22" fill="none" overflow="visible">
                  {COMP_SVG[c.type]}
                </svg>
                <span>{c.label}</span>
                <span className="comp-badge">Add</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 0 / 4 hint */}
      {visibleComps.length === 0 && STEP_HINTS[step] && (
        <div className="sb-step-hint" style={{ flex: 'none', padding: '10px 14px' }}>
          <p className="sb-hint-text" style={{ textAlign: 'left' }}>{STEP_HINTS[step]}</p>
        </div>
      )}

      {/* ── Properties ── */}
      <div className="sb-section" style={{ flex: 1, overflowY: 'auto', borderBottom: 'none' }}>
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

      {/* Senior Dev Mode Button */}
      <div className="sb-section" style={{ borderTop: '1px solid var(--border)', padding: '12px', marginTop: 'auto' }}>
        <button
          onClick={onShowDashboard}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)'
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
          </svg>
        Reseller Mode
        </button>
      </div>

    </aside>
  )
}
