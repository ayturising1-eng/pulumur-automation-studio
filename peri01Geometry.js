(function (root) {
  'use strict';

  const LAYER_STYLE = {
    OUTLINE: { stroke: '#061f33', width: 5 },
    PROFILE: { stroke: '#0d5d5f', width: 4 },
    FABRIC: { stroke: '#c79600', width: 2, dash: '14 10' },
    RAY: { stroke: '#184e77', width: 4 },
    POST: { stroke: '#9a3412', width: 4 },
    WALL: { stroke: '#6b7280', width: 4, dash: '18 12' },
    GLASS: { stroke: '#0891b2', width: 3 },
    WATER: { stroke: '#1d4ed8', width: 3 },
    DIM: { stroke: '#be123c', width: 2 },
    TEXT: { stroke: '#0f172a', width: 1 },
    TABLE: { stroke: '#0f172a', width: 2 },
    TITLE: { stroke: '#0f172a', width: 2 }
  };

  const SAMPLE_INPUT = {
    product: 'Pergo Rise',
    moduleName: 'Module 1',
    engine: 'Web DXF',
    customer: 'DENEME MÜŞTERİ',
    project: 'TEK POZ WEB DXF DENEME',
    version: '01',
    drawnBy: 'AYETULLAH KILINC',
    date: new Date().toISOString().slice(0, 10),
    systemCount: 1,
    width: 4200,
    opening: 4600,
    rearHeight: 3050,
    frontHeight: 2500,
    rayCount: 3,
    postCount: 2,
    parapet: 'HAYIR',
    parapetHeight: 0,
    glassTrack: 'HAYIR',
    structureColor: '-',
    fabric: '-',
    fabricProfiles: '-',
    motor: '-',
    remote: '-',
    led: '-',
    dimmer: '-',
    extras: '-',
    triangleJoinery: 'HAYIR',
    waterStandard: 'EVET'
  };

  function numberValue(value, fallback) {
    if (value === null || value === undefined || value === '') return fallback;
    const normalized = String(value).trim().replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function intValue(value, fallback) {
    return Math.max(0, Math.round(numberValue(value, fallback)));
  }

  function textValue(value, fallback = '-') {
    const out = String(value ?? '').trim();
    return out.length ? out : fallback;
  }

  function yes(value) {
    return String(value ?? '').trim().toLocaleUpperCase('tr-TR') === 'EVET';
  }

  function formatMm(value) {
    return `${Math.round(value)} mm`;
  }

  function formatDeg(value) {
    return `${Number(value).toFixed(2)}°`;
  }

  function normalizeInput(raw) {
    const d = { ...SAMPLE_INPUT, ...(raw || {}) };
    d.systemCount = Math.max(1, intValue(d.systemCount, 1));
    d.width = Math.max(500, numberValue(d.width, SAMPLE_INPUT.width));
    d.opening = Math.max(500, numberValue(d.opening, SAMPLE_INPUT.opening));
    d.rearHeight = Math.max(500, numberValue(d.rearHeight, SAMPLE_INPUT.rearHeight));
    d.frontHeight = Math.max(500, numberValue(d.frontHeight, SAMPLE_INPUT.frontHeight));
    d.rayCount = Math.max(1, intValue(d.rayCount, SAMPLE_INPUT.rayCount));
    d.postCount = Math.max(0, intValue(d.postCount, SAMPLE_INPUT.postCount));
    d.parapetHeight = Math.max(0, numberValue(d.parapetHeight, 0));
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
    d.slopeDelta = d.rearHeight - d.frontHeight;
    d.angle = Math.atan2(d.slopeDelta, d.opening) * 180 / Math.PI;
    d.rayWidth = 80;
    d.postSize = 120;
    d.glassTrackOffset = yes(d.glassTrack) ? 66 : 0;
    d.rayAreaStart = d.glassTrackOffset;
    d.rayAreaEnd = d.width - d.glassTrackOffset;
    d.rayAreaWidth = Math.max(d.rayWidth, d.rayAreaEnd - d.rayAreaStart);
    d.rayPitch = d.rayCount > 1 ? (d.rayAreaWidth - d.rayWidth) / (d.rayCount - 1) : 0;
    return d;
  }

  function makeEntitySink() {
    const entities = [];
    function push(e) { entities.push(e); return e; }
    return {
      entities,
      line(x1, y1, x2, y2, layer = 'OUTLINE') { return push({ type: 'line', x1, y1, x2, y2, layer }); },
      rect(x, y, w, h, layer = 'OUTLINE') {
        const x2 = x + w;
        const y2 = y + h;
        return push({ type: 'polyline', points: [[x, y], [x2, y], [x2, y2], [x, y2]], closed: true, layer });
      },
      poly(points, closed = false, layer = 'OUTLINE') { return push({ type: 'polyline', points, closed, layer }); },
      text(x, y, value, height = 90, layer = 'TEXT', align = 'left', rotation = 0) {
        return push({ type: 'text', x, y, value: String(value ?? ''), height, layer, align, rotation });
      }
    };
  }

  function addArrow(g, x, y, angle, size, layer) {
    const a1 = angle + Math.PI * 0.84;
    const a2 = angle - Math.PI * 0.84;
    g.line(x, y, x + Math.cos(a1) * size, y + Math.sin(a1) * size, layer);
    g.line(x, y, x + Math.cos(a2) * size, y + Math.sin(a2) * size, layer);
  }

  function addDimH(g, x1, x2, yRef, yDim, label) {
    const layer = 'DIM';
    g.line(x1, yRef, x1, yDim, layer);
    g.line(x2, yRef, x2, yDim, layer);
    g.line(x1, yDim, x2, yDim, layer);
    addArrow(g, x1, yDim, 0, 70, layer);
    addArrow(g, x2, yDim, Math.PI, 70, layer);
    g.text((x1 + x2) / 2, yDim + 95, label, 85, layer, 'center');
  }

  function addDimV(g, y1, y2, xRef, xDim, label) {
    const layer = 'DIM';
    g.line(xRef, y1, xDim, y1, layer);
    g.line(xRef, y2, xDim, y2, layer);
    g.line(xDim, y1, xDim, y2, layer);
    addArrow(g, xDim, y1, Math.PI / 2, 70, layer);
    addArrow(g, xDim, y2, -Math.PI / 2, 70, layer);
    g.text(xDim - 120, (y1 + y2) / 2, label, 85, layer, 'center', 90);
  }

  function addSlopedBeam(g, x1, y1, x2, y2, thickness, layer) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * thickness;
    const ny = dx / len * thickness;
    g.poly([[x1, y1], [x2, y2], [x2 + nx, y2 + ny], [x1 + nx, y1 + ny]], true, layer);
  }

  function drawHatch(g, x, y, w, h) {
    const step = 420;
    for (let t = -h; t < w + h; t += step) {
      const x1 = x + Math.max(0, t);
      const y1 = y + Math.max(0, -t);
      const x2 = x + Math.min(w, t + h);
      const y2 = y + Math.min(h, h - Math.max(0, -t));
      if (x2 > x1) g.line(x1, y1, x2, y2, 'FABRIC');
    }
  }

  function rayXs(d) {
    const xs = [];
    for (let r = 0; r < d.rayCount; r += 1) xs.push(d.rayAreaStart + r * d.rayPitch);
    return xs;
  }

  function postCenterXs(d) {
    if (d.postCount <= 0) return [];
    if (d.postCount === 1) return [d.width / 2];
    const pad = Math.max(d.postSize / 2, 80);
    const span = Math.max(1, d.width - pad * 2);
    return Array.from({ length: d.postCount }, (_, i) => pad + span * i / (d.postCount - 1));
  }

  function drawTopView(g, d, ox, oy) {
    const W = d.width;
    const A = d.opening;
    const gutterH = 180;
    const xs = rayXs(d);
    const posts = postCenterXs(d);

    g.text(ox, oy + A + 620, 'ÜST GÖRÜNÜŞ', 130, 'TITLE', 'left');
    g.rect(ox, oy, W, A, 'OUTLINE');
    g.rect(ox, oy - gutterH, W, gutterH, 'PROFILE');
    g.text(ox + W / 2, oy - gutterH / 2, 'OLUK', 80, 'TEXT', 'center');
    g.rect(ox - 180, oy + A + 40, W + 360, 180, 'WALL');
    g.text(ox + W / 2, oy + A + 130, 'DUVAR / ARKA BAĞLANTI', 70, 'TEXT', 'center');
    drawHatch(g, ox, oy, W, A);

    xs.forEach((x, i) => {
      g.rect(ox + x, oy, d.rayWidth, A, 'RAY');
      g.rect(ox + x, oy - gutterH, d.rayWidth, gutterH, 'RAY');
      g.text(ox + x + d.rayWidth / 2, oy + A / 2, `R${i + 1}`, 65, 'TEXT', 'center', 90);
    });

    if (yes(d.glassTrack)) {
      g.rect(ox, oy, 66, A, 'GLASS');
      g.rect(ox + W - 66, oy, 66, A, 'GLASS');
      g.text(ox + W / 2, oy + A + 360, 'CAM KAYDI AKTİF: RAY ALANI SOL/SAĞ 66 mm OFSETLİ', 75, 'GLASS', 'center');
    }

    posts.forEach((cx, i) => {
      g.rect(ox + cx - d.postSize / 2, oy - gutterH - d.postSize - 50, d.postSize, d.postSize, 'POST');
      g.text(ox + cx, oy - gutterH - d.postSize / 2 - 50, `D${i + 1}`, 60, 'TEXT', 'center');
    });

    if (!yes(d.waterStandard)) {
      const pipeX = ox + W - 220;
      g.line(pipeX, oy - gutterH, pipeX, oy - gutterH - 480, 'WATER');
      g.line(pipeX, oy - gutterH - 480, pipeX + 260, oy - gutterH - 480, 'WATER');
      g.text(pipeX + 300, oy - gutterH - 480, 'ÖZEL SU ÇIKIŞI', 65, 'WATER', 'left');
    }

    addDimH(g, ox, ox + W, oy - gutterH - 20, oy - gutterH - 420, `GENİŞLİK ${formatMm(W)}`);
    addDimV(g, oy, oy + A, ox + W + 30, ox + W + 390, `AÇILIM ${formatMm(A)}`);
  }

  function drawFrontView(g, d, ox, oy) {
    const W = d.width;
    const FH = d.frontHeight;
    const gutterH = 180;
    const xs = rayXs(d);
    const posts = postCenterXs(d);

    g.text(ox, oy + FH + 620, 'ÖN / KARŞI GÖRÜNÜŞ', 130, 'TITLE', 'left');
    g.line(ox - 180, oy, ox + W + 180, oy, 'WALL');
    posts.forEach((cx, i) => {
      g.rect(ox + cx - d.postSize / 2, oy, d.postSize, FH, 'POST');
      g.text(ox + cx, oy + FH / 2, `D${i + 1}`, 60, 'TEXT', 'center', 90);
    });
    g.rect(ox, oy + FH, W, gutterH, 'PROFILE');
    g.text(ox + W / 2, oy + FH + gutterH / 2, 'OLUK ÖN GÖRÜNÜŞ', 70, 'TEXT', 'center');

    xs.forEach((x, i) => {
      g.rect(ox + x, oy + FH + gutterH, d.rayWidth, 120, 'RAY');
      g.text(ox + x + d.rayWidth / 2, oy + FH + gutterH + 170, `R${i + 1}`, 55, 'TEXT', 'center');
    });

    if (yes(d.led)) g.line(ox + 80, oy + FH + 40, ox + W - 80, oy + FH + 40, 'GLASS');
    addDimH(g, ox, ox + W, oy - 120, oy - 380, `GENİŞLİK ${formatMm(W)}`);
    addDimV(g, oy, oy + FH, ox - 60, ox - 360, `ÖN YÜKSEKLİK ${formatMm(FH)}`);
  }

  function drawSideView(g, d, ox, oy) {
    const A = d.opening;
    const FH = d.frontHeight;
    const RH = d.rearHeight;
    const frontX = ox;
    const rearX = ox + A;
    const frontY = oy + FH;
    const rearY = oy + RH;
    const roofT = 90;

    g.text(ox, oy + Math.max(FH, RH) + 820, 'YAN GÖRÜNÜŞ', 130, 'TITLE', 'left');
    g.line(ox - 160, oy, rearX + 580, oy, 'WALL');
    g.rect(frontX - d.postSize / 2, oy, d.postSize, FH, 'POST');
    addSlopedBeam(g, frontX, frontY, rearX, rearY, roofT, 'RAY');
    g.rect(frontX - 130, frontY - 140, 260, 180, 'PROFILE');
    g.rect(rearX + 60, oy, 240, RH, 'WALL');
    g.text(rearX + 180, oy + RH / 2, 'DUVAR', 60, 'TEXT', 'center', 90);

    if (yes(d.parapet) && d.parapetHeight > 0) {
      g.rect(rearX + 60, oy + RH, 240, d.parapetHeight, 'WALL');
      g.text(rearX + 180, oy + RH + d.parapetHeight / 2, `PARAPET ${formatMm(d.parapetHeight)}`, 55, 'TEXT', 'center', 90);
    }

    if (yes(d.triangleJoinery)) {
      const baseY = oy + Math.min(FH, RH) - 720;
      g.poly([[frontX, baseY], [rearX, baseY], [rearX, rearY], [frontX, frontY]], true, 'GLASS');
      const count = Math.max(1, Math.ceil(A / 2000) - 1);
      for (let i = 1; i <= count; i += 1) {
        const x = frontX + (A * i / (count + 1));
        const t = (x - frontX) / A;
        const yTop = frontY + (rearY - frontY) * t;
        g.line(x, baseY, x, yTop, 'GLASS');
      }
      g.text(frontX + A / 2, baseY - 140, 'ÜÇGEN DOĞRAMA', 70, 'GLASS', 'center');
    }

    addDimH(g, frontX, rearX, oy - 120, oy - 430, `AÇILIM ${formatMm(A)}`);
    addDimV(g, oy, oy + FH, frontX - 80, frontX - 380, `ÖN ${formatMm(FH)}`);
    addDimV(g, oy, oy + RH, rearX + 60, rearX + 520, `ARKA ${formatMm(RH)}`);
    g.text(frontX + A / 2, Math.max(frontY, rearY) + 250, `SİSTEM AÇISI ${formatDeg(d.angle)}`, 85, 'TEXT', 'center');
  }

  function drawTable(g, d, ox, oy) {
    const rowH = 210;
    const col1 = 620;
    const col2 = 1180;
    const rows = [
      ['Müşteri', d.customer],
      ['Proje', d.project],
      ['Versiyon', d.version],
      ['Çizen', d.drawnBy],
      ['Tarih', d.date],
      ['Genişlik', formatMm(d.width)],
      ['Açılım', formatMm(d.opening)],
      ['Arka Yükseklik', formatMm(d.rearHeight)],
      ['Ön Yükseklik', formatMm(d.frontHeight)],
      ['Ray Sayısı', String(d.rayCount)],
      ['Dikme Sayısı', String(d.postCount)],
      ['Parapet', textValue(d.parapet)],
      ['Cam Kaydı', textValue(d.glassTrack)],
      ['Üçgen Doğrama', textValue(d.triangleJoinery)],
      ['Su Çıkışı Standart', textValue(d.waterStandard)],
      ['Structure Color', d.structureColor],
      ['Fabric', d.fabric],
      ['Motor / Remote', `${d.motor} / ${d.remote}`],
      ['Extras', d.extras]
    ];

    g.text(ox, oy + rowH + 120, 'PROJE BİLGİ TABLOSU', 120, 'TITLE', 'left');
    rows.forEach((row, i) => {
      const y = oy - i * rowH;
      g.rect(ox, y, col1, rowH, 'TABLE');
      g.rect(ox + col1, y, col2, rowH, 'TABLE');
      g.text(ox + 40, y + rowH / 2, row[0], 70, 'TEXT', 'left');
      g.text(ox + col1 + 40, y + rowH / 2, String(row[1]).slice(0, 46), 70, 'TEXT', 'left');
    });
  }

  function drawTitleBlock(g, d, ox, oy) {
    g.rect(ox, oy, 5200, 420, 'TITLE');
    g.rect(ox, oy, 930, 420, 'PROFILE');
    g.text(ox + 465, oy + 210, 'PLMR', 180, 'TITLE', 'center');
    g.text(ox + 1100, oy + 250, 'Pülümür Automation Studio | Parametrik Çizim ve Proje Otomasyonu', 85, 'TITLE', 'left');
    g.text(ox + 1100, oy + 120, `Ürün: ${d.product} | Modül: ${d.moduleName} | Motor: ${d.engine}`, 70, 'TEXT', 'left');
  }

  function buildDrawing(raw) {
    const d = normalizeInput(raw);
    const g = makeEntitySink();
    const topX = 600;
    const topY = 5200;
    const frontX = 600;
    const frontY = 1000;
    const sideX = topX + d.width + 1400;
    const sideY = 1000;
    const tableX = sideX;
    const tableY = topY + d.opening + 700;

    drawTopView(g, d, topX, topY);
    drawFrontView(g, d, frontX, frontY);
    drawSideView(g, d, sideX, sideY);
    drawTable(g, d, tableX, tableY);
    drawTitleBlock(g, d, 600, 220);

    return { input: d, entities: g.entities, layers: Object.keys(LAYER_STYLE), layerStyle: LAYER_STYLE };
  }

  function entityBounds(e) {
    if (e.type === 'line') return [e.x1, e.y1, e.x2, e.y2];
    if (e.type === 'text') return [e.x, e.y, e.x + e.value.length * e.height * 0.55, e.y + e.height];
    if (e.type === 'polyline') {
      const xs = e.points.map(p => p[0]);
      const ys = e.points.map(p => p[1]);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    }
    return [0, 0, 0, 0];
  }

  function bounds(entities) {
    const b = entities.map(entityBounds);
    const minX = Math.min(...b.map(x => x[0]));
    const minY = Math.min(...b.map(x => x[1]));
    const maxX = Math.max(...b.map(x => x[2]));
    const maxY = Math.max(...b.map(x => x[3]));
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  }

  function escXml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function renderSvg(drawing) {
    const ents = drawing.entities;
    const b = bounds(ents);
    const pad = 450;
    const minX = b.minX - pad;
    const maxY = b.maxY + pad;
    const viewW = b.width + pad * 2;
    const viewH = b.height + pad * 2;
    const sx = x => x - minX;
    const sy = y => maxY - y;
    const parts = [];
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}">`);
    parts.push('<rect x="0" y="0" width="100%" height="100%" fill="white"/>');
    for (const e of ents) {
      const st = drawing.layerStyle[e.layer] || drawing.layerStyle.OUTLINE;
      const stroke = st.stroke;
      const sw = st.width;
      const dash = st.dash ? ` stroke-dasharray="${st.dash}"` : '';
      if (e.type === 'line') {
        parts.push(`<line x1="${sx(e.x1)}" y1="${sy(e.y1)}" x2="${sx(e.x2)}" y2="${sy(e.y2)}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/>`);
      } else if (e.type === 'polyline') {
        const points = e.points.map(p => `${sx(p[0])},${sy(p[1])}`).join(' ');
        parts.push(`<polyline points="${points}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"${e.closed ? ' />' : ' />'}`);
      } else if (e.type === 'text') {
        const anchor = e.align === 'center' ? 'middle' : (e.align === 'right' ? 'end' : 'start');
        const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${sx(e.x)} ${sy(e.y)})"` : '';
        parts.push(`<text class="dxf-text" x="${sx(e.x)}" y="${sy(e.y)}" font-size="${e.height}" text-anchor="${anchor}" fill="${stroke}"${rot}>${escXml(e.value)}</text>`);
      }
    }
    parts.push('</svg>');
    return parts.join('\n');
  }

  const api = { SAMPLE_INPUT, LAYER_STYLE, normalizeInput, buildDrawing, renderSvg, bounds, formatMm, formatDeg };
  root.PulumurGeometry = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
