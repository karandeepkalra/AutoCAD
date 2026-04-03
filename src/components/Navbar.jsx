const STEPS = [
  {
    label: 'Room Layout',
    sub: 'Set dimensions',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="2" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1"/>
        <line x1="7" y1="7" x2="7" y2="18" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    label: 'Entry Points',
    sub: 'Doors & windows',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="5" y="2" width="10" height="16" rx="1" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="13" cy="10" r="1.2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'Interior',
    sub: 'Heaters & benches',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1"/>
        <line x1="6" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1"/>
        <line x1="6" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    label: 'Accessories',
    sub: 'Lights & vents',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <circle cx="10" cy="9" r="4" stroke="currentColor" strokeWidth="1.6"/>
        <line x1="10" y1="2" x2="10" y2="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="10" y1="14" x2="10" y2="16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="3" y1="9" x2="5" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="15" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Review',
    sub: 'Export design',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
        <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function Navbar({ step, onStepChange, onExportSVG, onExportDXF, onExportIFC, onView3D, viewMode }) {
  return (
    <nav className="navbar" onClick={e => e.stopPropagation()}>
<div className="nav-stepper">
        {STEPS.map((s, i) => {
          const done    = i < step
          const active  = i === step
          const locked  = i > step

          return (
            <div key={i} className="ns-step-wrap">
              {i > 0 && (
                <div className={`ns-line ${done || active ? 'ns-line-done' : ''}`} />
              )}
              <button
                className={`ns-step ${active ? 'ns-active' : ''} ${done ? 'ns-done' : ''} ${locked ? 'ns-locked' : ''}`}
                onClick={() => !locked && onStepChange(i)}
                disabled={locked}
                title={locked ? 'Complete previous steps first' : s.label}
              >
                <div className="ns-circle">
                  {done
                    ? <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : s.icon
                  }
                </div>
                <div className="ns-text">
                  <span className="ns-label">{s.label}</span>
                  <span className="ns-sub">{s.sub}</span>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      <div className="nav-spacer" />

      <div className="nav-step-nav">
        {step > 0 && (
          <button className="nav-btn" onClick={() => onStepChange(step - 1)}>
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button className="nav-btn nav-next" onClick={() => onStepChange(step + 1)}>
            Next
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        ) : (
          <>
            <button className="nav-export" onClick={onExportSVG} title="Download SVG">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              SVG
            </button>
            <button className="nav-export" onClick={onExportDXF} title="Download DXF">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              DXF
            </button>
            <button className="nav-export nav-ifc" onClick={onExportIFC} title="Download IFC BIM Data">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              IFC
            </button>
            <button className={`nav-export ${viewMode === '3d' ? 'nav-3d-active' : ''}`} onClick={onView3D} title="Toggle 3D BIM View">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" /><path d="M12 22V12" /><path d="M22 7l-10 5-10-5" /></svg>
              {viewMode === '3d' ? '2D' : '3D'}
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
