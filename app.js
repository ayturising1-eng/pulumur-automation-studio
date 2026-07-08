(function () {
  'use strict';

  const ids = [
    'product', 'moduleName', 'engine', 'customer', 'project', 'version', 'drawnBy', 'date',
    'systemCount', 'width', 'opening', 'rearHeight', 'frontHeight', 'rayCount', 'postCount',
    'parapet', 'parapetHeight', 'glassTrack', 'sideTrack', 'structureColor', 'fabric', 'fabricProfiles',
    'motor', 'remote', 'led', 'dimmer', 'extras', 'triangleJoinery', 'waterStandard'
  ];

  const $ = id => document.getElementById(id);
  const statusText = $('statusText');
  const preview = $('preview');
  const previewPanel = document.querySelector('.preview-panel');
  let lastDrawing = null;
  let lastCalc = null;
  const upperTableFieldIds = ['structureColor', 'fabric', 'fabricProfiles', 'motor', 'remote', 'led', 'dimmer', 'extras'];
  let wrappingFields = false;

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function fillInitial() {
    const d = window.PulumurGeometry.SAMPLE_INPUT;
    ids.forEach(id => {
      if ($(id) && d[id] !== undefined) $(id).value = d[id];
    });
    $('date').value = today();
    ['rayCount', 'postCount'].forEach(id => {
      if ($(id)) $(id).dataset.userEdited = 'false';
    });
    applyAutoRayPost(true);
  }

  function applyAutoRayPost(force = false) {
    const br = window.PulumurExcelBridge;
    if (!br || typeof br.autoRayPostCount !== 'function') return;
    const raw = collectForm();
    const auto = br.autoRayPostCount(raw.systemCount, raw.width, raw.frontHeight);
    const rayEl = $('rayCount');
    const postEl = $('postCount');
    const rayWasManual = rayEl && rayEl.dataset.userEdited === 'true';
    const postWasManual = postEl && postEl.dataset.userEdited === 'true';

    if (rayEl && (force || !rayWasManual || String(rayEl.value || '').trim() === '')) {
      rayEl.value = auto.rayText || '';
      rayEl.dataset.userEdited = 'false';
    }

    const currentRayText = rayEl ? rayEl.value : auto.rayText;
    const autoPost = br.postCountFromRayText ? br.postCountFromRayText(currentRayText, raw.systemCount, raw.width, raw.frontHeight) : auto.postCount;
    if (postEl && (force || !postWasManual || String(postEl.value || '').trim() === '')) {
      postEl.value = autoPost === '' || autoPost === null || autoPost === undefined ? '' : String(autoPost);
      postEl.dataset.userEdited = 'false';
    }
  }

  function collectForm() {
    return ids.reduce((acc, id) => {
      const el = $(id);
      if (!el) return acc;
      const value = el.value;
      acc[id] = upperTableFieldIds.includes(id)
        ? String(value || '').replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
        : value;
      return acc;
    }, {});
  }

  function firstNumber(value) {
    const token = String(value ?? '').split(';').map(s => s.trim()).find(s => s && s.toLocaleUpperCase('tr-TR') !== 'NO');
    const parsed = Number(String(token ?? '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function validateInput(d) {
    const missing = [];
    if (firstNumber(d.width) <= 0) missing.push('Genişlik');
    if (firstNumber(d.opening) <= 0) missing.push('Açılım');
    if (firstNumber(d.rearHeight) <= 0) missing.push('Arka yükseklik');
    if (firstNumber(d.frontHeight) <= 0) missing.push('Ön yükseklik');
    // Ray ve dikme sayısı Excel makrosundaki gibi otomatik hesaplanebilir.
    if (missing.length) throw new Error(`${missing.join(', ')} alanlarını doldur.`);
  }

  function autosizeTextarea(el) {
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    el.style.height = Math.max(42, el.scrollHeight) + 'px';
  }

  function syncUpperInputWrap(data) {
    if (wrappingFields || !window.PulumurGeometry || typeof window.PulumurGeometry.wrapTextForUpperInput !== 'function') return;
    wrappingFields = true;
    try {
      upperTableFieldIds.forEach(id => {
        const el = $(id);
        if (!el || el.tagName !== 'TEXTAREA') return;
        const plain = String(el.value || '').replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        const wrapped = window.PulumurGeometry.wrapTextForUpperInput(plain, data);
        if (el.value !== wrapped) el.value = wrapped;
        autosizeTextarea(el);
      });
    } finally {
      wrappingFields = false;
    }
  }

  function updatePreview() {
    try {
      applyAutoRayPost(false);
      const data = collectForm();
      validateInput(data);
      const drawing = window.PulumurGeometry.buildDrawing(data);
      syncUpperInputWrap(data);
      lastDrawing = drawing;
      preview.innerHTML = window.PulumurGeometry.renderSvg(drawing);
      const d = drawing.input;
      statusText.textContent = `Hazır: Sayfa1 B1=${d.sayfa1 ? d.sayfa1.B1_width : Math.round(d.width)} | ${Math.round(d.opening)} mm açılım, ${d.systems.map(s => s.rayCount).join(';')} ray, ${d.postCount} dikme, açı ${window.PulumurGeometry.formatDeg(d.angle)}.`;
      return drawing;
    } catch (err) {
      preview.innerHTML = '<div class="empty-state">Önizleme için zorunlu ölçüleri doldur.</div>';
      statusText.textContent = err.message;
      return null;
    }
  }

  function downloadBlob(filename, blob) {
    if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === 'function') {
      window.navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1500);
  }

  function downloadText(filename, text, mime = 'application/octet-stream;charset=utf-8') {
    downloadBlob(filename, new Blob([text], { type: mime }));
  }

  function buildNameRoot(drawing) {
    return window.PulumurDXF.safeFileName(`${drawing.input.project}-${drawing.input.product}-web-dxf-v8_2_29-v${drawing.input.version}`);
  }

  function generateDxf() {
    try {
      const drawing = updatePreview();
      if (!drawing) return;
      if (!window.PulumurDXF || typeof window.PulumurDXF.toDxf !== 'function') {
        throw new Error('DXF motoru yüklenemedi. GitHub’a dxfEngine.js ve blocks klasörünü yüklediğinden emin ol.');
      }
      const dxf = window.PulumurDXF.toDxf(drawing);
      if (!dxf || dxf.length < 100) throw new Error('DXF içeriği boş oluştu.');
      const nameRoot = buildNameRoot(drawing);
      downloadText(`${nameRoot}.dxf`, dxf, 'application/dxf;charset=utf-8');
      statusText.textContent = `DXF indirildi: ${nameRoot}.dxf`;
    } catch (err) {
      statusText.textContent = `DXF oluşturma hatası: ${err.message}`;
      window.alert(`DXF oluşturma hatası:
${err.message}`);
      console.error(err);
    }
  }

  function ensureJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    const existing = document.querySelector('script[data-jspdf="1"]');
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve(window.jspdf && window.jspdf.jsPDF), { once: true });
        existing.addEventListener('error', () => reject(new Error('jsPDF yüklenemedi.')), { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      script.async = true;
      script.dataset.jspdf = '1';
      script.onload = () => resolve(window.jspdf && window.jspdf.jsPDF);
      script.onerror = () => reject(new Error('PDF kütüphanesi yüklenemedi.'));
      document.head.appendChild(script);
    });
  }

  function svgMarkupFromDrawing(drawing) {
    return window.PulumurGeometry.renderSvg(drawing);
  }

  function loadSvgImage(svgText) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG önizlemesi görsele dönüştürülemedi.'));
      };
      img.src = url;
    });
  }

  function parseViewBox(svgText) {
    const match = String(svgText).match(/viewBox="([^"]+)"/i);
    if (!match) return { width: 1000, height: 1000 };
    const nums = match[1].trim().split(/\s+/).map(Number);
    return { width: Math.max(1, nums[2] || 1000), height: Math.max(1, nums[3] || 1000) };
  }

  async function generatePdf() {
    preview.classList.add('is-loading');
    try {
      const drawing = updatePreview();
      if (!drawing) return;
      const jsPDF = await ensureJsPdf();
      if (!jsPDF) throw new Error('PDF kütüphanesi aktif değil.');
      const svgText = svgMarkupFromDrawing(drawing);
      const box = parseViewBox(svgText);
      const img = await loadSvgImage(svgText);
      const longestPx = 4200;
      const scale = longestPx / Math.max(box.width, box.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1400, Math.round(box.width * scale));
      canvas.height = Math.max(1400, Math.round(box.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('PDF için çizim yüzeyi oluşturulamadı.');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = canvas.toDataURL('image/png', 1.0);

      const ratio = box.width / box.height;
      const landscape = ratio >= 1;
      const longMm = 420;
      const shortMm = Math.max(297, Math.round(longMm / Math.max(ratio, 1 / ratio)));
      const pageW = landscape ? longMm : shortMm;
      const pageH = landscape ? shortMm : longMm;
      const pdf = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: [pageH, pageW], compress: true });
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');
      const blob = pdf.output('blob');
      const nameRoot = buildNameRoot(drawing);
      downloadBlob(`${nameRoot}.pdf`, blob);
      statusText.textContent = `PDF indirildi: ${nameRoot}.pdf`;
    } catch (err) {
      statusText.textContent = `PDF oluşturma hatası: ${err.message}`;
      window.alert(`PDF oluşturma hatası:
${err.message}`);
      console.error(err);
    } finally {
      preview.classList.remove('is-loading');
    }
  }

  function syncExpandButton() {
    const btn = $('expandPreviewBtn');
    if (!btn || !previewPanel) return;
    const expanded = document.fullscreenElement === previewPanel || previewPanel.classList.contains('is-expanded');
    btn.textContent = expanded ? 'Önizlemeyi Küçült' : 'Önizlemeyi Büyüt';
  }

  async function togglePreviewFullscreen() {
    if (!previewPanel) return;
    try {
      const isFs = document.fullscreenElement === previewPanel;
      if (isFs && document.exitFullscreen) await document.exitFullscreen();
      else if (!document.fullscreenElement && previewPanel.requestFullscreen) await previewPanel.requestFullscreen();
      else previewPanel.classList.toggle('is-expanded');
    } catch (err) {
      previewPanel.classList.toggle('is-expanded');
    }
    syncExpandButton();
  }

  function resetForm() {
    fillInitial();
    updatePreview();
  }

  function n(id) {
    const value = $(id).value;
    if (value === '') return null;
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function setValue(id, value, digits = 0) {
    if (value === null || value === undefined || !Number.isFinite(value)) return;
    $(id).value = Number(value).toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  function calculateMissing() {
    const angle = $('calcAngle').value;
    const opening = $('calcOpening').value;
    const rear = $('calcRear').value;
    const front = $('calcFront').value;
    try {
      const br = window.PulumurExcelBridge;
      const result = br.calculateSystem({ angle, opening, rear, front });
      lastCalc = result;

      const ids = ['calcAngle', 'calcOpening', 'calcRear', 'calcFront'];
      const targetId = ids[result.missingIndex];
      $(targetId).value = result.resultText;
      $('calcResult').textContent = `Sonuç (${result.pozSay} poz): ${result.resultText}`;
      return result;
    } catch (err) {
      $('calcResult').textContent = err.message;
      lastCalc = null;
      return null;
    }
  }

  function transferCalc() {
    const result = lastCalc || calculateMissing();
    if (!result) return;
    const ids = ['calcAngle', 'calcOpening', 'calcRear', 'calcFront'];
    // Excel "Değerleri Hücrelere Aktar" davranışına web karşılığı:
    // Açılım / Arka Yükseklik / Ön Yükseklik ana forma aktarılır.
    if ($('calcOpening').value) $('opening').value = $('calcOpening').value;
    if ($('calcRear').value) $('rearHeight').value = $('calcRear').value;
    if ($('calcFront').value) $('frontHeight').value = $('calcFront').value;
    updatePreview();
    $('calculatorDialog').close();
  }

  function clearCalc() {
    ['calcAngle', 'calcOpening', 'calcRear', 'calcFront'].forEach(id => { $(id).value = ''; });
    $('calcResult').textContent = 'Sonuç bekleniyor.';
    lastCalc = null;
  }

  function openCalculator() {
    $('calcOpening').value = $('opening').value || '';
    $('calcRear').value = $('rearHeight').value || '';
    $('calcFront').value = $('frontHeight').value || '';
    $('calcAngle').value = '';
    $('calcResult').textContent = 'Ana formdaki açılım / arka / ön değerleri aktarıldı. Açıyı hesaplamak için Hesapla’ya bas.';
    $('calculatorDialog').showModal();
  }

  function showHelp() {
    const dialog = $('helpDialog');
    const box = $('helpContent');
    if (dialog && box) {
      box.textContent = window.PulumurExcelBridge ? window.PulumurExcelBridge.HELP_TEXT : 'Yardım içeriği yüklenemedi.';
      dialog.showModal();
    } else {
      alert(window.PulumurExcelBridge ? window.PulumurExcelBridge.HELP_TEXT : 'Yardım içeriği yüklenemedi.');
    }
  }

  function bindEvents() {
    $('generateBtn').addEventListener('click', generateDxf);
    $('pdfBtn').addEventListener('click', () => { void generatePdf(); });
    $('previewBtn').addEventListener('click', updatePreview);
    $('resetBtn').addEventListener('click', resetForm);
    $('expandPreviewBtn').addEventListener('click', () => { void togglePreviewFullscreen(); });
    $('calcBtn').addEventListener('click', openCalculator);
    $('helpBtn').addEventListener('click', showHelp);
    $('calcComputeBtn').addEventListener('click', () => {
      try { calculateMissing(); } catch (err) { $('calcResult').textContent = err.message; }
    });
    $('calcTransferBtn').addEventListener('click', () => {
      try { transferCalc(); } catch (err) { $('calcResult').textContent = err.message; }
    });
    $('calcClearBtn').addEventListener('click', clearCalc);
    ids.forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('change', updatePreview);
      el.addEventListener('input', () => {
        if (wrappingFields) return;
        autosizeTextarea(el);
        if (id === 'rayCount' || id === 'postCount') {
          el.dataset.userEdited = String(el.value || '').trim() ? 'true' : 'false';
          if (id === 'rayCount' && $('postCount') && $('postCount').dataset.userEdited !== 'true') {
            const raw = collectForm();
            const br = window.PulumurExcelBridge;
            if (br && br.postCountFromRayText) $('postCount').value = br.postCountFromRayText(el.value, raw.systemCount, raw.width, raw.frontHeight);
          }
        }
        if (['systemCount', 'width', 'frontHeight'].includes(id)) {
          applyAutoRayPost(false);
        }
        window.clearTimeout(el._previewTimer);
        el._previewTimer = window.setTimeout(updatePreview, 350);
      });
    });
  }

  document.addEventListener('fullscreenchange', syncExpandButton);
  fillInitial();
  bindEvents();
  updatePreview();
  syncExpandButton();
})();
