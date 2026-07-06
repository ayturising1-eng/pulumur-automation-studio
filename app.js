(function () {
  'use strict';

  const ids = [
    'product', 'moduleName', 'engine', 'customer', 'project', 'version', 'drawnBy', 'date',
    'systemCount', 'width', 'opening', 'rearHeight', 'frontHeight', 'rayCount', 'postCount',
    'parapet', 'parapetHeight', 'glassTrack', 'structureColor', 'fabric', 'fabricProfiles',
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
  }

  function collectForm() {
    return ids.reduce((acc, id) => {
      const el = $(id);
      if (!el) return acc;
      acc[id] = el.value;
      return acc;
    }, {});
  }

  function validateInput(d) {
    const missing = [];
    if (!d.width || Number(d.width) <= 0) missing.push('Genişlik');
    if (!d.opening || Number(d.opening) <= 0) missing.push('Açılım');
    if (!d.rearHeight || Number(d.rearHeight) <= 0) missing.push('Arka yükseklik');
    if (!d.frontHeight || Number(d.frontHeight) <= 0) missing.push('Ön yükseklik');
    if (!d.rayCount || Number(d.rayCount) <= 0) missing.push('Ray sayısı');
    if (missing.length) throw new Error(`${missing.join(', ')} alanlarını doldur.`);
  }

  function updatePreview() {
    try {
      const data = collectForm();
      validateInput(data);
      const drawing = window.PulumurGeometry.buildDrawing(data);
      lastDrawing = drawing;
      preview.innerHTML = window.PulumurGeometry.renderSvg(drawing);
      const d = drawing.input;
      statusText.textContent = `Hazır: ${Math.round(d.width)} × ${Math.round(d.opening)} mm, ${d.rayCount} ray, ${d.postCount} dikme, açı ${window.PulumurGeometry.formatDeg(d.angle)}.`;
      return drawing;
    } catch (err) {
      preview.innerHTML = '<div class="empty-state">Önizleme için zorunlu ölçüleri doldur.</div>';
      statusText.textContent = err.message;
      return null;
    }
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'application/dxf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function generateDxf() {
    const drawing = updatePreview();
    if (!drawing) return;
    const dxf = window.PulumurDXF.toDxf(drawing);
    const nameRoot = window.PulumurDXF.safeFileName(`${drawing.input.project}-${drawing.input.product}-v${drawing.input.version}`);
    downloadText(`${nameRoot}.dxf`, dxf);
    statusText.textContent = `DXF indirildi: ${nameRoot}.dxf`;
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
    const angle = n('calcAngle');
    const opening = n('calcOpening');
    const rear = n('calcRear');
    const front = n('calcFront');
    const values = [angle, opening, rear, front];
    const filled = values.filter(v => v !== null).length;
    if (filled !== 3) {
      $('calcResult').textContent = 'Tam olarak 3 değer gir; boş bırakılan 4. değer hesaplanır.';
      lastCalc = null;
      return null;
    }

    let result = { angle, opening, rear, front };
    if (angle === null) {
      result.angle = Math.atan2(rear - front, opening) * 180 / Math.PI;
    } else if (opening === null) {
      const t = Math.tan(angle * Math.PI / 180);
      if (Math.abs(t) < 1e-9) throw new Error('Açı 0° ise açılım hesaplanamaz.');
      result.opening = (rear - front) / t;
    } else if (rear === null) {
      result.rear = front + opening * Math.tan(angle * Math.PI / 180);
    } else if (front === null) {
      result.front = rear - opening * Math.tan(angle * Math.PI / 180);
    }

    if (![result.angle, result.opening, result.rear, result.front].every(Number.isFinite)) {
      throw new Error('Hesap sonucu geçersiz. Değerleri kontrol et.');
    }
    if (result.opening <= 0 || result.rear <= 0 || result.front <= 0) {
      throw new Error('Hesap sonucu negatif veya sıfır çıktı. Değerleri kontrol et.');
    }

    lastCalc = result;
    setValue('calcAngle', result.angle, 3);
    setValue('calcOpening', result.opening, 0);
    setValue('calcRear', result.rear, 0);
    setValue('calcFront', result.front, 0);
    $('calcResult').textContent = `Sonuç: açı ${result.angle.toFixed(3)}°, açılım ${Math.round(result.opening)} mm, arka ${Math.round(result.rear)} mm, ön ${Math.round(result.front)} mm.`;
    return result;
  }

  function transferCalc() {
    const result = lastCalc || calculateMissing();
    if (!result) return;
    setValue('opening', result.opening, 0);
    setValue('rearHeight', result.rear, 0);
    setValue('frontHeight', result.front, 0);
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
    alert('Pülümür Automation Studio Web DXF MVP\n\n1) Sistem ölçülerini gir.\n2) Önizlemeyi kontrol et.\n3) DXF Oluştur ve İndir butonuna bas.\n\nBu sürüm tek poz içindir. DWG blokların birebir aktarımı ve çoklu poz sonraki aşamadadır.');
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
        window.clearTimeout(el._previewTimer);
        el._previewTimer = window.setTimeout(updatePreview, 350);
      });
    });
  }

  fillInitial();
  bindEvents();
  updatePreview();
})();
