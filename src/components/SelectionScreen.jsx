export default function SelectionScreen({ selected, onSelect, onLaunch }) {
  return (
    <div className="sel-screen">
      <div className="sel-header">
        {/* <div className="sel-logo">
          <svg viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#F26419" />
            <path d="M8 26L18 10L28 26Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
            <circle cx="18" cy="18" r="4" fill="white" opacity="0.9" />
          </svg>
          <span className="sel-logo-text">Ikarus <b>CAD</b></span>
        </div> */}
        <h1>Choose Your Sauna Style</h1>
        <p>Select a template to begin designing your custom sauna</p>
      </div>

      <div className="sel-cards">
        {/* Barrel Card */}
        <div className={`sel-card ${selected === 'barrel' ? 'sel-active' : ''}`} onClick={() => onSelect('barrel')}>
          <span className="sel-badge">Selected</span>
          <svg className="sel-card-sketch" viewBox="0 0 260 160" fill="none">
            <defs><pattern id="sg1" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0L0 0 0 20" fill="none" stroke="#E8ECF0" strokeWidth="0.5" /></pattern></defs>
            <rect width="260" height="160" fill="#FAFBFC" rx="6" />
            <rect width="260" height="160" fill="url(#sg1)" rx="6" />
            <ellipse cx="130" cy="78" rx="88" ry="54" stroke="#1A1F2E" strokeWidth="1.5" fill="rgba(242,100,25,0.05)" />
            <ellipse cx="130" cy="78" rx="70" ry="38" stroke="#1A1F2E" strokeWidth="0.7" fill="none" strokeDasharray="4,3" />
            {[82, 104, 130, 156, 178].map(x => {
              const yOff = 54 * Math.sqrt(Math.max(0, 1 - ((x - 130) / 88) ** 2))
              return <line key={x} x1={x} y1={78 - yOff} x2={x} y2={78 + yOff} stroke="#1A1F2E" strokeWidth="0.7" strokeDasharray="3,2" opacity="0.4" />
            })}
            <path d="M108 122 A30 30 0 0 1 152 122" stroke="#F26419" strokeWidth="1.5" fill="rgba(242,100,25,0.1)" />
            <line x1="50" y1="90" x2="210" y2="90" stroke="#6B5B45" strokeWidth="1.2" strokeDasharray="5,3" />
            <text x="130" y="152" fill="#F26419" fontSize="9" fontFamily="'Segoe UI',sans-serif" textAnchor="middle" fontWeight="700">Ø 200 cm</text>
            <line x1="42" y1="78" x2="218" y2="78" stroke="#F26419" strokeWidth="0.6" strokeDasharray="3,4" opacity="0.5" />
            <text x="130" y="12" fill="#F26419" fontSize="8" fontFamily="'Segoe UI',sans-serif" textAnchor="middle" fontWeight="600">240 cm</text>
          </svg>
          <h3>Barrel Sauna</h3>
          <p>Classic curved form with optimal heat circulation. Ideal for outdoor installations.</p>
        </div>

        {/* Cube Card */}
        <div className={`sel-card ${selected === 'cube' ? 'sel-active' : ''}`} onClick={() => onSelect('cube')}>
          <span className="sel-badge">Selected</span>
          <svg className="sel-card-sketch" viewBox="0 0 260 160" fill="none">
            <defs><pattern id="sg2" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0L0 0 0 20" fill="none" stroke="#E8ECF0" strokeWidth="0.5" /></pattern></defs>
            <rect width="260" height="160" fill="#FAFBFC" rx="6" />
            <rect width="260" height="160" fill="url(#sg2)" rx="6" />
            <rect x="28" y="22" width="204" height="118" stroke="#1A1F2E" strokeWidth="1.8" fill="rgba(242,100,25,0.04)" rx="1" />
            <rect x="40" y="34" width="180" height="94" stroke="#1A1F2E" strokeWidth="0.8" fill="none" strokeDasharray="4,2" />
            <rect x="108" y="100" width="44" height="40" stroke="#F26419" strokeWidth="1.5" fill="rgba(242,100,25,0.1)" />
            <rect x="48" y="44" width="36" height="26" stroke="#1A1F2E" strokeWidth="1" fill="rgba(135,206,250,0.15)" />
            <line x1="66" y1="44" x2="66" y2="70" stroke="#1A1F2E" strokeWidth="0.7" />
            <rect x="44" y="70" width="155" height="14" stroke="#6B5B45" strokeWidth="1" fill="rgba(180,130,70,0.14)" />
            <text x="130" y="12" fill="#F26419" fontSize="9" fontFamily="'Segoe UI',sans-serif" textAnchor="middle" fontWeight="700">240 cm</text>
            <text x="252" y="83" fill="#F26419" fontSize="8" fontFamily="'Segoe UI',sans-serif" fontWeight="600">220</text>
          </svg>
          <h3>Cube Sauna</h3>
          <p>Modern rectangular design with clean lines. Perfect for indoor and outdoor use.</p>
        </div>
      </div>

      <button className="sel-cta" onClick={onLaunch} disabled={!selected}>
        Open in CAD Editor →
      </button>
    </div>
  )
}
