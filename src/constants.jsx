// ─── Scale: 1 cm = 1.25 px in canvas world-space ───────────────
export const S = 1.25

// ─── Unique ID generator ────────────────────────────────────────
let _uid = Date.now()
export const uid = () => ++_uid

// ─── Component Library ───────────────────────────────────────────
export const COMPONENTS = [
  { type: 'heater',       label: 'Heater',       count: '1×' },
  { type: 'bench',        label: 'Bench',        count: '2×' },
  { type: 'door',         label: 'Door',         count: '1×' },
  { type: 'window',       label: 'Window',       count: '2×' },
  { type: 'vent',         label: 'Vent',         count: '2×' },
  { type: 'light',        label: 'Light',        count: '3×' },
  { type: 'speaker',      label: 'Speaker',      count: '2×' },
  { type: 'controlunit',  label: 'Control Unit', count: '1×' },
  { type: 'thermometer',  label: 'Thermometer',  count: '1×' },
  { type: 'timer',        label: 'Timer',        count: '1×' },
]

export const COMP_SVG = {
  heater:  <><rect x="-14" y="-14" width="28" height="28" rx="4" stroke="#F26419" strokeWidth="2" fill="rgba(242,100,25,0.15)"/><line x1="-8" y1="-5" x2="8" y2="-5" stroke="#F26419" strokeWidth="1"/><line x1="-8" y1="0" x2="8" y2="0" stroke="#F26419" strokeWidth="1"/><line x1="-8" y1="5" x2="8" y2="5" stroke="#F26419" strokeWidth="1"/><circle cx="8" cy="-8" r="3" stroke="#F26419" strokeWidth="0.8" fill="none"/></>,
  bench:   <><rect x="-14" y="-7" width="28" height="14" rx="1" stroke="#6B5B45" strokeWidth="2" fill="rgba(180,130,70,0.25)"/><line x1="-10" y1="-7" x2="-10" y2="7" stroke="#6B5B45" strokeWidth="0.8"/><line x1="-4" y1="-7" x2="-4" y2="7" stroke="#6B5B45" strokeWidth="0.8"/><line x1="2" y1="-7" x2="2" y2="7" stroke="#6B5B45" strokeWidth="0.8"/><line x1="8" y1="-7" x2="8" y2="7" stroke="#6B5B45" strokeWidth="0.8"/></>,
  door:    <><rect x="-9" y="-14" width="18" height="28" rx="1" stroke="#F26419" strokeWidth="1.5" fill="rgba(242,100,25,0.1)"/><circle cx="6" cy="0" r="2" fill="#F26419"/></>,
  window:  <><rect x="-13" y="-10" width="26" height="20" rx="1" stroke="#1A1F2E" strokeWidth="1.2" fill="rgba(135,206,250,0.2)"/><line x1="0" y1="-10" x2="0" y2="10" stroke="#1A1F2E" strokeWidth="0.8"/><line x1="-13" y1="0" x2="13" y2="0" stroke="#1A1F2E" strokeWidth="0.8"/></>,
  vent:         <><circle cx="0" cy="0" r="10" stroke="#1A1F2E" strokeWidth="1.2" fill="rgba(135,200,220,0.15)"/><line x1="-6" y1="0" x2="6" y2="0" stroke="#1A1F2E" strokeWidth="1"/><line x1="0" y1="-6" x2="0" y2="6" stroke="#1A1F2E" strokeWidth="1"/><circle cx="0" cy="0" r="2" stroke="#1A1F2E" strokeWidth="0.8" fill="none"/></>,
  light:        <><circle cx="0" cy="-2" r="8" stroke="#F5C542" strokeWidth="1.3" fill="rgba(245,197,66,0.15)"/><line x1="-10" y1="-2" x2="-6" y2="-2" stroke="#F5C542" strokeWidth="1"/><line x1="6" y1="-2" x2="10" y2="-2" stroke="#F5C542" strokeWidth="1"/><line x1="0" y1="-12" x2="0" y2="-8" stroke="#F5C542" strokeWidth="1"/></>,
  speaker:      <><rect x="-11" y="-13" width="22" height="26" rx="2" stroke="#7C3AED" strokeWidth="1.4" fill="rgba(124,58,237,0.1)"/><circle cx="0" cy="1" r="7" stroke="#7C3AED" strokeWidth="1.1" fill="rgba(124,58,237,0.18)"/><circle cx="0" cy="1" r="3.5" stroke="#7C3AED" strokeWidth="0.9" fill="rgba(124,58,237,0.3)"/><circle cx="0" cy="1" r="1.2" fill="#7C3AED"/><circle cx="-8" cy="-10" r="1.5" stroke="#7C3AED" strokeWidth="0.7" fill="none"/><circle cx="8" cy="-10" r="1.5" stroke="#7C3AED" strokeWidth="0.7" fill="none"/></>,
  controlunit:  <><rect x="-12" y="-12" width="24" height="24" rx="2" stroke="#0EA5E9" strokeWidth="1.4" fill="rgba(14,165,233,0.1)"/><rect x="-9" y="-9" width="18" height="8" rx="1" stroke="#0EA5E9" strokeWidth="0.9" fill="rgba(14,165,233,0.22)"/><line x1="-7" y1="-6" x2="4" y2="-6" stroke="#0EA5E9" strokeWidth="0.7" opacity="0.7"/><line x1="-7" y1="-3" x2="1" y2="-3" stroke="#0EA5E9" strokeWidth="0.7" opacity="0.7"/><circle cx="-5" cy="5" r="3" stroke="#0EA5E9" strokeWidth="1" fill="none"/><line x1="-5" y1="2" x2="-5" y2="4" stroke="#0EA5E9" strokeWidth="0.9"/><circle cx="5" cy="5" r="2" stroke="#0EA5E9" strokeWidth="0.9" fill="rgba(14,165,233,0.4)"/><circle cx="10" cy="5" r="2" stroke="#0EA5E9" strokeWidth="0.9" fill="none"/></>,
  thermometer:  <><rect x="-2.5" y="-13" width="5" height="17" rx="2.5" stroke="#EF4444" strokeWidth="1.1" fill="rgba(255,255,255,0.25)"/><rect x="-1" y="-6" width="2" height="9" rx="1" fill="#EF4444" opacity="0.85"/><circle cx="0" cy="8" r="5" stroke="#EF4444" strokeWidth="1.3" fill="rgba(239,68,68,0.45)"/><line x1="3" y1="-9" x2="7" y2="-9" stroke="#EF4444" strokeWidth="0.9"/><line x1="3" y1="-5" x2="6" y2="-5" stroke="#EF4444" strokeWidth="0.9"/><line x1="3" y1="-1" x2="7" y2="-1" stroke="#EF4444" strokeWidth="0.9"/></>,
  timer:        <><rect x="-4" y="-14" width="8" height="4" rx="1" stroke="#10B981" strokeWidth="1.1" fill="rgba(16,185,129,0.25)"/><circle cx="0" cy="2" r="11" stroke="#10B981" strokeWidth="1.5" fill="rgba(16,185,129,0.1)"/><line x1="0" y1="2" x2="0" y2="-6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round"/><line x1="0" y1="2" x2="5" y2="6" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round"/><circle cx="0" cy="2" r="2" fill="#10B981"/><line x1="-11" y1="2" x2="-8" y2="2" stroke="#10B981" strokeWidth="1"/><line x1="8" y1="2" x2="11" y2="2" stroke="#10B981" strokeWidth="1"/><line x1="0" y1="-11" x2="0" y2="-8" stroke="#10B981" strokeWidth="1"/></>,
}

// ─── Properties Panel Options ───────────────────────────────────
export const DOOR_OPTIONS        = ['Full Glass','Half Glass','Frosted','Solid Wood']
export const WINDOW_OPTIONS      = ['Clear Pane', 'Frosted', 'Divided Grid', 'Horizontal Slats']
export const BENCH_OPTIONS       = ['L-Shape','U-Shape','Single Row','Double Row','No Bench']
export const SPEAKER_OPTIONS     = ['Wall Mount','Ceiling Mount','Waterproof','Bluetooth']
export const CONTROLUNIT_OPTIONS = ['Digital','Analog','Smart/WiFi','Basic']
export const THERMOMETER_OPTIONS = ['Digital','Analog','Infrared','Hygrometer Combo']
export const TIMER_OPTIONS       = ['Digital','Mechanical','Smart/App','Countdown']
