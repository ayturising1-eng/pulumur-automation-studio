const fs = require('fs');
const path = require('path');
const geom = require('../peri01Geometry.js');
const dxf = require('../dxfEngine.js');
const input = Object.assign({}, geom.SAMPLE_INPUT, {
  customer: 'DENEME',
  project: 'DENEME',
  date: '06.07.2026',
  width: 4000,
  opening: 4500,
  rearHeight: 3200,
  frontHeight: 2600,
  rayCount: 2,
  postCount: 2,
});
const drawing = geom.buildDrawing(input);
const text = dxf.toDxf(drawing);
const out = path.join(__dirname, '..', 'samples', 'pergo-rise-v6-clean-r12-test.dxf');
fs.writeFileSync(out, text, 'utf8');
console.log(out);
console.log('entities', drawing.entities.length, 'bytes', Buffer.byteLength(text));
