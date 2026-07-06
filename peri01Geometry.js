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
    GLASS: { stroke: '#0891b2', width: 3 },
    WATER: { stroke: '#1d4ed8', width: 3 },
    DIM: { stroke: '#be123c', width: 2 },
    TEXT: { stroke: '#0f172a', width: 1 },
    TABLE: { stroke: '#0f172a', width: 2 },
    TITLE: { stroke: '#0f172a', width: 2 },
    BLOCKREF: { stroke: '#475569', width: 2, dash: '10 8' }
  };

  // PERI01 LISP içinden alınan ana sabitler.
  const K = {
    systemStartX: 300,
    gutterX: 250,
    sideBaseX: -1450, // 300 - 1750
    rayW: 80,
    postSize: 100,
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
    catiProfilFirstX: 150,
    catiProfilSecondBaseX: 250,
    catiProfilRayRatioBase: 490,
    catiProfilRayRatioMove: 47,
    catiProfilExtraOffset: 120,
    pergoTextMaxH: 220,
    pergoTextMinH: 60,
    pergoTextRatio: 8.5,
    pergoTextOffset: 250
  };

  const BUILD_LABEL = 'WEB DXF V6.2 - CLEAN R12 PREVIEW FIX - 06.07.2026';

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
    width: 4000,
    opening: 4500,
    rearHeight: 3200,
    frontHeight: 2600,
    rayCount: 2,
    postCount: 2,
    parapet: 'HAYIR',
    parapetHeight: 0,
    glassTrack: 'HAYIR',
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

  function firstSemi(value) {
    return String(value ?? '').split(';')[0].trim();
  }

  function numberValue(value, fallback) {
    if (value === null || value === undefined || value === '') return fallback;
    const normalized = firstSemi(value).replace(',', '.');
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

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function formatMm(value) { return `${Math.round(value)} mm`; }
  function formatDeg(value) { return `${Number(value).toFixed(2)}°`; }
  function normDeg(value) { return ((value % 360) + 360) % 360; }

  function lspRayLen(opening, rearH, frontH) {
    return Math.max(1, Math.floor(Math.sqrt(Math.pow(rearH - frontH - K.rayLenHeightCorrection, 2) + Math.pow(opening, 2)) - 220));
  }

  function lspSideAngleRad(opening, rearH, frontH) {
    return -Math.atan((rearH - frontH - K.slopeHeightCorrection) / (opening - K.slopeOpeningCorrection));
  }

  function normalizeInput(raw) {
    const d = { ...SAMPLE_INPUT, ...(raw || {}) };
    // Bu revizyon tek poz odaklıdır. Sistem adedi alanı kalsın ama çizim motoru ilk poz mantığında çalışır.
    d.systemCount = Math.max(1, intValue(d.systemCount, 1));
    d.nominalWidth = Math.max(500, numberValue(d.width, SAMPLE_INPUT.width));
    // PERI01 Excel makrosu, çizim motoruna net sistem genişliğini dış ölçüden 12 mm düşerek gönderiyor.
    // Referans DENEME-DENEME çıktısında 4000 mm giriş için kullanılan gerçek çizim genişliği 3988 mm.
    d.width = Math.max(80, d.nominalWidth - 12);
    d.opening = Math.max(500, numberValue(d.opening, SAMPLE_INPUT.opening));
    d.rearHeight = Math.max(500, numberValue(d.rearHeight, SAMPLE_INPUT.rearHeight));
    d.frontHeight = Math.max(500, numberValue(d.frontHeight, SAMPLE_INPUT.frontHeight));
    d.rayCount = Math.max(1, intValue(d.rayCount, SAMPLE_INPUT.rayCount));
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

    d.rayWidth = K.rayW;
    d.postSize = K.postSize;
    d.angleRad = lspSideAngleRad(d.opening, d.rearHeight, d.frontHeight);
    d.angle = Math.abs(d.angleRad) * 180 / Math.PI;
    d.rayLength = lspRayLen(d.opening, d.rearHeight, d.frontHeight);
    d.rectStartY = -(d.opening + (d.rearHeight - d.frontHeight) + K.frontViewExtraDrop);
    d.uzunluk = d.opening - K.rayLengthFrontDeduct;
    d.solX = K.gutterX + K.postSize;
    d.sagX = K.gutterX + d.width;
    d.posY = -d.opening;
    d.systemStartX = K.systemStartX;
    d.systemEndX = K.systemStartX + d.width;
    d.rayAreaStartX = d.systemStartX + (yes(d.glassTrack) ? K.glassOffsetEachSide : 0);
    d.rayAreaEndX = d.systemEndX - (yes(d.glassTrack) ? K.glassOffsetEachSide : 0);
    d.raySystemW = Math.max(K.rayW, d.rayAreaEndX - d.rayAreaStartX);
    d.rayPitch = d.rayCount > 1 ? (d.raySystemW - K.rayW) / (d.rayCount - 1) : 0;
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
      text(x, y, value, height = 90, layer = 'TEXT', align = 'left', rotation = 0) {
        return push({ type: 'text', x, y, value: String(value ?? ''), height, layer, align, rotation });
      },
      insert(name, x, y, options = {}) {
        return push({
          type: 'insert',
          name: String(name ?? ''),
          x, y,
          layer: options.layer || 'BLOCKREF',
          rotation: options.rotation || 0,
          scaleX: options.scaleX || 1,
          scaleY: options.scaleY || 1,
          previewW: options.previewW || 120,
          previewH: options.previewH || 80
        });
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

  function rotatePoint(px, py, bx, by, ang) {
    const dx = px - bx, dy = py - by, ca = Math.cos(ang), sa = Math.sin(ang);
    return [bx + dx * ca - dy * sa, by + dx * sa + dy * ca];
  }

  function rotatedRect(g, x, y, w, h, bx, by, ang, layer) {
    const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(p => rotatePoint(p[0], p[1], bx, by, ang));
    g.poly(pts, true, layer);
    return pts;
  }

  function blockRef(g, name, x, y, w, h, layer = 'BLOCKREF', rotation = 0, scaleX = 1, scaleY = 1) {
    return g.insert(name, x, y, { layer, rotation, scaleX, scaleY, previewW: w, previewH: h });
  }

  function rayXs(d) {
    const xs = [];
    for (let r = 0; r < d.rayCount; r += 1) xs.push(d.rayAreaStartX + r * d.rayPitch);
    return xs;
  }

  function postCenterXs(d) {
    if (d.postCount <= 0) return [];
    if (d.postCount === 1) return [K.systemStartX + d.width / 2];
    const out = [];
    for (let i = 0; i < d.postCount; i += 1) {
      if (i === 0) out.push(d.solX);
      else if (i === d.postCount - 1) out.push(d.sagX);
      else if (d.postCount === d.rayCount && d.rayCount > 1) {
        out.push(K.systemStartX + ((d.width - K.rayW) / (d.rayCount - 1)) * i + K.rayW / 2);
      } else {
        out.push(d.solX + ((d.width - K.postSize) / (d.postCount - 1)) * i);
      }
    }
    return out;
  }

  function drawTopWall(g, d) {
    g.rect(K.systemStartX - K.topWallInset, 0, d.width + K.topWallInset * 2, K.topWallH, 'TOPWALL');
    blockRef(g, 'Duvar Tarama Block', K.systemStartX - K.topWallInset + (d.width + K.topWallInset * 2) / 2, K.topWallH / 2, d.width, K.topWallH, 'BLOCKREF', 0, (d.width + K.topWallInset * 2) / 100, K.topWallH / 100);
  }

  function drawTopRays(g, d) {
    const rayEndY = -(d.opening + K.topRayEndExtra);
    const rayStartY = rayEndY + d.uzunluk;
    rayXs(d).forEach((x) => {
      g.rect(x, rayStartY, K.rayW, -d.uzunluk, 'RAY');
      g.rect(x + 33.5, rayStartY, 13, -d.uzunluk, 'RAY');
      blockRef(g, 'PergoRise Ray Arka Mekanizma Üst Görünüş', x + 40, rayStartY, 95, 72);
      blockRef(g, 'PergoRise Ray Kafası Üst Görünüş', x + 40, rayEndY, 100, 80);
    });
  }

  function drawTopGutter(g, d) {
    const y = -d.opening;
    g.rect(K.gutterX, y, d.width + 100, K.topGutterH, 'PROFILE');
    g.rect(K.gutterX, y, d.width + 100, K.topGutterInnerH, 'PROFILE');
    g.rect(K.gutterX, y + K.topGutterH, d.width + 100, -K.topGutterLipH, 'PROFILE');
    blockRef(g, 'PergoRise Oluk', 500, y, 390, 120);
  }

  function drawTopPosts(g, d) {
    postCenterXs(d).forEach((x) => {
      blockRef(g, 'PergoRise Dikme Üst Görünüş', x, d.posY, 100, 100, 'POST');
      blockRef(g, 'PergoRise Dikme Oluk Bağlantı Üst Görünüş', x, d.posY, 135, 95);
    });
  }

  function drawTopGlassTrack(g, d) {
    if (!yes(d.glassTrack)) return;
    const camL = Math.max(1, d.opening - 100);
    const baseY = d.posY + 100;
    const leftX = d.solX - 50;
    const rightX = d.sagX - 50;
    g.rect(leftX, baseY, 100, camL, 'GLASS');
    g.rect(rightX, baseY, 100, camL, 'GLASS');
    if (camL > 5000) {
      [leftX, rightX].forEach(baseX => {
        const postY = baseY + camL / 2 - 50;
        g.rect(baseX, postY, 100, 100, 'GLASS');
        g.rect(baseX + 2, postY + 2, 96, 96, 'GLASS');
      });
    }
  }

  function drawTopRoofProfiles(g, d) {
    const xs = rayXs(d);
    const profileShift = (d.rayLength / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilExtraOffset;
    for (let i = 0; i < xs.length - 1; i += 1) {
      const x = xs[i] + K.rayW;
      const len = xs[i + 1] - x;
      if (len > 1) {
        g.rect(x, K.catiProfilY, len, K.catiProfilH, 'FABRIC');
        g.rect(x, K.catiProfilY - profileShift, len, K.catiProfilH, 'FABRIC');
      }
    }
  }

  function drawTopPergoText(g, d) {
    const x1 = d.rayAreaStartX - 6;
    const x2 = d.rayAreaStartX + d.raySystemW + 6;
    const innerX1 = x1 + K.pergoTextOffset;
    const innerX2 = x2 - K.pergoTextOffset;
    const textX = innerX2 > innerX1 ? (innerX1 + innerX2) / 2 : (x1 + x2) / 2;
    const h = clamp(((x2 - x1) - 2 * K.pergoTextOffset) / K.pergoTextRatio, K.pergoTextMinH, K.pergoTextMaxH);
    g.text(textX, -d.opening / 2, 'PERGO RISE', h, 'TITLE', 'center');
  }

  function drawTopView(g, d) {
    drawTopWall(g, d);
    drawTopRays(g, d);
    drawTopGutter(g, d);
    drawTopPosts(g, d);
    drawTopGlassTrack(g, d);
    drawTopRoofProfiles(g, d);
    drawTopPergoText(g, d);
    addDimH(g, K.systemStartX, K.systemStartX + d.nominalWidth, 0, 800, `GENİŞLİK ${formatMm(d.nominalWidth)}`);
    addDimV(g, 0, -d.opening, 100, 100, `AÇILIM ${formatMm(d.opening)}`);
    g.text(K.systemStartX, 1050, 'ÜST GÖRÜNÜŞ - PERI01 KOORDİNAT MANTIĞI', 110, 'TITLE', 'left');
  }

  function drawFrontView(g, d) {
    const xs = rayXs(d);
    const postXs = postCenterXs(d);
    const rectStartY = d.rectStartY;
    const rayH = d.rearHeight - d.frontHeight - K.onRayHCorrection;
    const onRayY = rectStartY + K.onRayHCorrection;
    const ustY = onRayY + rayH;
    const onDikmeH = Math.max(1, d.frontHeight - K.onPostHeightCorrection - d.parapetHeight);
    const altBlokY = rectStartY - d.frontHeight + K.altBlockCorrection + d.parapetHeight;

    g.rect(K.gutterX, rectStartY, d.width + 100, K.frontGutterH, 'PROFILE');
    

    if (yes(d.parapet) && d.parapetHeight > 0) {
      const pBaseY = rectStartY - d.frontHeight;
      const pTopY = pBaseY + d.parapetHeight;
      g.rect(K.systemStartX, pTopY, d.width, -d.parapetHeight, 'WALL');
    }

    xs.forEach((x) => {
      if (rayH > 0) g.rect(x, ustY, K.rayW, -rayH, 'RAY');
      blockRef(g, 'PergoRise Ray Kafası Ön Görünüş', x + 40, onRayY, 110, 70);
    });

    postXs.forEach((x) => {
      blockRef(g, 'PergoRise Dikme Oluk Bağlantı Karşı Görünüş', x, rectStartY, 135, 85);
      g.rect(x - 50, rectStartY - K.onPostTopDrop, K.postSize, -onDikmeH, 'POST');
      blockRef(g, 'PergoRise Dikme Alt Bağlantı Karşı Görünüş', x, altBlokY, 125, 70);
    });

    addDimH(g, K.systemStartX, K.systemStartX + d.nominalWidth, rectStartY - d.frontHeight - 80, rectStartY - d.frontHeight - 350, `GENİŞLİK ${formatMm(d.nominalWidth)}`);
    addDimV(g, rectStartY, rectStartY - d.frontHeight, K.systemStartX - 100, K.systemStartX - 360, `ÖN ${formatMm(d.frontHeight)}`);
    g.text(K.systemStartX, rectStartY + 420, 'ÖN / KARŞI GÖRÜNÜŞ', 110, 'TITLE', 'left');
  }

  function drawSideView(g, d) {
    const rectStartY = -(d.opening + (d.rearHeight - d.frontHeight) + K.frontViewExtraDrop);
    const dikH = Math.max(1, d.frontHeight - K.onPostHeightCorrection - d.parapetHeight);
    const yanPostUstY = rectStartY - K.onPostTopDrop;
    const yanUstY = rectStartY;
    const yanAltY = yanPostUstY - dikH;
    const yanX = K.sideBaseX;
    const duvarX = K.systemStartX - (1750 + d.opening);
    const duvarY = yanAltY - K.altBlockCorrection - d.parapetHeight;
    const bagX = duvarX;
    const bagY = duvarY + d.rearHeight;
    const arkaMekX = bagX + K.sideArkaMekOffsetX;
    const arkaMekY = bagY + K.sideArkaMekOffsetY;
    const startRayX = bagX + K.sideRayStartOffsetX;
    const startRayY = bagY - K.sideRayStartOffsetY;
    const rayLen = d.rayLength;
    const aci = lspSideAngleRad(d.opening, d.rearHeight, d.frontHeight);

    if (d.postCount > 0) {
      g.rect(yanX, yanPostUstY, -K.postSize, -dikH, 'POST');
      blockRef(g, 'PergoRise Dikme Oluk Bağlantı Yan Görünüş', yanX, yanPostUstY, 130, 80, 'BLOCKREF', 270);
      blockRef(g, 'PergoRise Dikme Alt Bağlantı Yan Görünüş', yanX - 50, yanAltY, 120, 70);
    }
    blockRef(g, 'PergoRise Oluk Yan Görünüş Birleştirilmiş', yanX, yanUstY, 220, 135);

    if (yes(d.glassTrack)) {
      const camBaseX = yanX - 100;
      const camBaseY = yanUstY - 3;
      const camW = Math.max(1, d.opening - 100);
      g.rect(camBaseX, camBaseY, -camW, -100, 'GLASS');
      if (camW > 5000) {
        const destekX = camBaseX - camW / 2 - 50;
        const destekY = camBaseY - 100;
        const destekH = Math.max(1, d.frontHeight - 103 - d.parapetHeight);
        g.rect(destekX, destekY, 100, -destekH, 'GLASS');
      }
    }

    if (yes(d.parapet) && d.parapetHeight > 0) {
      const yanParapetX = duvarX + d.opening;
      g.rect(yanParapetX, duvarY + d.parapetHeight, -200, -d.parapetHeight, 'WALL');
    }

    g.rect(duvarX, duvarY, -K.sideWallDepth, d.rearHeight, 'WALL');
    blockRef(g, 'Duvar Tarama Block', duvarX - K.sideWallDepth / 2, duvarY + d.rearHeight / 2, K.sideWallDepth, d.rearHeight, 'BLOCKREF', 0, K.sideWallDepth / 100, d.rearHeight / 100);
    blockRef(g, 'PergoRise Ray Duvar Bağlantı Set', bagX, bagY, 120, 95);
    blockRef(g, 'PergoRise Ray Arka Mekanizma Yan Görünüş', arkaMekX, arkaMekY, 135, 90, 'BLOCKREF', normDeg(aci * 180 / Math.PI));
    rotatedRect(g, startRayX, startRayY, rayLen, -K.sideRayH, arkaMekX, arkaMekY, aci, 'RAY');
    rotatedRect(g, startRayX, startRayY - K.sideInnerRayOffsetY, rayLen, -K.sideInnerRayH, arkaMekX, arkaMekY, aci, 'RAY');
    const kafa = rotatePoint(startRayX + rayLen, startRayY, arkaMekX, arkaMekY, aci);
    blockRef(g, 'PergoRise Ray Kafası Yan Görünüş', kafa[0], kafa[1], 130, 90, 'BLOCKREF', normDeg(aci * 180 / Math.PI));

    // Çatı kayıt profilleri ve araba setleri PERI01'de ray grubuyla birlikte döndürülür.
    const rotDeg = normDeg(aci * 180 / Math.PI);
    const cati1 = rotatePoint(startRayX + K.catiProfilFirstX, startRayY - K.sideRayH, arkaMekX, arkaMekY, aci);
    const cati2 = rotatePoint(startRayX + ((rayLen / K.catiProfilRayRatioBase) * K.catiProfilRayRatioMove + K.catiProfilSecondBaseX), startRayY - K.sideRayH, arkaMekX, arkaMekY, aci);
    blockRef(g, 'PergoRise Çatı Kayıt Profili', cati1[0], cati1[1], 180, 45, 'FABRIC', rotDeg);
    blockRef(g, 'PergoRise Çatı Kayıt Profili', cati2[0], cati2[1], 180, 45, 'FABRIC', rotDeg);
    const arabaKalin = rotatePoint(startRayX + rayLen - 165, startRayY - 0.5, arkaMekX, arkaMekY, aci);
    const arabaInce = rotatePoint(startRayX + rayLen - 615, startRayY - 1.4, arkaMekX, arkaMekY, aci);
    blockRef(g, 'PergoRise RayÇekici Araba Set Kalın', arabaKalin[0], arabaKalin[1], 210, 75, 'BLOCKREF', rotDeg);
    blockRef(g, 'PergoRise RayÇekici Araba Set İnce', arabaInce[0], arabaInce[1], 210, 75, 'BLOCKREF', rotDeg);

    const anglePt = rotatePoint(startRayX + rayLen / 2, startRayY, arkaMekX, arkaMekY, aci);
    g.text(anglePt[0], anglePt[1] + 140, `${formatDeg(Math.abs(aci) * 180 / Math.PI)}`, 170, 'TEXT', 'center');

    if (!yes(d.waterStandard)) {
      const basX = yanX - 35.5;
      const basY = yanUstY + 13.9;
      g.rect(basX, basY, 300, 70, 'WATER');
      g.text(basX + 310, basY + 35, 'Ø70 Pipe 300 mm', 60, 'WATER', 'left');
    }

    if (yes(d.triangleJoinery)) {
      const slope = Math.abs((d.rearHeight - d.frontHeight - K.slopeHeightCorrection) / (d.opening - K.slopeOpeningCorrection));
      const AB = Math.max(1, d.opening - 150);
      const BC = 165 + 150 * slope;
      const rise = AB * slope;
      const AD = BC + rise;
      const baseX = duvarX + 75;
      const baseY = bagY + 600;
      g.poly([[baseX, baseY], [baseX + AB, baseY], [baseX + AB, baseY + BC], [baseX, baseY + AD]], true, 'GLASS');
      const ara = Math.max(0, Math.floor((AB - 0.000001) / 2000));
      for (let i = 1; i <= ara; i += 1) {
        const x = baseX + (AB * i / (ara + 1));
        const t = (x - baseX) / AB;
        const yTop = baseY + AD - (AD - BC) * t;
        g.line(x, baseY, x, yTop, 'GLASS');
      }
      g.text(baseX + AB / 2, baseY + AD + 150, 'ÜÇGEN DOĞRAMA', 80, 'GLASS', 'center');
    }

    addDimH(g, duvarX, yanX, duvarY - 250, duvarY - 520, `AÇILIM ${formatMm(d.opening)}`);
    addDimV(g, duvarY, duvarY + d.rearHeight, duvarX - K.sideWallDepth - 80, duvarX - K.sideWallDepth - 360, `ARKA ${formatMm(d.rearHeight)}`);
    addDimV(g, yanAltY, yanUstY, yanX + 130, yanX + 420, `ÖN ${formatMm(d.frontHeight)}`);
    g.text(duvarX, bagY + 850, 'YAN GÖRÜNÜŞ', 110, 'TITLE', 'left');
  }

  function drawTable(g, d) {
    const ox = K.systemStartX + d.width + 1200;
    const oy = K.topWallH;
    const rowH = 180;
    const col1 = 1200;
    const col2 = 1800;
    const rows = [
      ['Müşteri', d.customer], ['Proje', d.project], ['Versiyon', d.version], ['Çizen', d.drawnBy], ['Tarih', d.date],
      ['Genişlik', formatMm(d.nominalWidth)], ['Açılım', formatMm(d.opening)], ['Arka Yükseklik', formatMm(d.rearHeight)], ['Ön Yükseklik', formatMm(d.frontHeight)],
      ['Ray Sayısı', String(d.rayCount)], ['Dikme Sayısı', String(d.postCount)], ['Parapet', textValue(d.parapet)], ['Parapet Yüksekliği', formatMm(d.parapetHeight)],
      ['Cam Kaydı', textValue(d.glassTrack)], ['Üçgen Doğrama', textValue(d.triangleJoinery)], ['Su Çıkışı Standart', textValue(d.waterStandard)],
      ['Structure Color', d.structureColor], ['Fabric', d.fabric], ['Fabric Profiles', d.fabricProfiles], ['Motor', d.motor], ['Remote', d.remote], ['LED', d.led], ['Dimmer', d.dimmer], ['Extras / Notes', d.extras]
    ];
    g.text(ox, oy + 260, 'PROJE / SİSTEM BİLGİLERİ', 110, 'TITLE', 'left');
    rows.forEach((row, i) => {
      const y = oy - i * rowH;
      g.rect(ox, y, col1, rowH, 'TABLE');
      g.rect(ox + col1, y, col2, rowH, 'TABLE');
      g.text(ox + 45, y + rowH / 2, row[0], 70, 'TEXT', 'left');
      g.text(ox + col1 + 45, y + rowH / 2, String(row[1]).slice(0, 54), 70, 'TEXT', 'left');
    });
  }

  function drawTitleBlock(g, d) {
    const minY = d.rectStartY - d.frontHeight - 1100;
    g.rect(K.systemStartX, minY, 5200, 420, 'TITLE');
    g.rect(K.systemStartX, minY, 930, 420, 'PROFILE');
    g.text(K.systemStartX + 465, minY + 210, 'PLMR', 180, 'TITLE', 'center');
    g.text(K.systemStartX + 1100, minY + 270, 'Pülümür Automation Studio | Parametrik Çizim ve Proje Otomasyonu', 85, 'TITLE', 'left');
    g.text(K.systemStartX + 1100, minY + 150, BUILD_LABEL, 75, 'DIM', 'left');
    g.text(K.systemStartX + 1100, minY + 55, `Ürün: ${d.product} | Modül: ${d.moduleName} | Motor: ${d.engine}`, 60, 'TEXT', 'left');
  }

  function buildDrawing(raw) {
    const d = normalizeInput(raw);
    const g = makeEntitySink();
    drawTopView(g, d);
    drawFrontView(g, d);
    drawSideView(g, d);
    drawTable(g, d);
    drawTitleBlock(g, d);
    return { input: d, entities: g.entities, layers: Object.keys(LAYER_STYLE), layerStyle: LAYER_STYLE };
  }

  function entityBounds(e) {
    if (e.type === 'line') return [Math.min(e.x1, e.x2), Math.min(e.y1, e.y2), Math.max(e.x1, e.x2), Math.max(e.y1, e.y2)];
    if (e.type === 'text') return [e.x, e.y, e.x + e.value.length * e.height * 0.55, e.y + e.height];
    if (e.type === 'polyline') {
      const xs = e.points.map(p => p[0]);
      const ys = e.points.map(p => p[1]);
      return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    }
    if (e.type === 'insert') {
      // V6.2: previewW/previewH zaten hedef mm ölçüsüdür.
      // Eski DXF blok scale değerlerini burada tekrar çarpmak önizlemeyi aşırı küçültüyordu.
      const w = Math.abs(e.previewW || 120);
      const h = Math.abs(e.previewH || 80);
      return [e.x - w / 2, e.y - h / 2, e.x + w / 2, e.y + h / 2];
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
      } else if (e.type === 'insert') {
        // V6.2: önizlemede eski blok scale değerlerini yok sayıyoruz.
        const w = Math.abs(e.previewW || 120);
        const h = Math.abs(e.previewH || 80);
        const cx = sx(e.x), cy = sy(e.y);
        const rot = e.rotation ? ` transform="rotate(${-e.rotation} ${cx} ${cy})"` : '';
        parts.push(`<g${rot}><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" stroke="${stroke}" stroke-width="${sw}"${dash} fill="none"/><line x1="${cx - w / 2}" y1="${cy}" x2="${cx + w / 2}" y2="${cy}" stroke="${stroke}" stroke-width="${Math.max(1, sw / 2)}"/><line x1="${cx}" y1="${cy - h / 2}" x2="${cx}" y2="${cy + h / 2}" stroke="${stroke}" stroke-width="${Math.max(1, sw / 2)}"/><text class="dxf-text" x="${cx}" y="${cy + h / 2 + 34}" font-size="34" text-anchor="middle" fill="${stroke}">${escXml(e.name)}</text></g>`);
      }
    }
    parts.push('</svg>');
    return parts.join('\n');
  }

  const api = { SAMPLE_INPUT, LAYER_STYLE, K, BUILD_LABEL, normalizeInput, buildDrawing, renderSvg, bounds, formatMm, formatDeg, lspRayLen, lspSideAngleRad };
  root.PulumurGeometry = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
