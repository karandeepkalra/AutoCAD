import { S } from '../constants.jsx'
import { DimH, DimV } from './DimAnnotations'

export default function BarrelTopView({ dims }) {
  const rx = (dims.length / 2) * S
  const ry = (dims.width / 2) * S
  const tw = dims.wall * S

  return (
    <g>
      {/* Outer wall */}
      <ellipse cx={0} cy={0} rx={rx} ry={ry} stroke="#1A1F2E" strokeWidth="2.5" fill="rgba(242,100,25,0.04)" />
      {/* Inner wall */}
      <ellipse cx={0} cy={0} rx={rx - tw} ry={ry - tw} stroke="#1A1F2E" strokeWidth="1" fill="rgba(255,255,255,0.75)" strokeDasharray="5,3" />
      {/* Dimensions */}
      <DimH x1={-rx} x2={rx} y={-ry - 40} label={`${dims.length} cm`} />
      <DimV y1={-ry} y2={ry} x={rx + 38} label={`${dims.width} cm`} />
    </g>
  )
}
