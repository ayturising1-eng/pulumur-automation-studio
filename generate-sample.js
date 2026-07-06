const fs = require('fs');
const path = require('path');
require('../blocks/filteredBlocks.js');
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
const out = path.join(__dirname, '..', 'samples', 'pergo-rise-v6_4-block-definitions-test.dxf');
fs.writeFileSync(out, text, 'utf8');
const blockCount = Object.keys(drawing.blocks || {}).length;
console.log(out);
console.log('entities', drawing.entities.length, 'blocks', blockCount, 'bytes', Buffer.byteLength(text));
