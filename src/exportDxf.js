const S = 1.25
const mm = (cm) => cm * 10

export function generateSaunaDXF(saunaType, dims, placedComps) {
  const lines = []
  const w = (s) => lines.push(s)

  w('0'); w('SECTION'); w('2'); w('HEADER')
  w('9'); w('$INSUNITS'); w('70'); w('4')
  w('0'); w('ENDSEC')

  w('0'); w('SECTION'); w('2'); w('TABLES')
  w('0'); w('TABLE'); w('2'); w('LAYER'); w('70'); w('6')
  ;[['WALLS',7],['HEATER',1],['BENCH',30],['DOOR',3],['WINDOW',5],['VENT',4],['LIGHT',2]].forEach(([n,c]) => {
    w('0'); w('LAYER'); w('2'); w(n); w('70'); w('0'); w('62'); w(String(c)); w('6'); w('CONTINUOUS')
  })
  w('0'); w('ENDTAB'); w('0'); w('ENDSEC')

  w('0'); w('SECTION'); w('2'); w('ENTITIES')

  const L = mm(dims.length), W = mm(dims.width), wallT = mm(dims.wall)

  function drawRect(layer, x1, y1, x2, y2) {
    const corners = [[x1,y1],[x2,y1],[x2,y2],[x1,y2]]
    for (let i = 0; i < 4; i++) {
      const [ax,ay] = corners[i], [bx,by] = corners[(i+1)%4]
      w('0');w('LINE');w('8');w(layer)
      w('10');w(ax.toFixed(4));w('20');w(ay.toFixed(4));w('30');w('0')
      w('11');w(bx.toFixed(4));w('21');w(by.toFixed(4));w('31');w('0')
    }
  }

  function drawRotatedRect(layer, cx, cy, rw, rh, deg) {
    const a = (deg||0)*Math.PI/180, cos=Math.cos(a), sin=Math.sin(a), hw=rw/2, hh=rh/2
    const corners = [[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(([lx,ly])=>[cx+lx*cos-ly*sin,cy+lx*sin+ly*cos])
    for (let i=0;i<4;i++) {
      const [ax,ay]=corners[i],[bx,by]=corners[(i+1)%4]
      w('0');w('LINE');w('8');w(layer)
      w('10');w(ax.toFixed(4));w('20');w(ay.toFixed(4));w('30');w('0')
      w('11');w(bx.toFixed(4));w('21');w(by.toFixed(4));w('31');w('0')
    }
  }

  drawRect('WALLS', -L/2, -W/2, L/2, W/2)
  drawRect('WALLS', -L/2+wallT, -W/2+wallT, L/2-wallT, W/2-wallT)

  placedComps.forEach(comp => {
    const cx = mm(comp.x/S), cy = mm(comp.y/S), cw = mm(comp.w||44), ch = mm(comp.h||40)
    const layer = {heater:'HEATER',bench:'BENCH',door:'DOOR',window:'WINDOW',vent:'VENT',light:'LIGHT'}[comp.type]||'WALLS'
    drawRotatedRect(layer, cx, cy, cw, ch, comp.rot||0)
    w('0');w('TEXT');w('8');w(layer);w('10');w(cx.toFixed(4));w('20');w(cy.toFixed(4));w('30');w('0')
    w('40');w('80');w('1');w(comp.type.toUpperCase());w('72');w('1');w('11');w(cx.toFixed(4));w('21');w(cy.toFixed(4));w('31');w('0')
  })

  w('0');w('ENDSEC');w('0');w('EOF')
  return lines.join('\r\n') + '\r\n'
}
