(function (root) {
  'use strict';

  const COLOR = {
    OUTLINE: 7,
    PROFILE: 3,
    FABRIC: 2,
    RAY: 5,
    POST: 30,
    WALL: 8,
    GLASS: 4,
    WATER: 160,
    DIM: 1,
    TEXT: 7,
    TABLE: 7,
    TITLE: 7
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

  function fixed(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return '0';
    return v.toFixed(4).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  function layerTable(layers) {
    const out = [];
    out.push(pair(0, 'TABLE'));
    out.push(pair(2, 'LAYER'));
    out.push(pair(70, layers.length));
    layers.forEach(name => {
      out.push(pair(0, 'LAYER'));
      out.push(pair(2, name));
      out.push(pair(70, 0));
      out.push(pair(62, COLOR[name] || 7));
      out.push(pair(6, 'CONTINUOUS'));
    });
    out.push(pair(0, 'ENDTAB'));
    return out;
  }

  function lineEntity(e) {
    return [
      pair(0, 'LINE'), pair(8, e.layer || 'OUTLINE'),
      pair(10, fixed(e.x1)), pair(20, fixed(e.y1)), pair(30, 0),
      pair(11, fixed(e.x2)), pair(21, fixed(e.y2)), pair(31, 0)
    ];
  }

  function polyEntity(e) {
    const out = [pair(0, 'POLYLINE'), pair(8, e.layer || 'OUTLINE'), pair(66, 1), pair(70, e.closed ? 1 : 0)];
    e.points.forEach(p => {
      out.push(pair(0, 'VERTEX'));
      out.push(pair(8, e.layer || 'OUTLINE'));
      out.push(pair(10, fixed(p[0])));
      out.push(pair(20, fixed(p[1])));
      out.push(pair(30, 0));
    });
    out.push(pair(0, 'SEQEND'));
    return out;
  }

  function textEntity(e) {
    const alignCode = e.align === 'center' ? 1 : (e.align === 'right' ? 2 : 0);
    const out = [
      pair(0, 'TEXT'), pair(8, e.layer || 'TEXT'),
      pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0),
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

  function toDxf(drawing) {
    const layers = drawing.layers && drawing.layers.length ? drawing.layers : ['OUTLINE', 'TEXT'];
    const out = [];
    out.push(pair(0, 'SECTION'));
    out.push(pair(2, 'HEADER'));
    out.push(pair(9, '$ACADVER'));
    out.push(pair(1, 'AC1009'));
    out.push(pair(9, '$DWGCODEPAGE'));
    out.push(pair(3, 'ANSI_1254'));
    out.push(pair(9, '$INSUNITS'));
    out.push(pair(70, 4));
    out.push(pair(0, 'ENDSEC'));

    out.push(pair(0, 'SECTION'));
    out.push(pair(2, 'TABLES'));
    out.push(...layerTable(layers));
    out.push(pair(0, 'ENDSEC'));

    out.push(pair(0, 'SECTION'));
    out.push(pair(2, 'ENTITIES'));
    drawing.entities.forEach(e => {
      if (e.type === 'line') out.push(...lineEntity(e));
      else if (e.type === 'polyline') out.push(...polyEntity(e));
      else if (e.type === 'text') out.push(...textEntity(e));
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
