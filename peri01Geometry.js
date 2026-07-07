(function (root) {
  'use strict';

  const LAYER_STYLE = {
    OUTLINE: { stroke: '#061f33', width: 5 },
    PROFILE: { stroke: '#0d5d5f', width: 4 },
    FABRIC: { stroke: '#c79600', width: 2, dash: '14 10' },
    RAY: { stroke: '#184e77', width: 4 },
    POST: { stroke: '#9a3412', width: 4 },
    WALL: { stroke: '#6b7280', width: 4, dash: '18 12' },
    TOPWALL: { stroke: '#9ca3af', width: 4, dash: '18 12' },
    GLASS: { stroke: '#d946ef', width: 3 },
    WATER: { stroke: '#1d4ed8', width: 3 },
    DIM: { stroke: '#be123c', width: 2 },
    TEXT: { stroke: '#0f172a', width: 1 },
    TABLE: { stroke: '#0f172a', width: 2 },
    TITLE: { stroke: '#0f172a', width: 2 },
    BLOCKREF: { stroke: '#475569', width: 2, dash: '10 8' }
  };

  // PERI01 LISP'ten web tabanına taşınan ana sabitler.
  const K = {
    systemStartX: 300,
    gutterX: 250,
    sideBaseX: -1450,
    rayW: 80,
    postSize: 100,
    defaultSystemGap: 25,
    noGapExtra: 12,
    nominalDeduct: 12,
    glassOffsetEachSide: 66,
    topWallInset: 6,
    topWallH: 800,
    topGutterH: 145,
    topGutterInnerH: 35.5,
    topGutterLipH: 12.7,
    frontGutterH: 135,
    topRayEndExtra: 3,
    rayLengthFrontDeduct: 212,
    frontViewExtraDrop: 500,
    onRayHCorrection: 133,
    onPostTopDrop: 3,
    onPostHeightCorrection: 49,
    altBlockCorrection: 46,
    sideWallDepth: 600,
    sideRayStartOffsetX: 250,
    sideRayStartOffsetY: 12,
    sideRayH: 131,
    sideInnerRayOffsetY: 64.7,
    sideInnerRayH: 10,
    sideArkaMekOffsetX: 71.6416842,
    sideArkaMekOffsetY: -128.50988141,
    slopeOpeningCorrection: 71.1,
    slopeHeightCorrection: 278,
    rayLenHeightCorrection: 265,
    catiProfilY: -400,
    catiProfilH: 30,
    catiProfilRayRatioBase: 490,
    catiProfilRayRatioMove: 47,
    catiProfilExtraOffset: 120,
    pergoTextMaxH: 220,
    pergoTextMinH: 60,
    pergoTextRatio: 8.5,
    pergoTextOffset: 250,
    sideViewGapY: 800
  };

  const BUILD_LABEL = 'WEB DXF V8.2.2 - TOP OLUK BLOCK OFF + TRIANGLE TABLE + SIDE MIRROR - 07.07.2026';
  function bridge() { return root.PulumurExcelBridge || null; }

  const SAMPLE_INPUT = {
    product: 'Pergo Rise',
    moduleName: 'Module 1',
    engine: 'Web DXF',
    customer: 'DENEME',
    project: 'DENEME',
    version: '01',
    drawnBy: 'AYETULLAH KILINC',
    date: new Date().toISOString().slice(0, 10),
    systemCount: 1,
    width: '4000',
    opening: '4500',
    rearHeight: '3200',
    frontHeight: 2600,
    rayCount: '',
    postCount: '',
    parapet: 'HAYIR',
    parapetHeight: 0,
    glassTrack: 'HAYIR',
    sideTrack: 'HAYIR',
    structureColor: 'RAL 7016 TEXT.',
    fabric: 'C 1602 - M (8116-1622)',
    fabricProfiles: 'RAL 1013',
    motor: 'RISING MOTOR',
    remote: 'RISING 6 CHANNELS',
    led: 'YES',
    dimmer: 'NO',
    extras: 'THE MOTOR IS ON RIGHT',
    triangleJoinery: 'HAYIR',
    waterStandard: 'EVET'
  };

  function splitSemi(value) {
    return String(value ?? '').split(';').map(s => s.trim()).filter(s => s.length > 0);
  }
  function firstSemi(value) { return splitSemi(value)[0] ?? ''; }
  function numFromToken(value, fallback = 0) {
    const n = Number(String(value ?? '').trim().replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
  }
  function realList(value, fallback) {
    const parts = splitSemi(value);
    if (!parts.length) return [fallback];
    return parts.filter(p => !isNoToken(p)).map(p => numFromToken(p, fallback));
  }
  function intList(value, fallback) {
    return realList(value, fallback).map(v => Math.max(1, Math.round(v || fallback)));
  }
  function numberValue(value, fallback) { return numFromToken(firstSemi(value), fallback); }
  function intValue(value, fallback) { return Math.max(0, Math.round(numberValue(value, fallback))); }
  function textValue(value, fallback = '-') { const out = String(value ?? '').trim(); return out.length ? out : fallback; }
  function yes(value) { return String(value ?? '').trim().toLocaleUpperCase('tr-TR') === 'EVET'; }
  function isNoToken(value) { return String(value ?? '').trim().toLocaleUpperCase('tr-TR') === 'NO'; }
  function nthOrLast(list, idx) { if (!list || !list.length) return undefined; return idx < list.length ? list[idx] : list[list.length - 1]; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function formatMm(value) { return `${Math.round(value)} mm`; }
  function formatDeg(value) { return `${Number(value).toFixed(2)}°`; }
  function normDeg(value) { return ((value % 360) + 360) % 360; }

  function noGapModeActive(raw) {
    const parts = splitSemi(raw);
    const clean = parts.filter(p => !isNoToken(p));
    return parts.length > 0 && isNoToken(parts[parts.length - 1]) && clean.length >= 3 && clean.length % 2 === 1;
  }
  function noGapWidths(raw) {
    const clean = splitSemi(raw).filter(p => !isNoToken(p));
    return clean.filter((_, i) => i % 2 === 0).map(p => numFromToken(p, 0));
  }
  function noGapGaps(raw) {
    const clean = splitSemi(raw).filter(p => !isNoToken(p));
    return clean.filter((_, i) => i % 2 === 1).map(p => numFromToken(p, 0));
  }

  function rayLenFor(opening, rearH, frontH) {
    return Math.max(1, Math.floor(Math.sqrt(Math.pow(rearH - frontH - K.rayLenHeightCorrection, 2) + Math.pow(opening, 2)) - 220));
  }
  function sideAngleRadFor(opening, rearH, frontH) {
    const denom = opening - K.slopeOpeningCorrection;
    return -Math.atan((rearH - frontH - K.slopeHeightCorrection) / (Math.abs(denom) < 1e-9 ? 1 : denom));
  }

  function buildSystems(d, raw) {
    const noMode = noGapModeActive(raw.width);
    const sayfa1Mode = !!(raw && raw.sayfa1);
    let nominalWidths = noMode ? noGapWidths(raw.width) : realList(raw.width, SAMPLE_INPUT.width);
    const rayList = intList(raw.rayCount, SAMPLE_INPUT.rayCount);
    let explicitWidth = nominalWidths.length > 1 || noMode;
    let explicitRay = rayList.length > 1;
    let sysCount = Math.max(1, Math.round(Number(raw.systemCount) || 1));
    if (explicitWidth) sysCount = Math.max(sysCount, nominalWidths.length);
    if (explicitRay) sysCount = Math.max(sysCount, rayList.length);

    let gapRaw = noMode ? noGapGaps(raw.width) : [];
    let systems = [];
    if (!explicitWidth && sysCount > 1) {
      // PERI01 Sayfa1 akışında B1 zaten optimize/net değerdir.
      // Eski web ham G8 akışında ise 12 mm düşüm uygulanıyordu.
      const totalExternal = Math.max(500, nominalWidths[0] || SAMPLE_INPUT.width);
      const totalNet = Math.max(80, sayfa1Mode ? totalExternal : totalExternal - K.nominalDeduct);
      const usable = Math.max(80, totalNet - K.defaultSystemGap * (sysCount - 1));
      nominalWidths = Array.from({ length: sysCount }, () => sayfa1Mode ? usable / sysCount : usable / sysCount + K.nominalDeduct);
    }

    let x = K.systemStartX;
    let totalNet = 0;
    let totalNominal = 0;
    for (let s = 0; s < sysCount; s += 1) {
      const externalW = Math.max(80, nthOrLast(nominalWidths, s) || nominalWidths[0] || SAMPLE_INPUT.width);
      const w = Math.max(80, sayfa1Mode ? externalW : externalW - K.nominalDeduct);
      const gapAfter = s < sysCount - 1 ? (noMode ? (Math.max(0, nthOrLast(gapRaw, s) || 0) + K.noGapExtra) : K.defaultSystemGap) : 0;
      const rc = Math.max(1, nthOrLast(rayList, s) || rayList[0] || 1);
      totalNet += w + gapAfter;
      totalNominal += externalW + gapAfter;
      systems.push({ index: s, startX: x, endX: x + w, nominalWidth: externalW, width: w, gapAfter, rayCount: rc, rays: [] });
      x += w + gapAfter;
    }
    if (systems.length) {
      totalNet -= systems[systems.length - 1].gapAfter;
      totalNominal -= systems[systems.length - 1].gapAfter;
    }

    systems.forEach((sys, s) => {
      const areaStartX = sys.startX + (yes(d.glassTrack) && s === 0 ? K.glassOffsetEachSide : 0);
      const areaEndX = sys.endX - (yes(d.glassTrack) && s === systems.length - 1 ? K.glassOffsetEachSide : 0);
      const areaW = Math.max(K.rayW, areaEndX - areaStartX);
      const pitch = sys.rayCount > 1 ? (areaW - K.rayW) / (sys.rayCount - 1) : 0;
      sys.rayAreaStartX = areaStartX;
      sys.rayAreaEndX = areaEndX;
      sys.raySystemW = areaW;
      sys.rayPitch = pitch;
      for (let r = 0; r < sys.rayCount; r += 1) sys.rays.push(areaStartX + r * pitch);
    });
    return { systems, systemCount: sysCount, noGapMode: noMode, explicitWidth, explicitRay, totalNet, totalNominal };
  }

  function normalizeInput(raw) {
    const d = { ...SAMPLE_INPUT, ...(raw || {}) };

    // PERI01 Excel akışı:
    // Ana sayfadaki değerler önce gizli Sayfa1'e dönüştürülür, LISP da çizimi Sayfa1 üzerinden yapar.
    // WebDXF artık bu detayı aynen izler.
    d.formRaw = { ...d };
    const br = bridge();
    d.sayfa1 = br ? br.buildSayfa1Data(d) : null;
    if (d.sayfa1) {
      d.width = d.sayfa1.B1_width;
      d.opening = d.sayfa1.B2_opening;
      d.rearHeight = d.sayfa1.B3_rearHeight;
      d.frontHeight = d.sayfa1.B4_frontHeight;
      d.rayCount = d.sayfa1.B7_rayCount;
      d.postCount = d.sayfa1.B8_postCount;
      d.parapet = d.sayfa1.B5_parapet;
      d.parapetHeight = d.sayfa1.B6_parapetHeight;
      d.glassTrack = d.sayfa1.B9_glassTrack;
      d.sideTrack = d.sayfa1.B9b_sideTrack || d.formRaw.sideTrack || 'HAYIR';
      d.waterStandard = d.sayfa1.B10_waterStandard;
      d.structureColor = d.sayfa1.B12_structureColor;
      d.fabric = d.sayfa1.B13_fabric;
      d.fabricProfiles = d.sayfa1.B14_fabricProfiles;
      d.motor = d.sayfa1.B15_motor;
      d.remote = d.sayfa1.B16_remote;
      d.led = d.sayfa1.B17_led;
      d.dimmer = d.sayfa1.B18_dimmer;
      d.extras = d.sayfa1.B19_extras;
      d.customer = d.sayfa1.B21_customer;
      d.project = d.sayfa1.B22_project;
      d.version = d.sayfa1.B23_version;
      d.drawnBy = d.sayfa1.B24_drawnBy;
      d.date = d.sayfa1.B25_date;
      d.systemCount = d.sayfa1.B27_systemCount;
      d.triangleJoinery = d.sayfa1.B29_triangleJoinery;
    }

    d.systemCount = Math.max(1, intValue(d.systemCount, 1));
    d.openingList = realList(d.opening, SAMPLE_INPUT.opening).map(v => Math.max(500, v));
    d.rearHeightList = realList(d.rearHeight, SAMPLE_INPUT.rearHeight).map(v => Math.max(500, v));
    d.opening = d.openingList[0];
    d.rearHeight = d.rearHeightList[0];
    d.frontHeight = Math.max(0, numberValue(d.frontHeight, SAMPLE_INPUT.frontHeight));
    // Ray sayısı noktalı virgüllü olabilir (örn. 3;2;4).
    // Burada ilk değere indirgemiyoruz; buildSystems tüm listeyi okuyacak.
    d.rayCountText = String(d.rayCount ?? '').trim();
    d.postCount = Math.max(0, intValue(d.postCount, SAMPLE_INPUT.postCount));
    d.parapetHeight = yes(d.parapet) ? Math.max(0, numberValue(d.parapetHeight, 0)) : 0;
    d.customer = textValue(d.customer, '-');
    d.project = textValue(d.project, '-');
    d.version = textValue(d.version, '01');
    d.drawnBy = textValue(d.drawnBy, 'AYETULLAH KILINC');
    d.date = textValue(d.date, SAMPLE_INPUT.date);
    d.structureColor = textValue(d.structureColor);
    d.fabric = textValue(d.fabric);
    d.fabricProfiles = textValue(d.fabricProfiles);
    d.motor = textValue(d.motor);
    d.remote = textValue(d.remote);
    d.led = textValue(d.led);
    d.dimmer = textValue(d.dimmer);
    d.extras = textValue(d.extras);
    d.sideTrack = textValue(d.sideTrack, 'HAYIR');

    const sys = buildSystems(d, d);
    d.systems = sys.systems;
    d.systemCount = sys.systemCount;
    d.noGapMode = sys.noGapMode;
    d.explicitWidth = sys.explicitWidth;
    d.explicitRay = sys.explicitRay;
    d.totalRayCount = d.systems.reduce((a, sys) => a + (Number(sys.rayCount) || 0), 0);
    d.rayCount = d.systems.length === 1 ? (d.systems[0].rayCount || 0) : d.totalRayCount;
    d.width = sys.totalNet;
    d.nominalWidth = sys.totalNominal;
    d.systemStartX = K.systemStartX;
    d.systemEndX = K.systemStartX + d.width;
    d.rayAreaStartX = d.systems[0].rayAreaStartX;
    d.rayAreaEndX = d.systems[d.systems.length - 1].rayAreaEndX;
    d.raySystemW = Math.max(K.rayW, d.rayAreaEndX - d.rayAreaStartX);

    d.positionCount = Math.max(d.systemCount, d.openingList.length, d.rearHeightList.length);
    d.sidePositionCount = Math.max(1, d.openingList.length);
    d.positions = [];
    for (let i = 0; i < d.positionCount; i += 1) {
      const opening = nthOrLast(d.openingList, i) || d.opening;
      const rearHeight = nthOrLast(d.rearHeightList, i) || d.rearHeight;
      d.positions.push({ index: i, opening, rearHeight, rayLength: rayLenFor(opening, rearHeight, d.frontHeight), angleRad: sideAngleRadFor(opening, rearHeight, d.frontHeight) });
    }
    d.maxOpening = Math.max(...d.positions.map(p => p.opening));
    d.lastOpening = d.positions[d.positions.length - 1].opening;
    d.maxRearHeight = Math.max(...d.positions.map(p => p.rearHeight));
    d.frontRayTopRefY = -d.opening - K.frontViewExtraDrop;
    d.commonFrontRectStartY = d.frontRayTopRefY - d.maxRearHeight + d.frontHeight;
    d.rectStartY = d.commonFrontRectStartY;
    d.solX = K.gutterX + K.postSize;
    d.sagX = K.gutterX + d.width;
    d.posY = -d.opening;
    d.rayWidth = K.rayW;
    d.postSize = K.postSize;
    d.angleRad = sideAngleRadFor(d.opening, d.rearHeight, d.frontHeight);
    d.angle = Math.abs(d.angleRad) * 180 / Math.PI;
    d.rayLength = rayLenFor(d.opening, d.rearHeight, d.frontHeight);
    d.uzunluk = d.opening - K.rayLengthFrontDeduct;
    return d;
  }

  function makeEntitySink() {
    const entities = [];
    function push(e) { entities.push(e); return e; }
    return {
      entities,
      line(x1, y1, x2, y2, layer = 'OUTLINE') { return push({ type: 'line', x1, y1, x2, y2, layer }); },
      rect(x, y, w, h, layer = 'OUTLINE') {
        const x2 = x + w, y2 = y + h;
        return push({ type: 'polyline', points: [[x, y], [x2, y], [x2, y2], [x, y2]], closed: true, layer });
      },
      poly(points, closed = false, layer = 'OUTLINE') { return push({ type: 'polyline', points, closed, layer }); },
      text(x, y, value, height = 90, layer = 'TEXT', align = 'left', rotation = 0) { return push({ type: 'text', x, y, value: String(value ?? ''), height, layer, align, rotation }); },
      insert(name, x, y, options = {}) { return push({ type: 'insert', name: String(name ?? ''), x, y, layer: options.layer || 'BLOCKREF', rotation: options.rotation || 0, scaleX: options.scaleX || 1, scaleY: options.scaleY || 1, previewW: options.previewW || 120, previewH: options.previewH || 80 }); }
    };
  }

  function addArrow(g, x, y, angle, size, layer) { g.line(x, y, x + Math.cos(angle + Math.PI * 0.84) * size, y + Math.sin(angle + Math.PI * 0.84) * size, layer); g.line(x, y, x + Math.cos(angle - Math.PI * 0.84) * size, y + Math.sin(angle - Math.PI * 0.84) * size, layer); }
  function addDimH(g, x1, x2, yRef, yDim, label) { const layer = 'DIM'; g.line(x1, yRef, x1, yDim, layer); g.line(x2, yRef, x2, yDim, layer); g.line(x1, yDim, x2, yDim, layer); addArrow(g, x1, yDim, 0, 70, layer); addArrow(g, x2, yDim, Math.PI, 70, layer); g.text((x1 + x2) / 2, yDim + 95, label, 85, layer, 'center'); }
  function addDimV(g, y1, y2, xRef, xDim, label) { const layer = 'DIM'; g.line(xRef, y1, xDim, y1, layer); g.line(xRef, y2, xDim, y2, layer); g.line(xDim, y1, xDim, y2, layer); addArrow(g, xDim, y1, Math.PI / 2, 70, layer); addArrow(g, xDim, y2, -Math.PI / 2, 70, layer); g.text(xDim - 120, (y1 + y2) / 2, label, 85, layer, 'center', 90); }
  function rotatePoint(px, py, bx, by, ang) { const dx = px - bx, dy = py - by, ca = Math.cos(ang), sa = Math.sin(ang); return [bx + dx * ca - dy * sa, by + dx * sa + dy * ca]; }
  function getBlocks() { return (root.PulumurFilteredBlocks && root.PulumurFilteredBlocks.blocks) ? root.PulumurFilteredBlocks.blocks : {}; }
  function transformLocalPoint(px, py, ins) { const sx = Number(ins.scaleX) || 1, sy = Number(ins.scaleY) || 1, a = (Number(ins.rotation) || 0) * Math.PI / 180; const x = px * sx, y = py * sy, ca = Math.cos(a), sa = Math.sin(a); return [ins.x + x * ca - y * sa, ins.y + x * sa + y * ca]; }
  function transformBlockBounds(block, ins) { const b = block.bounds || { minX: -50, minY: -50, maxX: 50, maxY: 50 }; const pts = [[b.minX, b.minY], [b.maxX, b.minY], [b.maxX, b.maxY], [b.minX, b.maxY]].map(p => transformLocalPoint(p[0], p[1], ins)); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }

  function mirrorEntityX(e, midX) {
    const mx = x => 2 * midX - x;
    if (e.type === 'line') return { ...e, x1: mx(e.x1), x2: mx(e.x2) };
    if (e.type === 'polyline') return { ...e, points: (e.points || []).map(p => [mx(p[0]), p[1]]) };
    if (e.type === 'circle') return { ...e, x: mx(e.x) };
    if (e.type === 'text') return { ...e, x: mx(e.x), rotation: normDeg(180 - (Number(e.rotation) || 0)) };
    if (e.type === 'insert') return { ...e, x: mx(e.x), rotation: normDeg(180 - (Number(e.rotation) || 0)), scaleX: -(Number(e.scaleX) || 1) };
    return { ...e };
  }

  function mirrorNewEntitiesX(g, startIndex, midX) {
    const made = g.entities.slice(startIndex);
    made.forEach(e => g.entities.push(mirrorEntityX(e, midX)));
  }

  function sideMirrorNeeded(d, p) {
    const differentOpening = d.openingList.length > 1;
    if (differentOpening) return p.index === d.sidePositionCount - 1;
    return yes(d.glassTrack) || yes(d.sideTrack);
  }
  function rotatedRect(g, x, y, w, h, bx, by, ang, layer) { const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(p => rotatePoint(p[0], p[1], bx, by, ang)); g.poly(pts, true, layer); return pts; }
  function blockRef(g, name, x, y, w, h, layer = 'BLOCKREF', rotation = 0, scaleX = 1, scaleY = 1) { return g.insert(name, x, y, { layer, rotation, scaleX, scaleY, previewW: w, previewH: h }); }

  function rayXs(d) { return d.systems.flatMap(s => s.rays); }
  function raySystemInfos(d) { return d.systems.map(s => ({ ...s })); }
  function rayIntervals(d) { const out = []; d.systems.forEach(sys => { for (let i = 0; i < sys.rays.length - 1; i += 1) { const x1 = sys.rays[i]; const x2 = sys.rays[i + 1]; out.push({ system: sys.index, x: x1 + K.rayW, len: x2 - (x1 + K.rayW) }); } }); return out; }
  function systemRanges(d) { return d.systems.map(sys => { const rays = sys.rays; const x1 = rays.length ? rays[0] - 6 : sys.startX; const x2 = rays.length ? rays[rays.length - 1] + 86 : sys.endX; return { system: sys.index, x1, x2, mid: (x1 + x2) / 2 }; }); }
  function systemGapRanges(d) { const out = []; for (let i = 0; i < d.systems.length - 1; i += 1) { const left = d.systems[i], right = d.systems[i + 1]; const x1 = left.rays[left.rays.length - 1] + 80; const x2 = right.rays[0]; out.push({ x1, x2, mid: (x1 + x2) / 2 }); } return out; }

  function dikmeAraAxes(d) {
    const out = [];
    if (d.systems.length <= 1) return out;
    d.systems.forEach((sys, s) => {
      sys.rays.forEach((x, r) => {
        if (s === 0 && r === 0) return;
        if (s === d.systems.length - 1 && r === sys.rays.length - 1) return;
        if (r === sys.rays.length - 1 && s < d.systems.length - 1) {
          const next = d.systems[s + 1];
          out.push(next && next.rays.length ? ((x + 80 + next.rays[0]) / 2) : (x + 92.5));
          return;
        }
        if (r === 0 && s > 0) return;
        out.push(x + 40);
      });
    });
    return out;
  }
  function axisPick(list, idx, total) { const n = list.length; if (n <= 0) return null; if (total <= 1) return list[Math.floor(n / 2)]; if (n === 1) return list[0]; let k = Math.floor(0.5 + idx * ((n - 1) / (total - 1))); return list[clamp(k, 0, n - 1)]; }
  function dikmeXEski(d, i) { if (i === 0) return d.solX; if (i === d.postCount - 1) return d.sagX; if (d.postCount === d.rayCount && d.rayCount > 1) return K.systemStartX + ((d.width - K.rayW) / (d.rayCount - 1)) * i + 40; return d.postCount > 1 ? d.solX + ((d.width - K.postSize) / (d.postCount - 1)) * i : K.systemStartX + d.width / 2; }
  function postCenterXs(d) {
    if (d.postCount <= 0) return [];
    if (d.postCount === 1) return [K.systemStartX + d.width / 2];
    const out = [];
    const ax = dikmeAraAxes(d);
    for (let i = 0; i < d.postCount; i += 1) {
      let x = null;
      if (d.systemCount > 1) {
        if (i === 0) x = d.solX;
        else if (i === d.postCount - 1) x = d.sagX;
        else if (d.postCount > 2) {
          const midCount = d.postCount - 2;
          if (ax.length > 0 && ax.length === midCount) x = ax[i - 1];
          else if (ax.length > 0 && !yes(d.glassTrack) && d.rayCount === d.postCount) x = axisPick(ax, i - 1, midCount);
          else x = d.solX + ((d.sagX - d.solX) / (d.postCount - 1)) * i;
        }
      }
      out.push(Number.isFinite(x) ? x : dikmeXEski(d, i));
    }
    return out;
  }

  function topWallYAt(d, idx) { return -(d.openingList[0] - (nthOrLast(d.openingList, idx) || d.opening)); }
  function topWallHAt(d, idx) { return K.topWallH + (d.maxOpening - (nthOrLast(d.openingList, idx) || d.opening)); }
  function topCatiProfilYAt(d, idx) { return topWallYAt(d, idx) - 400; }
  function onRayTopYForPosition(d, idx) { const rear = nthOrLast(d.rearHeightList, idx) || d.rearHeight; return d.frontRayTopRefY - (d.maxRearHeight - rear); }
  function frontRectStartYForPosition(d, idx) { const rear = nthOrLast(d.rearHeightList, idx) || d.rearHeight; return onRayTopYForPosition(d, idx) - rear + d.frontHeight; }

  function drawTopWall(g, d) {
    d.systems.forEach(sys => {
      const y = topWallYAt(d, sys.index);
      const h = topWallHAt(d, sys.index);
      const wx = sys.startX - K.topWallInset;
      const ww = sys.width + K.topWallInset * 2;
      g.rect(wx, y, ww, h, 'TOPWALL');
    });
  }

  function drawTopRays(g, d) {
    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const rayEndY = -(d.opening + K.topRayEndExtra);
      const rayStartY = rayEndY + (p.opening - K.rayLengthFrontDeduct);
      sys.rays.forEach(x => {
        g.rect(x, rayStartY, K.rayW, -(p.opening - K.rayLengthFrontDeduct), 'RAY');
        g.rect(x + 33.5, rayStartY, 13, -(p.opening - K.rayLengthFrontDeduct), 'RAY');
        blockRef(g, 'PergoRise Ray Arka Mekanizma Üst Görünüş', x + 40, rayStartY, 95, 72);
        blockRef(g, 'PergoRise Ray Kafası Üst Görünüş', x + 40, rayEndY, 100, 80);
      });
    });
  }

  function drawTopGutter(g, d) { const y = -d.opening; g.rect(K.gutterX, y, d.width + 100, K.topGutterH, 'PROFILE'); g.rect(K.gutterX, y, d.width + 100, K.topGutterInnerH, 'PROFILE'); g.rect(K.gutterX, y + K.topGutterH, d.width + 100, -K.topGutterLipH, 'PROFILE'); /* V8.2.2: Üst görünüşte PergoRise Oluk bloğu çizilmez; çizgisel oluk profili kalır. */ }
  function drawTopPosts(g, d) { postCenterXs(d).forEach(x => { blockRef(g, 'PergoRise Dikme Üst Görünüş', x, d.posY, 100, 100, 'POST'); blockRef(g, 'PergoRise Dikme Oluk Bağlantı Üst Görünüş', x, d.posY, 135, 95); }); }

  function drawTopGlassTrack(g, d) {
    if (!yes(d.glassTrack)) return;
    const firstL = Math.max(1, d.openingList[0] - 100);
    const lastL = Math.max(1, nthOrLast(d.openingList, d.sidePositionCount - 1) - 100);
    const baseY = d.posY + 100;
    const leftX = d.solX - 50;
    const rightX = d.sagX - 50;
    g.rect(leftX, baseY, 100, firstL, 'GLASS');
    g.rect(rightX, baseY + (firstL - lastL), 100, lastL, 'GLASS');
    [[leftX, firstL, baseY], [rightX, lastL, baseY + (firstL - lastL)]].forEach(([baseX, camL, by]) => { if (camL > 5000) { const postY = by + camL / 2 - 50; g.rect(baseX, postY, 100, 100, 'GLASS'); g.rect(baseX + 2, postY + 2, 96, 96, 'GLASS'); } });
  }

  function drawTopRoofProfiles(g, d) {
    rayIntervals(d).forEach(interval => {
      if (interval.len <= 1) return;
      const p = d.positions[interval.system] || d.positions[0];
      const y = topCatiProfilYAt(d, interval.system);
      const shift = (p.rayLength / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilExtraOffset;
      g.rect(interval.x, y, interval.len, K.catiProfilH, 'FABRIC');
      g.rect(interval.x, y - shift, interval.len, K.catiProfilH, 'FABRIC');
    });
  }

  function drawTopTrapez(g, d) {
    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const profilKaydirY = ((p.rayLength / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilExtraOffset) + 400;
      const trapX = sys.rayAreaStartX;
      const trapW = sys.rayAreaEndX - sys.rayAreaStartX;
      const trapY = topWallYAt(d, sys.index);
      if (trapW > 1) blockRef(g, 'Trapez Tarama', trapX, trapY, trapW, profilKaydirY, 'BLOCKREF', 0, trapW / 100, profilKaydirY / 100);
    });
  }

  function drawTopPergoText(g, d) {
    const ranges = systemRanges(d);
    const textY = -d.opening / 2;
    const h = clamp(Math.min(...ranges.map(r => Math.max(1, r.x2 - r.x1 - 2 * K.pergoTextOffset))) / K.pergoTextRatio, K.pergoTextMinH, K.pergoTextMaxH);
    if (d.systemCount > 1) {
      ranges.forEach((r, i) => { const innerX1 = r.x1 + K.pergoTextOffset, innerX2 = r.x2 - K.pergoTextOffset; const x = innerX2 > innerX1 ? (innerX1 + innerX2) / 2 : r.mid; g.text(x, textY, `PERGO RISE\nPOZ ${i + 1}`, h, 'TITLE', 'center'); });
    } else {
      const r = ranges[0]; const innerX1 = r.x1 + K.pergoTextOffset, innerX2 = r.x2 - K.pergoTextOffset; const x = innerX2 > innerX1 ? (innerX1 + innerX2) / 2 : r.mid; g.text(x, textY, 'PERGO RISE', h, 'TITLE', 'center');
    }
  }

  function drawTopView(g, d) { drawTopWall(g, d); drawTopRays(g, d); drawTopGutter(g, d); drawTopPosts(g, d); drawTopGlassTrack(g, d); drawTopRoofProfiles(g, d); /* drawTopTrapez disabled for no-polyline-simplify lightweight DXF */ drawTopPergoText(g, d); addDimV(g, 0, -d.opening, 100, 100, `AÇILIM ${formatMm(d.opening)}`); if (d.systemCount === 1) addDimH(g, d.rayAreaStartX - 6, d.rayAreaStartX + d.raySystemW + 6, 0, 800, `GENİŞLİK ${formatMm(d.nominalWidth)}`); else { systemRanges(d).forEach(r => addDimH(g, r.x1, r.x2, 0, -650, `SİSTEM ${r.system + 1} ${formatMm(r.x2 - r.x1)}`)); systemGapRanges(d).forEach(gap => addDimH(g, gap.x1, gap.x2, -120, -360, `${formatMm(gap.x2 - gap.x1)}`)); } }

  function drawFrontView(g, d) {
    const postXs = postCenterXs(d);
    const rectStartY = d.commonFrontRectStartY;
    const onDikmeH = Math.max(1, d.frontHeight - K.onPostHeightCorrection - d.parapetHeight);
    const altBlokY = rectStartY - d.frontHeight + K.altBlockCorrection + d.parapetHeight;
    g.rect(K.gutterX, rectStartY, d.width + 100, K.frontGutterH, 'PROFILE');
    if (yes(d.parapet) && d.parapetHeight > 0) { const pBaseY = rectStartY - d.frontHeight; const pTopY = pBaseY + d.parapetHeight; g.rect(K.systemStartX, pTopY, d.width, -d.parapetHeight, 'WALL'); }
    d.systems.forEach(sys => {
      const p = d.positions[sys.index] || d.positions[0];
      const rayTopY = onRayTopYForPosition(d, sys.index);
      const rayH = Math.max(1, p.rearHeight - d.frontHeight - K.onRayHCorrection);
      const onRayY = rayTopY - rayH;
      sys.rays.forEach(x => { g.rect(x, rayTopY, K.rayW, -rayH, 'RAY'); blockRef(g, 'PergoRise Ray Kafası Ön Görünüş', x + 40, onRayY, 110, 70); });
    });
    postXs.forEach(x => { blockRef(g, 'PergoRise Dikme Oluk Bağlantı Karşı Görünüş', x, rectStartY, 135, 85); g.rect(x - 50, rectStartY - K.onPostTopDrop, K.postSize, -onDikmeH, 'POST'); blockRef(g, 'PergoRise Dikme Alt Bağlantı Karşı Görünüş', x, altBlokY, 125, 70); });
    addDimH(g, K.systemStartX, K.systemStartX + d.nominalWidth, rectStartY - d.frontHeight - 80, rectStartY - d.frontHeight - 350, `GENİŞLİK ${formatMm(d.nominalWidth)}`);
    addDimV(g, rectStartY, rectStartY - d.frontHeight, K.systemStartX - 100, K.systemStartX - 360, `ÖN ${formatMm(d.frontHeight)}`);
    if (d.systemCount > 1 && postXs.length > 1) { const midY = rectStartY - onDikmeH / 2; for (let i = 0; i < postXs.length - 1; i += 1) addDimH(g, postXs[i] + 50, postXs[i + 1] - 50, midY, midY, formatMm(postXs[i + 1] - postXs[i] - 100)); }

  }

  function drawOneSideView(g, d, p, stackShiftY) {
    const rectStartY = -(p.opening + (p.rearHeight - d.frontHeight) + K.frontViewExtraDrop) + stackShiftY;
    const dikH = Math.max(1, d.frontHeight - K.onPostHeightCorrection - d.parapetHeight);
    const yanPostUstY = rectStartY - K.onPostTopDrop;
    const yanUstY = rectStartY;
    const yanAltY = yanPostUstY - dikH;
    const yanX = K.sideBaseX;
    const duvarX = K.systemStartX - (1750 + p.opening);
    const duvarY = yanAltY - K.altBlockCorrection - d.parapetHeight;
    const bagX = duvarX;
    const bagY = duvarY + p.rearHeight;
    const arkaMekX = bagX + K.sideArkaMekOffsetX;
    const arkaMekY = bagY + K.sideArkaMekOffsetY;
    const startRayX = bagX + K.sideRayStartOffsetX;
    const startRayY = bagY - K.sideRayStartOffsetY;
    const rayLen = p.rayLength;
    const aci = p.angleRad;
    if (d.postCount > 0) { g.rect(yanX, yanPostUstY, -K.postSize, -dikH, 'POST'); blockRef(g, 'PergoRise Dikme Oluk Bağlantı Yan Görünüş', yanX, yanPostUstY, 130, 80, 'BLOCKREF', 270); blockRef(g, 'PergoRise Dikme Alt Bağlantı Yan Görünüş', yanX - 50, yanAltY, 120, 70); }
    blockRef(g, 'PergoRise Oluk Yan Görünüş Birleştirilmiş', yanX, yanUstY, 220, 135);
    if (yes(d.glassTrack) && (!d.farkliAcilim || p.index === 0 || p.index === d.sidePositionCount - 1)) { const camBaseX = yanX - 100, camBaseY = yanUstY - 3, camW = Math.max(1, p.opening - 100); g.rect(camBaseX, camBaseY, -camW, -100, 'GLASS'); if (camW > 5000) { const destekX = camBaseX - camW / 2 - 50, destekY = camBaseY - 100, destekH = Math.max(1, d.frontHeight - 103 - d.parapetHeight); g.rect(destekX, destekY, 100, -destekH, 'GLASS'); } }
    if (yes(d.parapet) && d.parapetHeight > 0) { g.rect(duvarX + p.opening, duvarY + d.parapetHeight, -200, -d.parapetHeight, 'WALL'); }
    g.rect(duvarX, duvarY, -K.sideWallDepth, p.rearHeight, 'WALL');
    blockRef(g, 'PergoRise Ray Duvar Bağlantı Set', bagX, bagY, 120, 95); blockRef(g, 'PergoRise Ray Arka Mekanizma Yan Görünüş', arkaMekX, arkaMekY, 135, 90, 'BLOCKREF', normDeg(aci * 180 / Math.PI));
    rotatedRect(g, startRayX, startRayY, rayLen, -K.sideRayH, arkaMekX, arkaMekY, aci, 'RAY'); rotatedRect(g, startRayX, startRayY - K.sideInnerRayOffsetY, rayLen, -K.sideInnerRayH, arkaMekX, arkaMekY, aci, 'RAY');
    const kafa = rotatePoint(startRayX + rayLen, startRayY, arkaMekX, arkaMekY, aci); const rotDeg = normDeg(aci * 180 / Math.PI); blockRef(g, 'PergoRise Ray Kafası Yan Görünüş', kafa[0], kafa[1], 130, 90, 'BLOCKREF', rotDeg);
    // V8.2.1: Yan görünüşte çatı kayıt profili ve ray çekici araba setleri çizilmez.
    const anglePt = rotatePoint(startRayX + rayLen / 2, startRayY, arkaMekX, arkaMekY, aci); g.text(anglePt[0], anglePt[1] + 140, `${formatDeg(Math.abs(aci) * 180 / Math.PI)}`, 170, 'TEXT', 'center');
    if (!yes(d.waterStandard)) { const basX = yanX - 35.5; const basY = yanUstY + 13.9; g.rect(basX, basY, 300, 70, 'WATER'); g.text(basX + 310, basY + 35, 'Ø70 Pipe 300 mm', 60, 'WATER', 'left'); }
    if (yes(d.triangleJoinery) && (!d.farkliAcilim || p.index === 0 || p.index === d.sidePositionCount - 1)) { const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / (p.opening - K.slopeOpeningCorrection)); const AB = Math.max(1, p.opening - 150); const BC = 165 + 150 * slope; const rise = AB * slope; const AD = BC + rise; const baseX = duvarX + 75; const baseY = bagY + 600; g.poly([[baseX, baseY], [baseX + AB, baseY], [baseX + AB, baseY + BC], [baseX, baseY + AD]], true, 'GLASS'); const ara = Math.max(0, Math.floor((AB - 0.000001) / 2000)); for (let i = 1; i <= ara; i += 1) { const x = baseX + (AB * i / (ara + 1)); const t = (x - baseX) / AB; const yTop = baseY + AD - (AD - BC) * t; g.line(x, baseY, x, yTop, 'GLASS'); } g.text(baseX + AB / 2, baseY + AD + 150, 'ÜÇGEN DOĞRAMA', 80, 'GLASS', 'center'); }
    addDimH(g, duvarX, yanX, duvarY - 250, duvarY - 520, `AÇILIM ${formatMm(p.opening)}`); addDimV(g, duvarY, duvarY + p.rearHeight, duvarX - K.sideWallDepth - 80, duvarX - K.sideWallDepth - 360, `ARKA ${formatMm(p.rearHeight)}`); addDimV(g, yanAltY, yanUstY, yanX + 130, yanX + 420, `ÖN ${formatMm(d.frontHeight)}`);
  }

  function triangleFrameAllowance(d, idx) {
    if (!yes(d.triangleJoinery)) return 0;
    const differentOpening = d.openingList.length > 1;
    if (differentOpening && idx !== 0 && idx !== d.sidePositionCount - 1) return 0;
    const p = d.positions[idx] || d.positions[0];
    if (!p) return 0;
    const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
    const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / denom);
    const AB = Math.max(1, p.opening - 150);
    const BC = 165 + 150 * slope;
    const AD = BC + AB * slope;
    return 600 + AD + 300;
  }

  function triangleTableLimitY(d) {
    if (!yes(d.triangleJoinery)) return null;
    const idxs = [];
    for (let i = 0; i < d.sidePositionCount; i += 1) if (!d.farkliAcilim || i === 0 || i === d.sidePositionCount - 1) idxs.push(i);
    if (!idxs.length) return null;
    let best = null;
    let shiftY = 0;
    for (let i = 0; i < d.sidePositionCount; i += 1) {
      const p = d.positions[i] || d.positions[0];
      if (idxs.includes(i)) {
        const rectStartY = -(p.opening + K.frontViewExtraDrop) - p.rearHeight + d.frontHeight + shiftY;
        const bagY = rectStartY - 3;
        const baseY = bagY + 600;
        const denom = Math.abs(p.opening - K.slopeOpeningCorrection) < 1e-9 ? 1 : (p.opening - K.slopeOpeningCorrection);
        const slope = Math.abs((p.rearHeight - d.frontHeight - K.slopeHeightCorrection) / denom);
        const AB = Math.max(1, p.opening - 150);
        const BC = 165 + 150 * slope;
        const AD = BC + AB * slope;
        const topY = baseY + AD + 300; // triangle üst çapraz ölçü payı dahil yaklaşık limit
        best = best == null ? topY : Math.max(best, topY);
      }
      shiftY -= (p.opening + K.sideViewGapY);
    }
    return best == null ? null : best + 200;
  }

  function drawSideView(g, d) {
    d.farkliAcilim = d.openingList.length > 1;
    let shiftY = 0;
    for (let i = 0; i < d.sidePositionCount; i += 1) {
      const p = { ...d.positions[i], index: i };
      const start = g.entities.length;
      drawOneSideView(g, d, p, shiftY);
      if (sideMirrorNeeded(d, p)) {
        const midX = K.systemStartX + d.width / 2;
        mirrorNewEntitiesX(g, start, midX);
      }
      shiftY -= (p.opening + K.sideViewGapY);
    }
  }

  function computeFrame(d) {
    const x = -(d.maxOpening + 2900);
    const y = 800 + (d.maxOpening - d.opening) + 450;
    let w = d.systemCount > 1 ? d.width + d.lastOpening + 3500 : d.width + d.maxOpening + 3800;
    const needsMirror = (d.openingList.length > 1) || yes(d.glassTrack) || yes(d.sideTrack);
    if (needsMirror) w = Math.max(w, d.width + 2 * d.maxOpening + 5200);
    const triExtra = yes(d.triangleJoinery) ? Math.max(0, triangleFrameAllowance(d, d.sidePositionCount - 1)) : 0;
    const h = Math.max(5000, d.maxOpening + d.maxRearHeight + 2750 + triExtra + (d.sidePositionCount - 1) * (d.maxOpening + K.sideViewGapY));
    return { x, y, w, h, bottomY: y - h };
  }

  function ensureFrame(d) {
    if (!d.frame) d.frame = computeFrame(d);
    return d.frame;
  }

  function pergoTextH(d) {
    const ranges = systemRanges(d);
    const minInner = Math.min(...ranges.map(r => Math.max(1, r.x2 - r.x1 - 2 * K.pergoTextOffset)));
    return clamp(minInner / K.pergoTextRatio, K.pergoTextMinH, K.pergoTextMaxH);
  }

  function repeatCharCountText(s) {
    return String(s ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  function wrapTextForWidth(value, width, h, pad, factor = 0.62) {
    const usable = Math.max(h, width - 2 * pad);
    const maxChars = Math.max(1, Math.floor(usable / (h * factor)));
    const raw = repeatCharCountText(value).split('\n');
    const out = [];
    raw.forEach(line => {
      const words = String(line).trim().split(/\s+/).filter(Boolean);
      if (!words.length) { out.push(''); return; }
      let cur = '';
      words.forEach(w => {
        if (!cur) cur = w;
        else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
        else { out.push(cur); cur = w; }
      });
      if (cur) out.push(cur);
    });
    return out.length ? out : [''];
  }

  function textMaxLineLen(value) {
    return Math.max(1, ...repeatCharCountText(value).split('\n').map(x => x.length));
  }

  function drawCellLines(g, x, yTop, w, rowH, h, padX, value, layer = 'TEXT') {
    const lines = Array.isArray(value) ? value : wrapTextForWidth(value, w, h, padX);
    const lineStep = h * 1.25;
    const totalH = h + (lines.length - 1) * lineStep;
    const firstY = yTop - rowH / 2 + totalH / 2 - h * 0.35;
    lines.forEach((line, i) => g.text(x + padX, firstY - i * lineStep, line, h, layer, 'left'));
  }

  function upperTableStyle(d) {
    const lay = (d.sayfa1 && d.sayfa1.layout) || {};
    const baseTxtH = Number(lay.tabloTxtH || 90);
    const h = pergoTextH(d);
    const s = baseTxtH > 0 ? h / baseTxtH : 1;
    return {
      rowH: (lay.tabloRowH || 180) * s,
      col1: (lay.tabloCol1W || 1150) * s,
      col2: (lay.tabloCol2W || 1800) * s,
      txtX: (lay.tabloTxtX || 60) * s,
      txtY: (lay.tabloTxtY || 130) * s,
      txtH: h
    };
  }

  function bottomTableStyle(d, frame) {
    const lay = (d.sayfa1 && d.sayfa1.layout) || {};
    const h = pergoTextH(d);
    const baseTxtH = Number(lay.alttabloTxtH || 10.8);
    let s = baseTxtH > 0 ? h / baseTxtH : 1;
    let rowH = (lay.alttabloRowH || 10) * s;
    let cols = [
      lay.alttabloCol1W || 10,
      lay.alttabloCol2W || 25,
      lay.alttabloCol3W || 10,
      lay.alttabloCol4W || 25,
      lay.alttabloCol5W || 10,
      lay.alttabloCol6W || 20
    ].map(v => v * s);
    let txtX = (lay.alttabloTxtX || 7.2) * s;
    let txtY = (lay.alttabloTxtY || 15.6) * s;
    let txtH = h;

    // LISP v89: A3 çıktı ölçeğine göre alt tablo okunurluğu için ek katsayı.
    const a3Long = 420, a3Short = 297, ref = 25;
    const denomYan = Math.max(frame.w / a3Long, frame.h / a3Short);
    const denomDik = Math.max(frame.w / a3Short, frame.h / a3Long);
    const denom = Math.min(denomYan, denomDik);
    let k = Math.max(1, Math.min(2.5, denom / ref));
    if (k > 1) { rowH *= k; txtX *= k; txtY *= k; txtH *= k; }

    const total = cols.reduce((a, b) => a + b, 0);
    if (total > 0 && Math.abs(total - frame.w) > 0.001) {
      const scale = frame.w / total;
      cols = cols.map(c => c * scale);
    }
    return { rowH, cols, txtX, txtY, txtH };
  }

  function fitTextHSingleLine(value, w, h, pad) {
    const usable = Math.max(1, w - 2 * pad);
    const n = textMaxLineLen(value);
    const fitH = usable / (n * 0.95);
    const minH = h * 0.35;
    return Math.max(minH, Math.min(h, fitH));
  }

  function drawUpperOptionsTable(g, d) {
    const frame = ensureFrame(d);
    const st = upperTableStyle(d);
    let tableX = frame.x + 50;
    let tableY = frame.y - 50;

    let col1 = st.col1;
    let col2 = st.col2;
    const tableMaxW = (-300) - tableX; // peri01UstTabloLimitX = 100 - 400
    const minCol2 = st.txtH * 6;
    if (tableMaxW > col1 + minCol2) col2 = tableMaxW - col1;

    const rows = [
      ['STRUCTURE COLOR', d.structureColor],
      ['FABRIC', d.fabric],
      ['FABRIC PROFILES COLOR', d.fabricProfiles],
      ['MOTOR', d.motor],
      ['REMOTE', d.remote],
      ['LED', d.led],
      ['DIMMER', d.dimmer],
      ['EXTRAS', d.extras]
    ];

    let rowHeights = rows.map(row => {
      const labLines = wrapTextForWidth(row[0], col1, st.txtH, st.txtX);
      const valLines = wrapTextForWidth(row[1], col2, st.txtH, st.txtX);
      const lineCount = Math.max(labLines.length, valLines.length);
      const need = 2 * st.txtY + (lineCount - 1) * st.txtH * 1.25 + st.txtH;
      return Math.max(st.rowH, need);
    });
    let tableH = rowHeights.reduce((a, b) => a + b, 0);
    const triLimitY = triangleTableLimitY(d);
    if (triLimitY !== null) {
      const allowedH = tableY - triLimitY;
      if (allowedH > st.txtH && tableH > allowedH) {
        const k = Math.max(0.35, allowedH / tableH);
        rowHeights = rowHeights.map(h => h * k);
        tableH = rowHeights.reduce((a, b) => a + b, 0);
      }
    }
    const tableW = col1 + col2;

    g.rect(tableX, tableY, tableW, -tableH, 'TABLE');
    g.line(tableX + col1, tableY, tableX + col1, tableY - tableH, 'TABLE');
    let y = tableY;
    for (let i = 0; i < rowHeights.length - 1; i += 1) {
      y -= rowHeights[i];
      g.line(tableX, y, tableX + tableW, y, 'TABLE');
    }
    y = tableY;
    rows.forEach((row, i) => {
      drawCellLines(g, tableX, y, col1, rowHeights[i], st.txtH, st.txtX, row[0]);
      drawCellLines(g, tableX + col1, y, col2, rowHeights[i], st.txtH, st.txtX, row[1]);
      y -= rowHeights[i];
    });
  }

  function drawBottomTitleTable(g, d) {
    const frame = ensureFrame(d);
    const st = bottomTableStyle(d, frame);
    const x = frame.x;
    const y = frame.bottomY;
    const [c1, c2, c3, c4, c5, c6] = st.cols;
    const ax1 = x + c1, ax2 = ax1 + c2, ax3 = ax2 + c3, ax4 = ax3 + c4, ax5 = ax4 + c5;
    const row1Cells = [
      ['CUSTOMER', c1], [d.customer, c2], ['VERSION', c3], [d.version, c4], ['DATE', c5], [d.date, c6]
    ];
    const row2Cells = [
      ['PROJECT', c1], [d.project, c2], ['DRAWN BY', c3], [d.drawnBy, c4]
    ];
    const cellH = (val, w) => Math.max(st.rowH, st.txtY * 2 + st.txtH);
    const row1H = Math.max(st.rowH, ...row1Cells.map(c => cellH(c[0], c[1])));
    const row2H = Math.max(st.rowH, ...row2Cells.map(c => cellH(c[0], c[1])));
    const totalH = row1H + row2H;

    g.rect(x, y, frame.w, -totalH, 'TITLE');
    [ax1, ax2, ax3, ax4, ax5].forEach(ax => g.line(ax, y, ax, y - totalH, 'TITLE'));
    g.line(x, y - row1H, x + frame.w, y - row1H, 'TITLE');

    const drawSingle = (x0, yTop, w, hRow, value) => {
      const h = fitTextHSingleLine(value, w, st.txtH, st.txtX);
      g.text(x0 + st.txtX, yTop - hRow / 2 + h * 0.35, value, h, 'TEXT', 'left');
    };
    drawSingle(x, y, c1, row1H, 'CUSTOMER');
    drawSingle(ax1, y, c2, row1H, d.customer);
    drawSingle(ax2, y, c3, row1H, 'VERSION');
    drawSingle(ax3, y, c4, row1H, d.version);
    drawSingle(ax4, y, c5, row1H, 'DATE');
    drawSingle(ax5, y, c6, row1H, d.date);

    const y2 = y - row1H;
    drawSingle(x, y2, c1, row2H, 'PROJECT');
    drawSingle(ax1, y2, c2, row2H, d.project);
    drawSingle(ax2, y2, c3, row2H, 'DRAWN BY');
    drawSingle(ax3, y2, c4, row2H, d.drawnBy);
  }

  function drawFrame(g, d) {
    const f = ensureFrame(d);
    g.rect(f.x, f.y, f.w, -f.h, 'OUTLINE');
  }

  function buildDrawing(raw) {
    const d = normalizeInput(raw);
    const g = makeEntitySink();
    ensureFrame(d);
    drawTopView(g, d);
    drawFrontView(g, d);
    drawSideView(g, d);
    drawFrame(g, d);
    drawUpperOptionsTable(g, d);
    drawBottomTitleTable(g, d);
    return { input: d, entities: g.entities, layers: Object.keys(LAYER_STYLE), layerStyle: LAYER_STYLE, blocks: getBlocks() };
  }

  function entityBounds(e) { if (e.type === 'line') return [Math.min(e.x1, e.x2), Math.min(e.y1, e.y2), Math.max(e.x1, e.x2), Math.max(e.y1, e.y2)]; if (e.type === 'text') return [e.x, e.y, e.x + e.value.length * e.height * 0.55, e.y + e.height]; if (e.type === 'polyline') { const xs = e.points.map(p => p[0]), ys = e.points.map(p => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; } if (e.type === 'circle') return [e.x - e.r, e.y - e.r, e.x + e.r, e.y + e.r]; if (e.type === 'insert') { const block = getBlocks()[e.name]; if (block) return transformBlockBounds(block, e); const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80); return [e.x - w / 2, e.y - h / 2, e.x + w / 2, e.y + h / 2]; } return [0, 0, 0, 0]; }
  function bounds(entities) { const b = entities.map(entityBounds); const minX = Math.min(...b.map(x => x[0])), minY = Math.min(...b.map(x => x[1])), maxX = Math.max(...b.map(x => x[2])), maxY = Math.max(...b.map(x => x[3])); return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }; }
  function escXml(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

  function renderSvg(drawing) {
    const ents = drawing.entities; const b = bounds(ents); const pad = 450; const minX = b.minX - pad; const maxY = b.maxY + pad; const viewW = b.width + pad * 2; const viewH = b.height + pad * 2; const sx = x => x - minX; const sy = y => maxY - y; const parts = [];
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}">`); parts.push('<rect x="0" y="0" width="100%" height="100%" fill="white"/>');
    for (const e of ents) { const st = drawing.layerStyle[e.layer] || drawing.layerStyle.OUTLINE; const stroke = st.stroke; const sw = st.width; const dash = st.dash ? ` stroke-dasharray="${st.dash}"` : ''; if (e.type === 'line') parts.push(`<line x1="${sx(e.x1)}" y1="${sy(e.y1)}" x2="${sx(e.x2)}" y2="${sy(e.y2)}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/>`); else if (e.type === 'polyline') { const points = e.points.map(p => `${sx(p[0])},${sy(p[1])}`).join(' '); parts.push(`<polyline points="${points}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/>`); } else if (e.type === 'text') { const anchor = e.align === 'center' ? 'middle' : (e.align === 'right' ? 'end' : 'start'); const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${sx(e.x)} ${sy(e.y)})"` : ''; parts.push(`<text class="dxf-text" x="${sx(e.x)}" y="${sy(e.y)}" font-size="${e.height}" text-anchor="${anchor}" fill="${stroke}"${rot}>${escXml(e.value)}</text>`); } else if (e.type === 'circle') parts.push(`<circle cx="${sx(e.x)}" cy="${sy(e.y)}" r="${Math.abs(e.r)}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/>`); else if (e.type === 'insert') { const block = getBlocks()[e.name]; if (block) { const group = []; (block.entities || []).forEach(be => { const bst = drawing.layerStyle[e.layer] || drawing.layerStyle[be.layer] || drawing.layerStyle.BLOCKREF; const bstroke = bst.stroke; const bsw = Math.max(1, (bst.width || 2)); if (be.type === 'line') { const p1 = transformLocalPoint(be.x1, be.y1, e), p2 = transformLocalPoint(be.x2, be.y2, e); group.push(`<line x1="${sx(p1[0])}" y1="${sy(p1[1])}" x2="${sx(p2[0])}" y2="${sy(p2[1])}" stroke="${bstroke}" stroke-width="${bsw}" fill="none"/>`); } else if (be.type === 'polyline') { const points = (be.points || []).map(p => transformLocalPoint(p[0], p[1], e)).map(p => `${sx(p[0])},${sy(p[1])}`).join(' '); group.push(`<polyline points="${points}" stroke="${bstroke}" stroke-width="${bsw}" fill="none"/>`); } else if (be.type === 'circle') { const p = transformLocalPoint(be.x, be.y, e); const rr = Math.abs(be.r * ((Number(e.scaleX || 1) + Number(e.scaleY || 1)) / 2)); group.push(`<circle cx="${sx(p[0])}" cy="${sy(p[1])}" r="${rr}" stroke="${bstroke}" stroke-width="${bsw}" fill="none"/>`); } }); parts.push(`<g data-block="${escXml(e.name)}">${group.join('')}</g>`); } else { const w = Math.abs(e.previewW || 120), h = Math.abs(e.previewH || 80), cx = sx(e.x), cy = sy(e.y); const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${cx} ${cy})"` : ''; parts.push(`<g${rot}><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/><text class="dxf-text" x="${cx}" y="${cy + h / 2 + 34}" font-size="34" text-anchor="middle" fill="${stroke}">${escXml(e.name)}</text></g>`); } } }
    parts.push('</svg>'); return parts.join('\n');
  }

  const api = { SAMPLE_INPUT, LAYER_STYLE, K, BUILD_LABEL, normalizeInput, buildDrawing, renderSvg, bounds, formatMm, formatDeg, rayLenFor, sideAngleRadFor, getBlocks };
  root.PulumurGeometry = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
