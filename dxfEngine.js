(function (root) {
  'use strict';

  const COLOR = {
    OUTLINE: 7,
    PROFILE: 1,
    FABRIC: 42,
    RAY: 5,
    POST: 6,
    WALL: 8,
    TOPWALL: 8,
    GLASS: 4,
    WATER: 5,
    DIM: 1,
    TEXT: 7,
    TABLE: 7,
    TITLE: 7,
    BLOCKREF: 8
  };

  function cleanText(value) {
    return String(value ?? '')
      .replace(/\r\n/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function pair(code, value) {
    return `${code}\n${value}`;
  }

  function fixed(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return Number(n.toFixed(4)).toString();
  }

  function layerColor(layer) {
    return COLOR[layer] ?? 7;
  }

  function headerSection() {
    return [
      pair(0, 'SECTION'), pair(2, 'HEADER'),
      pair(9, '$ACADVER'), pair(1, 'AC1009'),
      pair(9, '$INSBASE'), pair(10, 0), pair(20, 0), pair(30, 0),
      pair(9, '$EXTMIN'), pair(10, -10000), pair(20, -20000), pair(30, 0),
      pair(9, '$EXTMAX'), pair(10, 12000), pair(20, 6000), pair(30, 0),
      pair(9, '$LIMMIN'), pair(10, -10000), pair(20, -20000),
      pair(9, '$LIMMAX'), pair(10, 12000), pair(20, 6000),
      pair(0, 'ENDSEC')
    ];
  }

  function ltypeTable() {
    return [
      pair(0, 'TABLE'), pair(2, 'LTYPE'), pair(70, 1),
      pair(0, 'LTYPE'), pair(2, 'CONTINUOUS'), pair(70, 64), pair(3, 'Solid line'), pair(72, 65), pair(73, 0), pair(40, 0),
      pair(0, 'ENDTAB')
    ];
  }

  function layerTable(layers) {
    const out = [pair(0, 'TABLE'), pair(2, 'LAYER'), pair(70, layers.length + 1)];
    out.push(pair(0, 'LAYER'), pair(2, '0'), pair(70, 64), pair(62, 7), pair(6, 'CONTINUOUS'));
    layers.forEach(layer => {
      out.push(pair(0, 'LAYER'), pair(2, cleanText(layer) || '0'), pair(70, 64), pair(62, layerColor(layer)), pair(6, 'CONTINUOUS'));
    });
    out.push(pair(0, 'ENDTAB'));
    return out;
  }

  function styleTable() {
    return [
      pair(0, 'TABLE'), pair(2, 'STYLE'), pair(70, 1),
      pair(0, 'STYLE'), pair(2, 'STANDARD'), pair(70, 64), pair(40, 0), pair(41, 1), pair(50, 0), pair(71, 0), pair(42, 2.5), pair(3, ''), pair(4, ''),
      pair(0, 'ENDTAB')
    ];
  }

  function tablesSection(layers) {
    return [pair(0, 'SECTION'), pair(2, 'TABLES'), ...ltypeTable(), ...layerTable(layers), ...styleTable(), pair(0, 'ENDSEC')];
  }

  function blocksSection() {
    return [pair(0, 'SECTION'), pair(2, 'BLOCKS'), pair(0, 'ENDSEC')];
  }

  function lineEntity(e) {
    return [
      pair(0, 'LINE'),
      pair(8, cleanText(e.layer || 'OUTLINE')),
      pair(62, layerColor(e.layer)),
      pair(10, fixed(e.x1)), pair(20, fixed(e.y1)), pair(30, 0),
      pair(11, fixed(e.x2)), pair(21, fixed(e.y2)), pair(31, 0)
    ];
  }

  function polyEntity(e) {
    const out = [
      pair(0, 'POLYLINE'),
      pair(8, cleanText(e.layer || 'OUTLINE')),
      pair(62, layerColor(e.layer)),
      pair(66, 1),
      pair(10, 0), pair(20, 0), pair(30, 0),
      pair(70, e.closed ? 1 : 0)
    ];
    e.points.forEach(p => {
      out.push(
        pair(0, 'VERTEX'),
        pair(8, cleanText(e.layer || 'OUTLINE')),
        pair(62, layerColor(e.layer)),
        pair(10, fixed(p[0])), pair(20, fixed(p[1])), pair(30, 0),
        pair(70, 0)
      );
    });
    out.push(pair(0, 'SEQEND'));
    return out;
  }

  function textEntity(e) {
    const alignCode = e.align === 'center' ? 1 : (e.align === 'right' ? 2 : 0);
    const out = [
      pair(0, 'TEXT'),
      pair(8, cleanText(e.layer || 'TEXT')),
      pair(62, layerColor(e.layer)),
      pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0),
      pair(40, fixed(e.height || 80)),
      pair(1, cleanText(e.value)),
      pair(50, fixed(e.rotation || 0)),
      pair(7, 'STANDARD')
    ];
    if (alignCode) {
      out.push(pair(72, alignCode), pair(73, 2), pair(11, fixed(e.x)), pair(21, fixed(e.y)), pair(31, 0));
    }
    return out;
  }

  function rotatePoint(px, py, bx, by, deg) {
    const a = (Number(deg) || 0) * Math.PI / 180;
    const dx = px - bx;
    const dy = py - by;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    return [bx + dx * ca - dy * sa, by + dx * sa + dy * ca];
  }

  function insertAsSafePreview(e) {
    // V6: DraftSight kurtarma hatasını tamamen kesmek için gerçek INSERT/BLOCK yazmıyoruz.
    // Blok yerini temiz R12 LINE/POLYLINE/TEXT ile gösteriyoruz.
    const w = Math.max(20, Math.abs(e.previewW || 120) * Math.abs(e.scaleX || 1));
    const h = Math.max(20, Math.abs(e.previewH || 80) * Math.abs(e.scaleY || 1));
    const x = Number(e.x) || 0;
    const y = Number(e.y) || 0;
    const layer = e.layer || 'BLOCKREF';
    const rot = Number(e.rotation) || 0;
    const raw = [
      [x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]
    ].map(p => rotatePoint(p[0], p[1], x, y, rot));
    const out = [];
    out.push(...polyEntity({ layer, closed: true, points: raw }));
    const p1 = rotatePoint(x - w / 2, y, x, y, rot);
    const p2 = rotatePoint(x + w / 2, y, x, y, rot);
    const p3 = rotatePoint(x, y - h / 2, x, y, rot);
    const p4 = rotatePoint(x, y + h / 2, x, y, rot);
    out.push(...lineEntity({ layer, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] }));
    out.push(...lineEntity({ layer, x1: p3[0], y1: p3[1], x2: p4[0], y2: p4[1] }));
    // Küçük blok etiketi, çok büyük görünmesin.
    out.push(...textEntity({ layer, x, y: y - h / 2 - 32, height: 28, value: cleanText(e.name || 'BLOCK'), align: 'center', rotation: rot }));
    return out;
  }

  function toDxf(drawing) {
    const layers = drawing.layers && drawing.layers.length ? drawing.layers : ['OUTLINE', 'TEXT'];
    const out = [];
    out.push(...headerSection());
    out.push(...tablesSection(layers));
    out.push(...blocksSection());
    out.push(pair(0, 'SECTION'), pair(2, 'ENTITIES'));
    drawing.entities.forEach(e => {
      if (e.type === 'line') out.push(...lineEntity(e));
      else if (e.type === 'polyline') out.push(...polyEntity(e));
      else if (e.type === 'text') out.push(...textEntity(e));
      else if (e.type === 'insert') out.push(...insertAsSafePreview(e));
    });
    out.push(pair(0, 'ENDSEC'));
    out.push(pair(0, 'EOF'));
    return out.join('\r\n') + '\r\n';
  }

  function safeFileName(value) {
    return cleanText(value)
      .toLocaleLowerCase('tr-TR')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'pergo-rise';
  }

  const api = { toDxf, safeFileName };
  root.PulumurDXF = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
