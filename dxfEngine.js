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
    GLASS: 6,
    WATER: 5,
    DIM: 1,
    TEXT: 7,
    TABLE: 7,
    TITLE: 7,
    BLOCKREF: 8,
    BLOCK: 7,
    AUX: 8
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

  function dxfName(value) {
    return cleanText(value).replace(/[^A-Za-z0-9_\-]+/g, '_').toUpperCase().slice(0, 60) || 'BLOCK';
  }

  function pair(code, value) { return `${code}\n${value}`; }

  function append(out, arr) {
    for (let i = 0; i < arr.length; i += 1) out.push(arr[i]);
    return out;
  }

  function fixed(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return Number(n.toFixed(3)).toString();
  }

  function layerColor(layer) { return COLOR[layer] ?? 7; }

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
    const unique = Array.from(new Set(['0', ...layers, 'BLOCK', 'AUX'].map(x => cleanText(x) || '0')));
    const out = [pair(0, 'TABLE'), pair(2, 'LAYER'), pair(70, unique.length)];
    unique.forEach(layer => {
      out.push(pair(0, 'LAYER'), pair(2, layer), pair(70, 64), pair(62, layerColor(layer)), pair(6, 'CONTINUOUS'));
    });
    out.push(pair(0, 'ENDTAB'));
    return out;
  }

  function styleTable() {
    // PERI01 tarafındaki daha temiz yazı görünümüne yaklaşmak için STANDARD
    // yazı stiline TrueType Arial atanır. Bu yalnızca DXF text style düzeltmesidir;
    // geometriye müdahale etmez.
    return [
      pair(0, 'TABLE'), pair(2, 'STYLE'), pair(70, 1),
      pair(0, 'STYLE'), pair(2, 'STANDARD'), pair(70, 64), pair(40, 0), pair(41, 1), pair(50, 0), pair(71, 0), pair(42, 2.5), pair(3, 'Arial.ttf'), pair(4, ''),
      pair(0, 'ENDTAB')
    ];
  }

  function tablesSection(layers) {
    return [pair(0, 'SECTION'), pair(2, 'TABLES'), ...ltypeTable(), ...layerTable(layers), ...styleTable(), pair(0, 'ENDSEC')];
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

  function circleEntity(e) {
    return [
      pair(0, 'CIRCLE'),
      pair(8, cleanText(e.layer || 'BLOCK')),
      pair(62, layerColor(e.layer)),
      pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0),
      pair(40, fixed(e.r))
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
    (e.points || []).forEach(p => {
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

  function insertEntity(e, block) {
    const name = block && block.dxfName ? block.dxfName : dxfName(e.name || 'BLOCK');
    return [
      pair(0, 'INSERT'),
      pair(8, cleanText(e.layer || 'BLOCKREF')),
      pair(2, name),
      pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0),
      pair(41, fixed(e.scaleX || 1)), pair(42, fixed(e.scaleY || 1)), pair(43, 1),
      pair(50, fixed(e.rotation || 0))
    ];
  }

  function localPointToInPlace(px, py, ins) {
    const sx = Number(ins.scaleX || 1);
    const sy = Number(ins.scaleY || 1);
    const rot = Number(ins.rotation || 0) * Math.PI / 180;
    const ca = Math.cos(rot);
    const sa = Math.sin(rot);
    const x = Number(px) * sx;
    const y = Number(py) * sy;
    return [x * ca - y * sa, x * sa + y * ca];
  }

  function blockEntityToInPlace(entity, ins) {
    const layer = entity.layer || 'BLOCK';
    if (entity.type === 'line') {
      const p1 = localPointToInPlace(entity.x1, entity.y1, ins);
      const p2 = localPointToInPlace(entity.x2, entity.y2, ins);
      return { type: 'line', layer, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] };
    }
    if (entity.type === 'polyline') {
      return {
        type: 'polyline',
        layer,
        closed: !!entity.closed,
        points: (entity.points || []).map(p => localPointToInPlace(p[0], p[1], ins))
      };
    }
    if (entity.type === 'circle') {
      const p = localPointToInPlace(entity.x, entity.y, ins);
      const s = (Math.abs(Number(ins.scaleX || 1)) + Math.abs(Number(ins.scaleY || 1))) / 2;
      return { type: 'circle', layer, x: p[0], y: p[1], r: Math.abs(Number(entity.r || 0)) * s };
    }
    return null;
  }

  function isHeavyDisabledBlockName(name) {
    return ['Duvar Tarama Block', 'Trapez Tarama', 'RISING LOGO'].includes(String(name || ''));
  }

  function collectSharedBlocks(drawing, sourceBlocks) {
    const used = {};
    (drawing.entities || []).forEach(e => {
      if (e.type === 'insert' && sourceBlocks[e.name]) {
        const src = sourceBlocks[e.name];
        const name = src.dxfName || dxfName(e.name);
        used[e.name] = { ...src, dxfName: name };
      }
    });
    return used;
  }

  function insertAsSafePreview(e) {
    const w = Math.max(20, Math.abs(e.previewW || 120));
    const h = Math.max(20, Math.abs(e.previewH || 80));
    const x = Number(e.x) || 0;
    const y = Number(e.y) || 0;
    const layer = e.layer || 'BLOCKREF';
    const rot = Number(e.rotation) || 0;
    const raw = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]].map(p => rotatePoint(p[0], p[1], x, y, rot));
    const out = [];
    out.push(...polyEntity({ layer, closed: true, points: raw }));
    const p1 = rotatePoint(x - w / 2, y, x, y, rot);
    const p2 = rotatePoint(x + w / 2, y, x, y, rot);
    const p3 = rotatePoint(x, y - h / 2, x, y, rot);
    const p4 = rotatePoint(x, y + h / 2, x, y, rot);
    out.push(...lineEntity({ layer, x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] }));
    out.push(...lineEntity({ layer, x1: p3[0], y1: p3[1], x2: p4[0], y2: p4[1] }));
    out.push(...textEntity({ layer, x, y: y - h / 2 - 32, height: 28, value: cleanText(e.name || 'BLOCK'), align: 'center', rotation: rot }));
    return out;
  }

  function blockEntityOut(e) {
    if (e.type === 'line') return lineEntity(e);
    if (e.type === 'polyline') return polyEntity(e);
    if (e.type === 'circle') return circleEntity(e);
    return [];
  }

  function blocksSection(blocks) {
    const out = [pair(0, 'SECTION'), pair(2, 'BLOCKS')];
    Object.keys(blocks || {}).forEach(displayName => {
      const block = blocks[displayName];
      const name = block.dxfName || dxfName(displayName);
      out.push(
        pair(0, 'BLOCK'),
        pair(8, '0'),
        pair(2, name),
        pair(70, 0),
        pair(10, 0), pair(20, 0), pair(30, 0),
        pair(3, name),
        pair(1, '')
      );
      (block.entities || []).forEach(entity => append(out, blockEntityOut(entity)));
      out.push(pair(0, 'ENDBLK'), pair(8, '0'));
    });
    out.push(pair(0, 'ENDSEC'));
    return out;
  }

  function getBlocks(drawing) {
    if (drawing && drawing.blocks) return drawing.blocks;
    if (root.PulumurFilteredBlocks && root.PulumurFilteredBlocks.blocks) return root.PulumurFilteredBlocks.blocks;
    return {};
  }

  function toDxf(drawing) {
    const sourceBlocks = getBlocks(drawing);
    const blocks = collectSharedBlocks(drawing, sourceBlocks);
    const layers = drawing.layers && drawing.layers.length ? drawing.layers : ['OUTLINE', 'TEXT'];
    const out = [];
    append(out, headerSection());
    append(out, tablesSection(layers));
    append(out, blocksSection(blocks));
    out.push(pair(0, 'SECTION'), pair(2, 'ENTITIES'));
    (drawing.entities || []).forEach(e => {
      if (e.type === 'line') append(out, lineEntity(e));
      else if (e.type === 'polyline') append(out, polyEntity(e));
      else if (e.type === 'circle') append(out, circleEntity(e));
      else if (e.type === 'text') append(out, textEntity(e));
      else if (e.type === 'insert') {
        if (isHeavyDisabledBlockName(e.name)) return;
        const block = sourceBlocks[e.name];
        if (block) append(out, insertEntity(e, block));
        else append(out, insertAsSafePreview(e));
      }
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

  const api = { toDxf, safeFileName, cleanText, dxfName };
  root.PulumurDXF = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
