(function (root) {
  'use strict';

  const COLOR = {
    OUTLINE: 7,
    PROFILE: 1,
    FABRIC: 42,
    RAY: 5,
    'Ray - Yan Görünüş': 5,
    'Ray - Üst Görünüş': 5,
    'Ray - Ön Görünüş': 5,
    POST: 6,
    'Dikme - Yan Görünüş': 6,
    WALL: 8,
    'Duvar - Yan Görünüş': 8,
    'Blok - Yan Görünüş': 8,
    'Dikme - Üst Görünüş': 6,
    'Dikme - Ön Görünüş': 6,
    'Oluk - Yan Görünüş': 7,
    'Oluk - Üst Görünüş': 7,
    'Oluk - Ön Görünüş': 7,
    'Duvar - Üst Görünüş': 8,
    'Ölçüler - Yan Görünüş': 42,
    'Ölçüler - Üst Görünüş': 42,
    'Ölçüler - Ön Görünüş': 42,
    'Ölçüler - Sağ Görünüş': 42,
    'Ölçüler - Ana': 42,
    'Ölçüler - Detay': 42,
    'Bloklar - Sabit': 8,
    'Bloklar - Ray Uçları': 8,
    'Ürün Yerleşimi - Sürme': 4,
    'Ürün Yerleşimi - Zipper': 130,
    'Ürün Yerleşimi - Giyotin': 200,
    'Profil - Yan Kayıt - Yan Görünüş': 30,
    'Profil - Yan Kayıt - Üst Görünüş': 30,
    'Profil - Yan Kayıt - Ön Görünüş': 30,
    'Zone - Önizleme Kontrol': 1,
    TOPWALL: 8,
    HATCH_WALL: 8,
    HATCH_FABRIC: 42,
    GLASS: 6,
    TRIANGLE: 130,
    WATER: 5,
    DIM: 42,
    TEXT: 7,
    TABLE: 7,
    TITLE: 7,
    BLOCKREF: 8,
    BLOCK: 7,
    AUX: 8
  };

  function cleanText(value) {
    return String(value ?? '')
      .replace(/°/g, '%%d')
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

  function fixed(value, decimals = 0) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    const precision = Math.max(0, Number(decimals) || 0);
    return Number(n.toFixed(precision)).toString();
  }

  function fixedScale(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '1';
    return Number(n.toFixed(6)).toString();
  }

  function layerColor(layer) {
    if (COLOR[layer] !== undefined) return COLOR[layer];
    const clean = cleanText(layer);
    const match = Object.keys(COLOR).find(k => cleanText(k) === clean);
    return match ? COLOR[match] : 7;
  }
  function entityColor(e) { return Number.isFinite(Number(e && e.color)) ? Number(e.color) : layerColor(e && e.layer); }

  function headerSection() {
    return [
      pair(0, 'SECTION'), pair(2, 'HEADER'),
      pair(9, '$ACADVER'), pair(1, 'AC1009'),
      pair(9, '$DWGCODEPAGE'), pair(3, 'ansi_1254'),
      // yazdırma plot.dxf AC1009/R12 modelspace mantığına uyumlu başlangıç ayarları
      pair(9, '$TILEMODE'), pair(70, 1),
      pair(9, '$MIRRTEXT'), pair(70, 0),
      pair(9, '$TEXTSTYLE'), pair(7, 'STANDARD'),
      pair(9, '$CLAYER'), pair(8, '0'),
      pair(9, '$CELTYPE'), pair(6, 'BYLAYER'),
      pair(9, '$CECOLOR'), pair(62, 256),
      pair(9, '$LUNITS'), pair(70, 2),
      pair(9, '$LUPREC'), pair(70, 0),
      pair(9, '$MEASUREMENT'), pair(70, 1),
      pair(9, '$DIMSTYLE'), pair(2, 'MESUT-MM'),
      pair(9, '$DIMSCALE'), pair(40, 1),
      pair(9, '$DIMASZ'), pair(40, 100),
      pair(9, '$DIMTXT'), pair(40, 180),
      pair(9, '$DIMCLRD'), pair(70, 42),
      pair(9, '$DIMCLRE'), pair(70, 42),
      pair(9, '$DIMCLRT'), pair(70, 1),
      pair(9, '$DIMDEC'), pair(70, 0),
      pair(9, '$DIMZIN'), pair(70, 8),
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

  function normalizedHiddenLayerSet(hiddenLayers) {
    const out = new Set();
    Object.entries(hiddenLayers || {}).forEach(([name, hidden]) => {
      if (hidden) out.add(cleanText(name) || '0');
    });
    return out;
  }

  function layerTable(layers, hiddenLayers = {}) {
    const unique = Array.from(new Set(['0', ...layers, 'Ölçüler - Ana', 'Ölçüler - Detay', 'BLOCK', 'AUX'].map(x => cleanText(x) || '0')));
    const hidden = normalizedHiddenLayerSet(hiddenLayers);
    const out = [pair(0, 'TABLE'), pair(2, 'LAYER'), pair(70, unique.length)];
    unique.forEach(layer => {
      const color = Math.abs(layerColor(layer));
      const layerColorValue = hidden.has(layer) ? -color : color;
      out.push(pair(0, 'LAYER'), pair(2, layer), pair(70, 64), pair(62, layerColorValue), pair(6, 'CONTINUOUS'));
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

  function dimstyleTable() {
    // mesut-mm.dxf içindeki MESUT-MM ölçü stilinin AC1009/R12 uyumlu karşılığı.
    // Temel değerler: DIMASZ=100, DIMTXT=180, DIMCLRD/DIMCLRE=42, DIMCLRT=1.
    return [
      pair(0, 'TABLE'), pair(2, 'DIMSTYLE'), pair(70, 1),
      pair(0, 'DIMSTYLE'), pair(2, 'MESUT-MM'), pair(70, 0),
      pair(3, ''), pair(4, ''), pair(5, ''), pair(6, ''), pair(7, ''),
      pair(40, 1), pair(41, 100), pair(42, 0.625), pair(43, 3.735), pair(44, 1.25),
      pair(45, 0), pair(46, 0), pair(47, 0), pair(48, 0),
      pair(140, 180), pair(141, 2), pair(142, 0), pair(143, 0.03937), pair(144, 1), pair(145, 0), pair(146, 1), pair(147, 0.625),
      pair(71, 0), pair(72, 0), pair(73, 0), pair(74, 0), pair(75, 0), pair(76, 0), pair(77, 1), pair(78, 8),
      pair(170, 0), pair(171, 3), pair(172, 1), pair(173, 0), pair(174, 0), pair(175, 0),
      pair(176, 42), pair(177, 42), pair(178, 1),
      pair(271, 0), pair(272, 0),
      pair(0, 'ENDTAB')
    ];
  }

  function tablesSection(layers, hiddenLayers = {}) {
    return [pair(0, 'SECTION'), pair(2, 'TABLES'), ...ltypeTable(), ...layerTable(layers, hiddenLayers), ...styleTable(), ...dimstyleTable(), pair(0, 'ENDSEC')];
  }

  function lineEntity(e) {
    return [
      pair(0, 'LINE'),
      pair(8, cleanText(e.layer || 'OUTLINE')),
      pair(62, entityColor(e)),
      pair(10, fixed(e.x1)), pair(20, fixed(e.y1)), pair(30, 0),
      pair(11, fixed(e.x2)), pair(21, fixed(e.y2)), pair(31, 0)
    ];
  }

  function circleEntity(e) {
    return [
      pair(0, 'CIRCLE'),
      pair(8, cleanText(e.layer || 'BLOCK')),
      pair(62, entityColor(e)),
      pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0),
      pair(40, fixed(e.r))
    ];
  }

  function polyEntity(e) {
    const out = [
      pair(0, 'POLYLINE'),
      pair(8, cleanText(e.layer || 'OUTLINE')),
      pair(62, entityColor(e)),
      pair(66, 1),
      pair(10, 0), pair(20, 0), pair(30, 0),
      pair(70, e.closed ? 1 : 0)
    ];
    (e.points || []).forEach(p => {
      out.push(
        pair(0, 'VERTEX'),
        pair(8, cleanText(e.layer || 'OUTLINE')),
        pair(62, entityColor(e)),
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
      pair(62, entityColor(e)),
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


  function mtextEntity(e) {
    // R12/AC1009 güvenli çıktı: MTEXT yerine hücre içinde kırılmış satırları
    // STANDARD + Arial.ttf TEXT olarak yazar. MTEXT ana motora ayrı testle eklenecek.
    const raw = String(e.value || '').replace(/\\P/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = raw.split('\n').map(cleanText).filter(Boolean);
    const out = [];
    const h = Number(e.height || 80);
    const spacing = Number(e.lineSpacing || 1.15);
    lines.forEach((line, i) => {
      out.push(...textEntity({
        type: 'text',
        x: e.x,
        y: Number(e.y) - i * h * spacing,
        height: h,
        value: line,
        layer: e.layer || 'TEXT',
        align: e.align || 'left',
        rotation: e.rotation || 0
      }));
    });
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


  function dimensionEntity(e) {
    const name = e.blockName || '*D0';
    const p1 = e.p1 || { x: 0, y: 0 };
    const p2 = e.p2 || { x: 0, y: 0 };
    const dl = e.dimLine || { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const tx = e.text || dl;
    return [
      pair(0, 'DIMENSION'),
      pair(8, cleanText(e.layer || 'DIM')),
      pair(62, entityColor(e)),
      pair(2, name),
      pair(10, fixed(dl.x)), pair(20, fixed(dl.y)), pair(30, 0),
      pair(11, fixed(tx.x)), pair(21, fixed(tx.y)), pair(31, 0),
      pair(70, 33),
      pair(1, e.textOverride == null ? '<>' : String(e.textOverride)),
      pair(3, 'MESUT-MM'),
      pair(13, fixed(p1.x)), pair(23, fixed(p1.y)), pair(33, 0),
      pair(14, fixed(p2.x)), pair(24, fixed(p2.y)), pair(34, 0)
    ];
  }

  function insertEntity(e, block) {
    const name = block && block.dxfName ? block.dxfName : dxfName(e.name || 'BLOCK');
    return [
      pair(0, 'INSERT'),
      pair(8, cleanText(e.layer || 'BLOCKREF')),
      pair(2, name),
      pair(10, fixed(e.x)), pair(20, fixed(e.y)), pair(30, 0),
      pair(41, fixedScale(Math.abs(e.scaleX || 1))), pair(42, fixedScale(e.scaleY || 1)), pair(43, 1),
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

  
  function mirrorBlockEntityX(entity) {
    if (entity.type === 'line') return { ...entity, x1: -Number(entity.x1 || 0), x2: -Number(entity.x2 || 0) };
    if (entity.type === 'polyline') return { ...entity, points: (entity.points || []).map(p => [-Number(p[0] || 0), Number(p[1] || 0)]).reverse() };
    if (entity.type === 'circle') return { ...entity, x: -Number(entity.x || 0) };
    return { ...entity };
  }

  function mirroredBlockFrom(src, baseName) {
    const entities = (src.entities || []).map(mirrorBlockEntityX);
    const bounds = src.bounds ? {
      minX: -Number(src.bounds.maxX || 0),
      maxX: -Number(src.bounds.minX || 0),
      minY: Number(src.bounds.minY || 0),
      maxY: Number(src.bounds.maxY || 0)
    } : src.bounds;
    return { ...src, entities, bounds, dxfName: `${baseName}_MIRROR` };
  }

function collectSharedBlocks(drawing, sourceBlocks) {
    const used = {};
    (drawing.entities || []).forEach(e => {
      if (e.type === 'insert' && sourceBlocks[e.name]) {
        const src = sourceBlocks[e.name];
        const baseName = src.dxfName || dxfName(e.name);
        if (e.mirrorX) {
          const key = `${e.name}__MIRROR`;
          used[key] = mirroredBlockFrom(src, baseName);
        } else {
          used[e.name] = { ...src, dxfName: baseName };
        }
      }
    });
    return used;
  }


  function collectDimensionBlocks(drawing, blocks) {
    let i = 1;
    (drawing.entities || []).forEach(e => {
      if (e.type !== 'dimension') return;
      const name = e.blockName || `*D${i++}`;
      e.blockName = name;
      blocks[name] = { dxfName: name, entities: e.graphics || [] };
    });
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
    if (e.type === 'text') return textEntity(e);
    if (e.type === 'mtext') return mtextEntity(e);
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


  function dimensionDxfLayer(entity) {
    const type = String((entity && entity.edit && entity.edit.dimensionType) || (entity && entity.dimensionFilterType) || 'main').toLowerCase();
    return type === 'detail' ? 'Ölçüler - Detay' : 'Ölçüler - Ana';
  }

  function prepareDrawingForDxf(drawing) {
    const next = { ...(drawing || {}) };
    next.layers = Array.from(new Set([...(drawing.layers || []), 'Ölçüler - Ana', 'Ölçüler - Detay']));
    next.entities = (drawing.entities || []).map(entity => {
      if (!entity) return entity;
      if (entity.type === 'dimension') {
        const layer = dimensionDxfLayer(entity);
        return {
          ...entity,
          layer,
          graphics: (entity.graphics || []).map(ge => ({ ...ge, layer }))
        };
      }
      if ((entity.type === 'text' || entity.type === 'mtext') && entity.dimensionFilterType) {
        return { ...entity, layer: dimensionDxfLayer(entity) };
      }
      return entity;
    });
    return next;
  }

  function toDxf(drawing) {
    drawing = prepareDrawingForDxf(drawing || {});
    const sourceBlocks = getBlocks(drawing);
    const blocks = collectSharedBlocks(drawing, sourceBlocks);
    collectDimensionBlocks(drawing, blocks);
    const layers = drawing.layers && drawing.layers.length ? drawing.layers : ['OUTLINE', 'TEXT'];
    const hiddenLayers = drawing.hiddenLayers || drawing.dxfHiddenLayers || {};
    const out = [];
    append(out, headerSection());
    append(out, tablesSection(layers, hiddenLayers));
    append(out, blocksSection(blocks));
    out.push(pair(0, 'SECTION'), pair(2, 'ENTITIES'));
    (drawing.entities || []).forEach(e => {
      if (e.type === 'line') append(out, lineEntity(e));
      else if (e.type === 'polyline') append(out, polyEntity(e));
      else if (e.type === 'circle') append(out, circleEntity(e));
      else if (e.type === 'text') append(out, textEntity(e));
      else if (e.type === 'mtext') append(out, mtextEntity(e));
      else if (e.type === 'dimension') append(out, dimensionEntity(e));
      else if (e.type === 'insert') {
        if (isHeavyDisabledBlockName(e.name)) return;
        const block = sourceBlocks[e.name];
        if (block) {
          const usedKey = e.mirrorX ? `${e.name}__MIRROR` : e.name;
          const usedBlock = blocks[usedKey] || block;
          append(out, insertEntity(e, usedBlock));
        }
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
