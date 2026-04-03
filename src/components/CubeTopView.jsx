import { S } from '../constants.jsx'
import { DimH, DimV } from './DimAnnotations'

export default function CubeTopView({ dims }) {
  const W = dims.length * S
  const H = dims.width * S
  const tw = dims.wall * S
  const hw = W / 2, hh = H / 2

  return (
    <g>
      {/* Outer walls */}
      <rect x={-hw} y={-hh} width={W} height={H} stroke="#1A1F2E" strokeWidth="2.8" fill="rgba(242,100,25,0.03)" />
      {/* Inner cavity */}
      <rect x={-hw + tw} y={-hh + tw} width={W - tw * 2} height={H - tw * 2} stroke="#1A1F2E" strokeWidth="0.9" fill="rgba(255,255,255,0.8)" strokeDasharray="5,3" />
      {/* Wall thickness callout */}
      <DimV y1={-hh} y2={-hh + tw} x={-hw - 36} label={`${dims.wall} cm`} />
      <DimH x1={-hw} x2={hw} y={-hh - 40} label={`${dims.length} cm`} />
      <DimV y1={-hh} y2={hh} x={hw + 36} label={`${dims.width} cm`} />
    </g>
  )
}
