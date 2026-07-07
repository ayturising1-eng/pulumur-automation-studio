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
  let lastDrawing = null;
  let lastCalc = null;

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
      acc[id] = el.value;
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

  function updatePreview() {
    try {
      applyAutoRayPost(false);
      const data = collectForm();
      validateInput(data);
      const drawing = window.PulumurGeometry.buildDrawing(data);
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

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'application/dxf;charset=utf-8' });
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

  function generateDxf() {
    try {
      const drawing = updatePreview();
      if (!drawing) return;
      if (!window.PulumurDXF || typeof window.PulumurDXF.toDxf !== 'function') {
        throw new Error('DXF motoru yüklenemedi. GitHub’a dxfEngine.js ve blocks klasörünü yüklediğinden emin ol.');
      }
      const dxf = window.PulumurDXF.toDxf(drawing);
      if (!dxf || dxf.length < 100) throw new Error('DXF içeriği boş oluştu.');
      const nameRoot = window.PulumurDXF.safeFileName(`${drawing.input.project}-${drawing.input.product}-web-dxf-v8_2_2-top-oluk-triangle-side-mirror-v${drawing.input.version}`);
      downloadText(`${nameRoot}.dxf`, dxf);
      statusText.textContent = `DXF indirildi: ${nameRoot}.dxf`;
    } catch (err) {
      statusText.textContent = `DXF oluşturma hatası: ${err.message}`;
      window.alert(`DXF oluşturma hatası:\n${err.message}`);
      console.error(err);
    }
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
    $('previewBtn').addEventListener('click', updatePreview);
    $('resetBtn').addEventListener('click', resetForm);
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

  fillInitial();
  bindEvents();
  updatePreview();
})();
