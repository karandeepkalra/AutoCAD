export default function CompShape({ type, style, w = 44, h = 40, id, allComps = [] }) {
  const ora = "#F26419"
  const wood = "rgba(180,130,70,0.22)"
  const glass = "rgba(135,206,250,0.25)"

  const renderSlatRow = (rx, ry, rw, rh, selfX, selfY) => {
    const slatWidth = 6
    const gap = 3
    const step = slatWidth + gap
    const count = Math.max(1, Math.floor((rw - 4) / step))
    const startX = rx + (rw - (count * step - gap)) / 2
    const physicalItems = ['heater']

    return (
      <g>
        <rect x={rx} y={ry} width={rw} height={rh} rx="2" stroke="#6B5B45" strokeWidth="2" fill={wood} />
        {Array.from({ length: count }).map((_, i) => {
          const dx = startX + i * step + slatWidth/2
          const slatX = selfX + dx
          const slatY = selfY + ry + rh/2
          const halfSlatW = slatWidth / 2
          const halfSlatH = rh / 2

          const isColliding = allComps.some(other => {
            if (other.id === id || !physicalItems.includes(other.type)) return false
            const margin = 2
            const ow = (other.w || 44) / 2
            const oh = (other.h || 40) / 2
            const overX = Math.abs(slatX - other.x) < (halfSlatW + ow) + margin
            const overY = Math.abs(slatY - other.y) < (halfSlatH + oh) + margin
            return overX && overY
          })

          if (isColliding) return null
          return <rect key={i} x={dx - halfSlatW} y={ry + 4} width={slatWidth} height={rh - 8} rx="1" fill="#6B5B45" opacity="0.35" />
        })}
      </g>
    )
  }

  const self = allComps.find(c => c.id === id) || { x: 0, y: 0 }

  switch (type) {
    case 'heater':
      return (
        <g>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="4" stroke={ora} strokeWidth="2.5" fill="rgba(242,100,25,0.12)" />
          {[-8, -4, 0, 4, 8].map(dy => (
            <line key={dy} x1={-w/2+6} y1={dy} x2={w/2-6} y2={dy} stroke={ora} strokeWidth="1" strokeDasharray="1,1.5" />
          ))}
          <circle cx={w/2-10} cy={-h/2+10} r={4} stroke={ora} strokeWidth="1.2" fill="none" />
          <text x={0} y={h/2+12} fill={ora} fontSize="8" textAnchor="middle" fontFamily="'Segoe UI',sans-serif" fontWeight="900">HEATER</text>
        </g>
      )
    case 'bench':
      if (style === 'No Bench') return null

      if (style === 'L-Shape') {
        const sw = Math.min(w, h) * 0.8
        return (
          <g>
            {renderSlatRow(-w/2, -h/2, w, h, self.x, self.y)}
            {renderSlatRow(-w/2, h/2, sw, w*0.6, self.x, self.y)}
          </g>
        )
      }
      if (style === 'U-Shape') {
        const sw = Math.min(w, h) * 0.8
        return (
          <g>
            {renderSlatRow(-w/2, -h/2, w, h, self.x, self.y)}
            {renderSlatRow(-w/2, h/2, sw, w*0.5, self.x, self.y)}
            {renderSlatRow(w/2 - sw, h/2, sw, w*0.5, self.x, self.y)}
          </g>
        )
      }
      if (style === 'Double Row') {
        return (
          <g>
            {renderSlatRow(-w/2, -h/2, w, h*0.45, self.x, self.y)}
            {renderSlatRow(-w/2, h/2 - h*0.45, w, h*0.45, self.x, self.y)}
          </g>
        )
      }

      // Default: Single Row
      return renderSlatRow(-w/2, -h/2, w, h, self.x, self.y)

    case 'door':
      const leafW = w * 0.95
      return (
        <g>
          <rect x={-w/2} y={-leafW + 4} width={5} height={leafW} rx="1" fill={ora} opacity="0.8" />
          <rect x={-w/2} y={-4} width={w} height={8} fill={ora} opacity="0.12" />
          <rect x={-w/2} y={-4} width={w} height={8} stroke={ora} strokeWidth="1.5" fill="none" />
          <path d={`M ${-w/2+5} ${-leafW+4} A ${leafW} ${leafW} 0 0 1 ${w/2} 4`}
            stroke={ora} strokeWidth="1.2" fill="none" strokeDasharray="4,2" />
          <text x={0} y={18} fill={ora} fontSize="8" fontFamily="'Segoe UI',sans-serif" textAnchor="middle" fontWeight="900" opacity="0.8">DOOR</text>
        </g>
      )
    case 'window':
      const isFrosted = style === 'Frosted'
      return (
        <g>
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="1" stroke="#1A1F2E" strokeWidth="2" fill={isFrosted ? "rgba(135,206,250,0.6)" : glass} />
          {style === 'Divided Grid' && (
            <>
              <line x1={0} y1={-h/2} x2={0} y2={h/2} stroke="#1A1F2E" strokeWidth="1" />
              <line x1={-w/2} y1={0} x2={w/2} y2={0} stroke="#1A1F2E" strokeWidth="1" />
            </>
          )}
          {style === 'Horizontal Slats' && (
            <>
              {[-h/4, 0, h/4].map(dy => (
                <line key={dy} x1={-w/2} y1={dy} x2={w/2} y2={dy} stroke="#1A1F2E" strokeWidth="0.8" opacity="0.6" />
              ))}
            </>
          )}
          {(!style || style === 'Clear Pane') && (
            <>
              <line x1={0} y1={-h/2} x2={0} y2={h/2} stroke="#1A1F2E" strokeWidth="1" />
              <line x1={-w/2} y1={0} x2={w/2} y2={0} stroke="#1A1F2E" strokeWidth="0.8" />
            </>
          )}
        </g>
      )
    case 'vent':
      return (
        <g>
          <circle cx={0} cy={0} r={w/2} stroke="#1A1F2E" strokeWidth="2" fill="rgba(135,200,220,0.18)" />
          <line x1={-w/2} y1={0} x2={w/2} y2={0} stroke="#1A1F2E" strokeWidth="1.2" />
          <line x1={0} y1={-w/2} x2={0} y2={w/2} stroke="#1A1F2E" strokeWidth="1.2" />
        </g>
      )
    case 'light':
      return (
        <g>
          <circle cx={0} cy={0} r={12} stroke="#F5C542" strokeWidth="2" fill="rgba(245,197,66,0.16)" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
            <line key={a} x1={0} y1={0} x2={18} y2={0} transform={`rotate(${a})`} stroke="#F5C542" strokeWidth="1.5" strokeLinecap="round" />
          ))}
          <circle cx={0} cy={0} r={5} fill="#F5C542" />
        </g>
      )
    case 'speaker':
      return (
        <g>
          {/* Cabinet */}
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="3" stroke="#7C3AED" strokeWidth="2" fill="rgba(124,58,237,0.1)" />
          {/* Speaker cone — concentric circles */}
          <circle cx={0} cy={0} r={Math.min(w,h)*0.36} stroke="#7C3AED" strokeWidth="1.5" fill="rgba(124,58,237,0.18)" />
          <circle cx={0} cy={0} r={Math.min(w,h)*0.22} stroke="#7C3AED" strokeWidth="1.2" fill="rgba(124,58,237,0.25)" />
          <circle cx={0} cy={0} r={Math.min(w,h)*0.1}  fill="#7C3AED" />
          {/* Mounting screws at corners */}
          {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy],i) => (
            <circle key={i} cx={sx*(w/2-5)} cy={sy*(h/2-5)} r={2} stroke="#7C3AED" strokeWidth="1" fill="none" />
          ))}
          <text x={0} y={h/2+12} fill="#7C3AED" fontSize="7" textAnchor="middle" fontFamily="'Segoe UI',sans-serif" fontWeight="700">SPEAKER</text>
        </g>
      )
    case 'controlunit': {
      const dh = h * 0.32   // display height
      const bw = (w - 16) / 3  // button width
      return (
        <g>
          {/* Panel body */}
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="3" stroke="#0EA5E9" strokeWidth="2" fill="rgba(14,165,233,0.1)" />
          {/* Display screen */}
          <rect x={-w/2+5} y={-h/2+5} width={w-10} height={dh} rx="2" stroke="#0EA5E9" strokeWidth="1.2" fill="rgba(14,165,233,0.25)" />
          {/* Screen scan lines */}
          {[0,1,2].map(i => (
            <line key={i} x1={-w/2+8} y1={-h/2+10+i*5} x2={w/2-8} y2={-h/2+10+i*5} stroke="#0EA5E9" strokeWidth="0.6" opacity="0.6" />
          ))}
          {/* Three round buttons */}
          {[0,1,2].map(i => (
            <circle key={i} cx={-w/2 + 8 + i*(bw+4) + bw/2} cy={h/2 - 10} r={bw*0.4} stroke="#0EA5E9" strokeWidth="1.2"
              fill={i === 0 ? "rgba(14,165,233,0.4)" : "none"} />
          ))}
          {/* Rotary knob */}
          <circle cx={w/2-9} cy={-h/2+5+dh/2} r={5} stroke="#0EA5E9" strokeWidth="1.2" fill="none" />
          <line x1={w/2-9} y1={-h/2+5+dh/2-5} x2={w/2-9} y2={-h/2+5+dh/2-2} stroke="#0EA5E9" strokeWidth="1.2" />
          <text x={0} y={h/2+12} fill="#0EA5E9" fontSize="7" textAnchor="middle" fontFamily="'Segoe UI',sans-serif" fontWeight="700">CTRL UNIT</text>
        </g>
      )
    }
    case 'thermometer': {
      const tubeH = h * 0.6
      const bulbR = Math.min(w, h) * 0.18
      const tubeW = 5
      const fillH = tubeH * 0.55   // mercury fill level
      return (
        <g>
          {/* Outer housing/background */}
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="3" stroke="#EF4444" strokeWidth="1.5" fill="rgba(239,68,68,0.07)" />
          {/* Tube outline */}
          <rect x={-tubeW/2} y={-h/2+6} width={tubeW} height={tubeH} rx={tubeW/2} stroke="#EF4444" strokeWidth="1.2" fill="rgba(255,255,255,0.3)" />
          {/* Mercury fill */}
          <rect x={-tubeW/2+1} y={-h/2+6 + (tubeH - fillH - 1)} width={tubeW-2} height={fillH} rx={(tubeW-2)/2} fill="#EF4444" opacity="0.8" />
          {/* Bulb */}
          <circle cx={0} cy={-h/2+6+tubeH+bulbR*0.6} r={bulbR} stroke="#EF4444" strokeWidth="1.2" fill="rgba(239,68,68,0.5)" />
          {/* Tick marks */}
          {[0.2,0.4,0.6,0.8].map((t,i) => (
            <line key={i} x1={tubeW/2+1} y1={-h/2+6 + tubeH*t} x2={tubeW/2+5} y2={-h/2+6 + tubeH*t} stroke="#EF4444" strokeWidth="0.8" />
          ))}
          <text x={0} y={h/2+12} fill="#EF4444" fontSize="7" textAnchor="middle" fontFamily="'Segoe UI',sans-serif" fontWeight="700">THERMO</text>
        </g>
      )
    }
    case 'timer': {
      const r = Math.min(w,h) * 0.38
      return (
        <g>
          {/* Background */}
          <rect x={-w/2} y={-h/2} width={w} height={h} rx="3" stroke="#10B981" strokeWidth="1.5" fill="rgba(16,185,129,0.07)" />
          {/* Clock face */}
          <circle cx={0} cy={2} r={r} stroke="#10B981" strokeWidth="2" fill="rgba(16,185,129,0.12)" />
          {/* Hour markers */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
            const rad = (a - 90) * Math.PI / 180
            const inner = a % 90 === 0 ? r - 5 : r - 3
            return (
              <line key={a}
                x1={Math.cos(rad)*inner} y1={2+Math.sin(rad)*inner}
                x2={Math.cos(rad)*(r-1)} y2={2+Math.sin(rad)*(r-1)}
                stroke="#10B981" strokeWidth={a % 90 === 0 ? 1.5 : 0.8} />
            )
          })}
          {/* Minute hand */}
          <line x1={0} y1={2} x2={0} y2={2-r*0.7} stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
          {/* Hour hand */}
          <line x1={0} y1={2} x2={r*0.45} y2={2+r*0.25} stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
          {/* Center dot */}
          <circle cx={0} cy={2} r={2.5} fill="#10B981" />
          {/* Crown at top */}
          <rect x={-4} y={-h/2+1} width={8} height={4} rx="1" stroke="#10B981" strokeWidth="1" fill="rgba(16,185,129,0.3)" />
          <text x={0} y={h/2+12} fill="#10B981" fontSize="7" textAnchor="middle" fontFamily="'Segoe UI',sans-serif" fontWeight="700">TIMER</text>
        </g>
      )
    }
    default:
      return <circle r={10} fill="#ccc" />
  }
}
