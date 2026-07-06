const fs = require('fs');
const path = require('path');
const Geometry = require('../peri01Geometry.js');
require('../blocks/pulumurBlocks.js');
const DXF = require('../dxfEngine.js');

const samplePath = path.join(__dirname, '..', 'samples', 'sample-input.json');
const outPath = path.join(__dirname, '..', 'samples', 'pergo-rise-v5-dxf-fix-test.dxf');
const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
const drawing = Geometry.buildDrawing(sample);
const dxf = DXF.toDxf(drawing);
fs.writeFileSync(outPath, dxf, 'utf8');
console.log(`OK: ${drawing.entities.length} entity yazıldı.`);
console.log(outPath);
