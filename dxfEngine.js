(function (root) {
  'use strict';

  const COLOR = {
    OUTLINE: 7,
    PROFILE: 1,
    FABRIC: 42,
    RAY: 5,
    POST: 6,
    WALL: 8,
    TOPWALL: 19,
    GLASS: 6,
    WATER: 160,
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
      .replace(/\s+/g, ' ')
      .trim();
  }

  function pair(code, value) {
    return `${code}\n${value}`;
  }

  function fixed(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return Number(n.toFixed(6)).toString();
  }

  function layerColor(layer) {
    return COLOR[layer] ?? 7;
  }

  function layerTable(layers) {
    const out = [];
    out.push(pair(0, 'TABLE'));
    out.push(pair(2, 'LTYPE'));
    out.push(pair(70, 1));
    out.push(pair(0, 'LTYPE'));
    out.push(pair(2, 'CONTINUOUS'));
    out.push(pair(70, 0));
    out.push(pair(3, 'Solid line'));
    out.push(pair(72, 65));
    out.push(pair(73, 0));
    out.push(pair(40, 0));
    out.push(pair(0, 'ENDTAB'));

    out.push(pair(0, 'TABLE'));
    out.push(pair(2, 'LAYER'));
    out.push(pair(70, layers.length + 1));
    out.push(pair(0, 'LAYER'));
    out.push(pair(2, '0'));
    out.push(pair(70, 0));
    out.push(pair(62, 7));
    out.push(pair(6, 'CONTINUOUS'));
    layers.forEach(layer => {
      out.push(pair(0, 'LAYER'));
      out.push(pair(2, layer));
      out.push(pair(70, 0));
      out.push(pair(62, layerColor(layer)));
      out.push(pair(6, 'CONTINUOUS'));
    });
    out.push(pair(0, 'ENDTAB'));

    out.push(pair(0, 'TABLE'));
    out.push(pair(2, 'STYLE'));
    out.push(pair(70, 1));
    out.push(pair(0, 'STYLE'));
    out.push(pair(2, 'STANDARD'));
    out.push(pair(70, 0));
    out.push(pair(40, 0));
    out.push(pair(41, 1));
    out.push(pair(50, 0));
    out.push(pair(71, 0));
    out.push(pair(42, 2.5));
    out.push(pair(3, 'arial.ttf'));
    out.push(pair(4, ''));
    out.push(pair(0, 'ENDTAB'));
    return out;
  }

  function lineEntity(e) {
    return [
      pair(0, 'LINE'),
      pair(8, e.layer || 'OUTLINE'),
      pair(62, layerColor(e.layer)),
      pair(10, fixed(e.x1)), pair(20, fixed(e.y1)), pair(30, 0),
      pair(11, fixed(e.x2)), pair(21, fixed(e.y2)), pair(31, 0)
    ];
  }

  function polyEntity(e) {
    const out = [];
    out.push(pair(0, 'LWPOLYLINE'));
    out.push(pair(8, e.layer || 'OUTLINE'));
    out.push(pair(62, layerColor(e.layer)));
    out.push(pair(90, e.points.length));
    out.push(pair(70, e.closed ? 1 : 0));
    e.points.forEach(p => {
      out.push(pair(10, fixed(p[0])));
      out.push(pair(20, fixed(p[1])));
    });
    return out;
  }

  function textEntity(e) {
    const alignCode = e.align === 'center' ? 1 : (e.align === 'right' ? 2 : 0);
    const out = [
      pair(0, 'TEXT'),
      pair(8, e.layer || 'TEXT'),
      pair(62, layerColor(e.layer)),
      pair(10, fixed(e.x)),
      pair(20, fixed(e.y)),
      pair(30, 0),
      pair(40, fixed(e.height || 80)),
      pair(1, cleanText(e.value)),
      pair(50, fixed(e.rotation || 0)),
      pair(7, 'STANDARD')
    ];
    if (alignCode) {
      out.push(pair(72, alignCode));
      out.push(pair(73, 2));
      out.push(pair(11, fixed(e.x)));
      out.push(pair(21, fixed(e.y)));
      out.push(pair(31, 0));
    }
    return out;
  }

  function insertEntity(e) {
    const out = [
      pair(0, 'INSERT'),
      pair(8, e.layer || '0'),
      pair(62, layerColor(e.layer)),
      pair(2, e.name),
      pair(10, fixed(e.x)),
      pair(20, fixed(e.y)),
      pair(30, 0)
    ];
    if ((e.scaleX || 1) !== 1) out.push(pair(41, fixed(e.scaleX || 1)));
    if ((e.scaleY || 1) !== 1) out.push(pair(42, fixed(e.scaleY || 1)));
    if ((e.scaleZ || 1) !== 1) out.push(pair(43, fixed(e.scaleZ || 1)));
    if (e.rotation) out.push(pair(50, fixed(e.rotation)));
    return out;
  }

  function blocksSection() {
    const asset = root.PulumurBlocks;
    if (asset && asset.blockSection) return String(asset.blockSection).trim();
    return [pair(0, 'SECTION'), pair(2, 'BLOCKS'), pair(0, 'ENDSEC')].join('\n');
  }

  function toDxf(drawing) {
    const layers = drawing.layers && drawing.layers.length ? drawing.layers : ['OUTLINE', 'TEXT'];
    const out = [];
    out.push(pair(0, 'SECTION'));
    out.push(pair(2, 'HEADER'));
    out.push(pair(9, '$ACADVER'));
    out.push(pair(1, 'AC1024'));
    out.push(pair(9, '$DWGCODEPAGE'));
    out.push(pair(3, 'ANSI_1254'));
    out.push(pair(9, '$INSUNITS'));
    out.push(pair(70, 4));
    out.push(pair(0, 'ENDSEC'));

    out.push(pair(0, 'SECTION'));
    out.push(pair(2, 'TABLES'));
    out.push(...layerTable(layers));
    out.push(pair(0, 'ENDSEC'));

    out.push(blocksSection());

    out.push(pair(0, 'SECTION'));
    out.push(pair(2, 'ENTITIES'));
    drawing.entities.forEach(e => {
      if (e.type === 'line') out.push(...lineEntity(e));
      else if (e.type === 'polyline') out.push(...polyEntity(e));
      else if (e.type === 'text') out.push(...textEntity(e));
      else if (e.type === 'insert') out.push(...insertEntity(e));
    });
    out.push(pair(0, 'ENDSEC'));
    out.push(pair(0, 'EOF'));
    return out.join('\n');
  }

  function safeFileName(value) {
    return cleanText(value)
      .toLocaleLowerCase('tr-TR')
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'pergo-rise';
  }

  const api = { toDxf, safeFileName };
  root.PulumurDXF = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
