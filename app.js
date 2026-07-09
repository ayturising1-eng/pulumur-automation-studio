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

  const BOOLEAN_FIELD_IDS = ['parapet', 'glassTrack', 'triangleJoinery', 'waterStandard'];
  const BOOLEAN_CANONICAL = {
    EVET: { tr: 'EVET', en: 'YES' },
    HAYIR: { tr: 'HAYIR', en: 'NO' }
  };
  let currentLanguage = 'tr';
  let deferredInstallPrompt = null;

  let wrappingFields = false;
  const previewState = { zoom: 1, baseScale: 1, minZoom: 0.20, maxZoom: 18, dragActive: false, dragStartX: 0, dragStartY: 0, dragScrollLeft: 0, dragScrollTop: 0, pointerId: null };
  const EXCEL_COMBO_OPTIONS = {
    motor: ['-', 'RISING MOTOR', 'SOMFY RTS', 'SOMFY IO'],
    fabric: [
      '-',
      'C 1602 - 3D (8118-1622)',
      'C 3017 - 3D',
      'C 3105 - 3D',
      'C 6001 - 3D',
      'C 7019 - 3D (8118-7024)',
      'C 7075 - 3D (8118-7340)',
      'C 7995 - 3D (8118-7999)',
      'C 9012 - 3D (8118-9002)',
      'C 1602 - M (8116-1622)',
      'C 1638 - M',
      'C 7009 - M',
      'C 9012 - M (8116-9002)',
      'C 1602 - K (8290-1622)',
      'C 9012 - D (8290-9002)'
    ]
  };
  const REMOTE_OPTIONS_BY_MOTOR = {
    'RISING MOTOR': ['-', 'RISING 6 CHANNELS'],
    'SOMFY RTS': ['-', 'SITUO 2 RTS', 'SITUO 5 RTS', 'TELIS 16 RTS'],
    'SOMFY IO': ['-', 'SITUO 2 IO', 'SITUO 5 IO'],
    '-': ['-'],
    '': ['-']
  };
  const EXCEL_DEFAULT_INPUT = {
    product: 'Pergo Rise', moduleName: 'Module 1', engine: 'Web DXF',
    customer: '', project: '', version: '01', drawnBy: 'AYETULLAH KILINC', date: '',
    systemCount: '', width: '', opening: '', rearHeight: '', frontHeight: '', rayCount: '', postCount: '',
    parapet: 'HAYIR', parapetHeight: '-', glassTrack: 'HAYIR', sideTrack: 'HAYIR',
    structureColor: '-', fabric: '-', fabricProfiles: '-', motor: '-', remote: '-', led: '-', dimmer: '-', extras: '-',
    triangleJoinery: 'HAYIR', waterStandard: 'EVET'
  };

  const UI_TEXT = {
    tr: {
      langLabel: 'Dil', helpBtn: 'Yardım', installBtn: 'Ana Ekrana Ekle',
      appTitleMain: 'Pülümür Automation Studio', appTitleSub: '| Parametrik Çizim ve Proje Otomasyonu | Hazırlayan / Geliştiren : Ayetullah KILINÇ',
      labelProduct: 'Ürün', labelModule: 'Modül', labelEngine: 'Çizim Motoru',
      legendProject: 'Proje Bilgileri', legendSystem: 'Sistem Ölçüleri <b>*(mm)</b>', legendOptions: 'Opsiyonlar', legendExtra: 'Ek Opsiyonlar',
      labelSystemCount: 'Sistem Adedi', labelWidth: 'Genişlik', labelOpening: 'Açılım',
      labelRearHeight: 'Arka H', labelFrontHeight: 'Ön H <em>Oluk Altı</em>',
      labelRayCount: 'Ray Sayısı <b>Bir Sistem</b>', labelPostCount: 'Dikme Sayısı <b>Tüm Sistem</b>',
      project_customer: 'Müşteri', project_project: 'Proje', project_version: 'Versiyon', project_drawnBy: 'Çizen', project_date: 'Tarih',
      options_parapet: 'Parapet', options_parapetHeight: 'Parapet H <b>*(mm)</b>', options_glassTrack: 'Cam Kaydı',
      options_structureColor: 'Structure Color', options_fabric: 'Fabric', options_fabricProfiles: 'Fabric Profiles',
      options_motor: 'Motor', options_remote: 'Remote', options_led: 'LED', options_dimmer: 'Dimmer', options_extras: 'Extras / Notes',
      extra_triangleJoinery: 'Üçgen Doğrama', extra_waterStandard: 'Su Çıkışı Standart mı?', quickTestsHead: 'Hızlı Testler',
      previewTitle: 'Çizim Ön İzleme', previewBtn: 'Önizlemeyi Yenile', expandPreviewBtn: 'Önizlemeyi Büyüt', fitPreviewBtn: 'Çizimi Sığdır', shrinkPreviewBtn: 'Önizlemeyi Küçült',
      pdfBtn: 'PDF İndir', generateBtn: 'DXF İndir', resetBtn: 'Değerleri Resetle', calcBtn: 'Pülümür Hesaplayıcı',
      calcTitle: 'Pülümür Hesaplayıcı', calcSub: '4 satırdan herhangi 3 tanesini doldur. Boş olan değer hesaplanır.',
      calcGuide: '<strong>TR</strong><ul><li>4 alandan 3 tanesini doldur.</li><li>Hesaplanacak alanı boş bırak.</li><li>Hesapla’ya bas.</li><li>Sonucu ana forma aktar.</li></ul>',
      calcWaiting: 'Sonuç bekleniyor.', calcReady: 'Sonuç', calcPoz: 'poz', calcOpenNote: 'Ana formdaki açılım / arka / ön değerleri aktarıldı. Açıyı hesaplamak için Hesapla’ya bas.',
      calcAngleLabel: 'Sistem Açısı (°)', calcOpeningLabel: 'Açılım *(mm)', calcRearLabel: 'Arka H *(mm)', calcFrontLabel: 'Ön H *(mm)',
      calcComputeBtn: 'Hesapla', calcTransferBtn: 'Sonucu Hücrelere Aktar', calcClearBtn: 'Sıfırla', helpTitle: 'Yardım / Kullanım Kılavuzu', helpCloseBtn: 'Kapat', emptyPreview: 'Önizleme için zorunlu ölçüleri doldur.',
      placeholders: {
        systemCount: 'Örn. 1', width: 'Örn. 4000 veya 3000;100;2500;NO', opening: 'Örn. 6000 veya 4500;5200', rearHeight: 'Örn. 3200 veya 3200;3400', frontHeight: 'Örn. 2600',
        rayCount: 'Örn. 2 veya 2;3;2', postCount: 'Örn. 2 veya boş: otomatik', calcAngle: 'Örn. 4.16 veya boş', calcOpening: 'Örn. 4500;5200 veya boş', calcRear: 'Örn. 3200;3400 veya boş', calcFront: 'Örn. 2600 veya boş'
      }
    },
    en: {
      langLabel: 'Language', helpBtn: 'Help', installBtn: 'Add to Home Screen',
      appTitleMain: 'Pülümür Automation Studio', appTitleSub: '| Parametric Drawing and Project Automation | Prepared / Developed by: Ayetullah KILINÇ',
      labelProduct: 'Product', labelModule: 'Module', labelEngine: 'Drawing Engine',
      legendProject: 'Project Info', legendSystem: 'System Dimensions <b>*(mm)</b>', legendOptions: 'Options', legendExtra: 'Extra Options',
      labelSystemCount: 'System Count', labelWidth: 'Width', labelOpening: 'Projection',
      labelRearHeight: 'Rear H', labelFrontHeight: 'Front H <em>Gutter Bottom</em>',
      labelRayCount: 'Rail Count <b>Per System</b>', labelPostCount: 'Post Count <b>All Systems</b>',
      project_customer: 'Customer', project_project: 'Project', project_version: 'Version', project_drawnBy: 'Drawn By', project_date: 'Date',
      options_parapet: 'Parapet', options_parapetHeight: 'Parapet H <b>*(mm)</b>', options_glassTrack: 'Glass Gable',
      options_structureColor: 'Structure Color', options_fabric: 'Fabric', options_fabricProfiles: 'Fabric Profiles',
      options_motor: 'Motor', options_remote: 'Remote', options_led: 'LED', options_dimmer: 'Dimmer', options_extras: 'Extras / Notes',
      extra_triangleJoinery: 'Triangle Joinery', extra_waterStandard: 'Standard Water Outlet?', quickTestsHead: 'Quick Tests',
      previewTitle: 'Drawing Preview', previewBtn: 'Refresh Preview', expandPreviewBtn: 'Expand Preview', fitPreviewBtn: 'Fit Drawing', shrinkPreviewBtn: 'Collapse Preview',
      pdfBtn: 'Download PDF', generateBtn: 'Download DXF', resetBtn: 'Reset Values', calcBtn: 'Pulumur Calculator',
      calcTitle: 'Pulumur Calculator', calcSub: 'Fill any 3 of the 4 rows. The empty value will be calculated.',
      calcGuide: '<strong>EN</strong><ul><li>Fill 3 of the 4 fields.</li><li>Leave one field empty.</li><li>Click Calculate.</li><li>Transfer the result to the main form.</li></ul>',
      calcWaiting: 'Waiting for result.', calcReady: 'Result', calcPoz: 'position', calcOpenNote: 'Projection / rear H / front H values were copied from the main form. Click Calculate to calculate the angle.',
      calcAngleLabel: 'System Angle (°)', calcOpeningLabel: 'Projection *(mm)', calcRearLabel: 'Rear H *(mm)', calcFrontLabel: 'Front H *(mm)',
      calcComputeBtn: 'Calculate', calcTransferBtn: 'Transfer Result', calcClearBtn: 'Clear', helpTitle: 'Help / User Guide', helpCloseBtn: 'Close', emptyPreview: 'Fill the required dimensions for preview.',
      placeholders: {
        systemCount: 'Ex. 1', width: 'Ex. 4000 or 3000;100;2500;NO', opening: 'Ex. 6000 or 4500;5200', rearHeight: 'Ex. 3200 or 3200;3400', frontHeight: 'Ex. 2600',
        rayCount: 'Ex. 2 or 2;3;2', postCount: 'Ex. 2 or blank: auto', calcAngle: 'Ex. 4.16 or blank', calcOpening: 'Ex. 4500;5200 or blank', calcRear: 'Ex. 3200;3400 or blank', calcFront: 'Ex. 2600 or blank'
      }
    }
  };

  const QUICK_TEST_PRESETS = [
    { name: 'Test 1', title: '1 adet · 2 ray · aynı ölçüler · otomatik dikme', values: { customer: 'TEST', project: 'TEST 1', systemCount: '1', width: '4000', opening: '4500', rearHeight: '3200', frontHeight: '2600' } },
    { name: 'Test 2', title: '1 adet · Cam kaydı EVET · 8060 => 3 ray', values: { customer: 'TEST', project: 'TEST 2', systemCount: '1', width: '8060', opening: '4500', rearHeight: '3200', frontHeight: '2600', glassTrack: 'EVET' } },
    { name: 'Test 3', title: '2 adet · aynı genişlik · 2;2 ray', values: { customer: 'TEST', project: 'TEST 3', systemCount: '2', width: '3000;3000', opening: '4500;4500', rearHeight: '3200;3200', frontHeight: '2600' } },
    { name: 'Test 4', title: '2 adet · farklı genişlik/açılım · Cam kaydı EVET', values: { customer: 'TEST', project: 'TEST 4', systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', glassTrack: 'EVET' } },
    { name: 'Test 5', title: '2 adet · NO boşluk modu', values: { customer: 'TEST', project: 'TEST 5', systemCount: '2', width: '3000;100;3000;NO', opening: '4500;4500', rearHeight: '3200;3200', frontHeight: '2600' } },
    { name: 'Test 6', title: '3 adet · aynı açılım · otomatik', values: { customer: 'TEST', project: 'TEST 6', systemCount: '3', width: '3200;3200;3200', opening: '4500;4500;4500', rearHeight: '3200;3200;3200', frontHeight: '2600' } },
    { name: 'Test 7', title: '3 adet · farklı genişlik/açılım/arka yükseklik', values: { customer: 'TEST', project: 'TEST 7', systemCount: '3', width: '4000;4500;5000', opening: '4500;5200;6000', rearHeight: '3200;3400;3600', frontHeight: '2600' } },
    { name: 'Test 8', title: '3 adet · dikme sayısı otomatikten 2 eksik', values: { customer: 'TEST', project: 'TEST 8', systemCount: '3', width: '4000;4500;5000', opening: '4500;5200;6000', rearHeight: '3200;3400;3600', frontHeight: '2600', postCount: '4' } },
    { name: 'Test 9', title: '5 adet · aynı genişlik/açılım', values: { customer: 'TEST', project: 'TEST 9', systemCount: '5', width: '4000;4000;4000;4000;4000', opening: '4500;4500;4500;4500;4500', rearHeight: '3200;3200;3200;3200;3200', frontHeight: '2600' } },
    { name: 'Test 10', title: '5 adet · farklı genişlik/açılım · 3 raylar', values: { customer: 'TEST', project: 'TEST 10', systemCount: '5', width: '6000;6200;6400;6600;6800', opening: '4500;4600;4700;4800;4900', rearHeight: '3200;3300;3400;3500;3600', frontHeight: '2600' } },
    { name: 'Test 11', title: '7 adet · aynı genişlik · 2 raylar', values: { customer: 'TEST', project: 'TEST 11', systemCount: '7', width: '3000;3000;3000;3000;3000;3000;3000', opening: '4500;4500;4500;4500;4500;4500;4500', rearHeight: '3200;3200;3200;3200;3200;3200;3200', frontHeight: '2600' } },
    { name: 'Test 12', title: '7 adet · farklı genişlik · karışık 2/3 ray', values: { customer: 'TEST', project: 'TEST 12', systemCount: '7', width: '4000;4200;4400;4600;4800;5000;5200', opening: '4500;4550;4600;4650;4700;4750;4800', rearHeight: '3200;3250;3300;3350;3400;3450;3500', frontHeight: '2600' } },
    { name: 'Test 13', title: 'Parapet EVET · 600 mm', values: { customer: 'TEST', project: 'TEST 13', systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', parapet: 'EVET', parapetHeight: '600' } },
    { name: 'Test 14', title: 'Üçgen doğrama EVET', values: { customer: 'TEST', project: 'TEST 14', systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', triangleJoinery: 'EVET' } },
    { name: 'Test 15', title: 'Su çıkışı standart HAYIR', values: { customer: 'TEST', project: 'TEST 15', systemCount: '2', width: '4000;4500', opening: '4500;5200', rearHeight: '3200;3400', frontHeight: '2600', waterStandard: 'HAYIR' } },
    { name: 'Test 16', title: 'Kombine test · parapet+cam+üçgen', values: { customer: 'TEST', project: 'TEST 16', systemCount: '3', width: '4000;4500;5000', opening: '4500;5200;6000', rearHeight: '3200;3400;3600', frontHeight: '2600', parapet: 'EVET', parapetHeight: '600', glassTrack: 'EVET', triangleJoinery: 'EVET', waterStandard: 'HAYIR' } }
  ];

  function today() {
    return new Date().toISOString().slice(0, 10);
  }
  function normalizeYesNo(value) {
    const upper = String(value ?? '').trim().toLocaleUpperCase('tr-TR');
    if (['EVET', 'YES'].includes(upper)) return 'EVET';
    if (['HAYIR', 'HAYR', 'NO'].includes(upper)) return 'HAYIR';
    return String(value ?? '').trim();
  }

  function setBooleanSelectTexts(lang) {
    BOOLEAN_FIELD_IDS.forEach(id => {
      const el = $(id);
      if (!el) return;
      Array.from(el.options).forEach(opt => {
        const canonical = normalizeYesNo(opt.value || opt.textContent);
        if (BOOLEAN_CANONICAL[canonical]) opt.textContent = BOOLEAN_CANONICAL[canonical][lang];
      });
    });
  }

  function setText(id, value, html = false) {
    const el = $(id);
    if (!el) return;
    if (html) el.innerHTML = value; else el.textContent = value;
  }

  function labelSpan(id) {
    const el = $(id);
    const label = el && el.closest('label');
    return label ? label.querySelector('span') : null;
  }

  function translateUI(lang) {
    currentLanguage = (lang === 'en') ? 'en' : 'tr';
    const txt = UI_TEXT[currentLanguage];
    document.documentElement.lang = currentLanguage;
    setText('langLabel', txt.langLabel);
    setText('helpBtn', txt.helpBtn);
    setText('installBtn', txt.installBtn);
    setText('appTitleMain', txt.appTitleMain);
    setText('appTitleSub', txt.appTitleSub);
    setText('labelProduct', txt.labelProduct);
    setText('labelModule', txt.labelModule);
    setText('labelEngine', txt.labelEngine);
    setText('legendProject', txt.legendProject);
    setText('legendSystem', txt.legendSystem, true);
    setText('legendOptions', txt.legendOptions);
    setText('legendExtra', txt.legendExtra);
    setText('labelSystemCount', txt.labelSystemCount);
    setText('labelWidth', txt.labelWidth, true);
    setText('labelOpening', txt.labelOpening, true);
    setText('labelRearHeight', txt.labelRearHeight, true);
    setText('labelFrontHeight', txt.labelFrontHeight, true);
    setText('labelRayCount', txt.labelRayCount, true);
    setText('labelPostCount', txt.labelPostCount, true);
    const projectMap = {customer:'project_customer', project:'project_project', version:'project_version', drawnBy:'project_drawnBy', date:'project_date'};
    Object.entries(projectMap).forEach(([id,key]) => { const s=labelSpan(id); if (s) s.textContent = txt[key]; });
    const optionMap = {parapet:'options_parapet', parapetHeight:'options_parapetHeight', glassTrack:'options_glassTrack', structureColor:'options_structureColor', fabric:'options_fabric', fabricProfiles:'options_fabricProfiles', motor:'options_motor', remote:'options_remote', led:'options_led', dimmer:'options_dimmer', extras:'options_extras', triangleJoinery:'extra_triangleJoinery'};
    Object.entries(optionMap).forEach(([id,key]) => { const s=labelSpan(id); if (s) { if (key.endsWith('Height')) s.innerHTML = txt[key]; else s.textContent = txt[key]; } });
    setText('labelWaterStandard', txt.extra_waterStandard);
    setText('quickTestsHead', txt.quickTestsHead);
    setText('previewTitle', txt.previewTitle);
    setText('previewBtn', txt.previewBtn);
    const expandText = (document.fullscreenElement === previewPanel || previewPanel.classList.contains('is-expanded')) ? txt.shrinkPreviewBtn : txt.expandPreviewBtn;
    setText('expandPreviewBtn', expandText);
    setText('fitPreviewBtn', txt.fitPreviewBtn);
    setText('pdfBtn', txt.pdfBtn);
    setText('generateBtn', txt.generateBtn);
    setText('resetBtn', txt.resetBtn);
    setText('calcBtn', txt.calcBtn);
    setText('calcTitle', txt.calcTitle);
    setText('calcSub', txt.calcSub);
    setText('calcGuide', txt.calcGuide, true);
    const calcMap = {calcAngle:'calcAngleLabel', calcOpening:'calcOpeningLabel', calcRear:'calcRearLabel', calcFront:'calcFrontLabel'};
    Object.entries(calcMap).forEach(([id,key]) => { const s=labelSpan(id); if (s) s.textContent = txt[key]; });
    setText('calcComputeBtn', txt.calcComputeBtn);
    setText('calcTransferBtn', txt.calcTransferBtn);
    setText('calcClearBtn', txt.calcClearBtn);
    setText('helpTitle', txt.helpTitle);
    const helpClose = document.querySelector('#helpDialog .modal-actions button');
    if (helpClose) helpClose.textContent = txt.helpCloseBtn;
    Object.entries(txt.placeholders).forEach(([id,val]) => { if ($(id)) $(id).placeholder = val; });
    setBooleanSelectTexts(currentLanguage);
    try { localStorage.setItem('pulumur_lang', currentLanguage); } catch (e) {}
  }

  function setupPwaInstall() {
    const btn = $('installBtn');
    if (!btn) return;
    btn.hidden = false;
    window.addEventListener('beforeinstallprompt', evt => {
      evt.preventDefault();
      deferredInstallPrompt = evt;
      btn.hidden = false;
    });
    btn.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        try { await deferredInstallPrompt.userChoice; } catch (e) {}
        deferredInstallPrompt = null;
        return;
      }
      const isEn = currentLanguage === 'en';
      window.alert(isEn
        ? 'To use it like an app: open the browser menu and choose “Install app” or “Add to Home screen”.'
        : 'Uygulama gibi kullanmak için tarayıcı menüsünden “Uygulamayı yükle” veya “Ana ekrana ekle” seçeneğini kullan.');
    });
    window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; });
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=8.2.55').catch(() => {}), { once: true });
    }
  }


  function fillInitial() {
    const d = { ...EXCEL_DEFAULT_INPUT, date: today() };
    ids.forEach(id => {
      if ($(id) && d[id] !== undefined) $(id).value = d[id];
    });
    if ($('date')) $('date').value = d.date;
    updateRemoteOptions(false);
    ['rayCount', 'postCount'].forEach(id => {
      if ($(id)) $(id).dataset.userEdited = 'false';
    });
    applyAutoRayPost(true);
  }

  function applyAutoRayPost(force = false) {
    const br = window.PulumurExcelBridge;
    if (!br || typeof br.autoRayPostCount !== 'function') return;
    const raw = collectForm();
    const auto = br.autoRayPostCount(raw.systemCount, raw.width, raw.frontHeight, raw.glassTrack);
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
      let normalized = upperTableFieldIds.includes(id)
        ? String(value || '').replace(/\r\n/g, ' ').replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
        : value;
      if (BOOLEAN_FIELD_IDS.includes(id)) normalized = normalizeYesNo(normalized);
      acc[id] = normalized;
      return acc;
    }, { sideTrack: 'HAYIR' });
  }

  function firstNumber(value) {
    const token = String(value ?? '').split(';').map(s => s.trim()).find(s => s && s.toLocaleUpperCase('tr-TR') !== 'NO');
    const parsed = Number(String(token ?? '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function validateInput(d) {
    const txt = UI_TEXT[currentLanguage] || UI_TEXT.tr;
    const fieldNames = currentLanguage === 'en'
      ? { width: 'Width', opening: 'Projection', rearHeight: 'Rear H', frontHeight: 'Front H' }
      : { width: 'Genişlik', opening: 'Açılım', rearHeight: 'Arka H', frontHeight: 'Ön H' };
    const missing = [];
    if (firstNumber(d.width) <= 0) missing.push(fieldNames.width);
    if (firstNumber(d.opening) <= 0) missing.push(fieldNames.opening);
    if (firstNumber(d.rearHeight) <= 0) missing.push(fieldNames.rearHeight);
    if (firstNumber(d.frontHeight) <= 0) missing.push(fieldNames.frontHeight);
    if (missing.length) throw new Error(currentLanguage === 'en' ? `Fill: ${missing.join(', ')}.` : `${missing.join(', ')} alanlarını doldur.`);
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
      renderPreview(drawing, true);
      const d = drawing.input;
      statusText.textContent = `Hazır: Sayfa1 B1=${d.sayfa1 ? d.sayfa1.B1_width : Math.round(d.width)} | ${Math.round(d.opening)} mm açılım, ${d.systems.map(s => s.rayCount).join(';')} ray, ${d.postCount} dikme, açı ${window.PulumurGeometry.formatDeg(d.angle)}. Tekerlek ile zoom, sol tuş basılı sürükle ile pan.`;
      return drawing;
    } catch (err) {
      const txt = UI_TEXT[currentLanguage] || UI_TEXT.tr;
      preview.innerHTML = `<div class="empty-state">${escapeHtml(txt.emptyPreview)}</div>`;
      statusText.textContent = err.message;
      return null;
    }
  }

  function getPreviewStage() {
    return preview.querySelector('.preview-stage');
  }

  function getPreviewSvg() {
    return preview.querySelector('svg');
  }

  function getSvgViewBoxSize(svg) {
    const vb = svg && svg.viewBox && svg.viewBox.baseVal;
    return {
      width: Math.max(1, vb && vb.width ? vb.width : (svg ? (svg.clientWidth || 1000) : 1000)),
      height: Math.max(1, vb && vb.height ? vb.height : (svg ? (svg.clientHeight || 1000) : 1000))
    };
  }

  function computePreviewFitScale(svg) {
    const box = getSvgViewBoxSize(svg);
    const padding = 24;
    const availableW = Math.max(120, preview.clientWidth - padding * 2);
    const availableH = Math.max(120, preview.clientHeight - padding * 2);
    return Math.max(0.01, Math.min(availableW / box.width, availableH / box.height));
  }

  function applyPreviewScale() {
    const stage = getPreviewStage();
    const svg = getPreviewSvg();
    if (!stage || !svg) return;
    const box = getSvgViewBoxSize(svg);
    previewState.baseScale = computePreviewFitScale(svg);
    const totalScale = previewState.baseScale * previewState.zoom;
    stage.style.width = `${Math.max(80, box.width * totalScale)}px`;
    stage.style.height = `${Math.max(80, box.height * totalScale)}px`;
  }

  function renderPreview(drawing, resetZoom = true) {
    const svg = window.PulumurGeometry.renderSvg(drawing);
    preview.innerHTML = `<div class="preview-stage">${svg}</div>`;
    if (resetZoom) {
      previewState.zoom = 1;
      preview.scrollLeft = 0;
      preview.scrollTop = 0;
    }
    window.requestAnimationFrame(() => applyPreviewScale());
  }

  function fitPreview() {
    previewState.zoom = 1;
    preview.scrollLeft = 0;
    preview.scrollTop = 0;
    applyPreviewScale();
  }

  function setPreviewZoom(nextZoom, clientX, clientY) {
    const svg = getPreviewSvg();
    if (!svg) return;
    const rect = preview.getBoundingClientRect();
    const oldScale = Math.max(0.0001, previewState.baseScale * previewState.zoom);
    const localX = (clientX ?? (rect.left + rect.width / 2)) - rect.left;
    const localY = (clientY ?? (rect.top + rect.height / 2)) - rect.top;
    const worldX = (preview.scrollLeft + localX) / oldScale;
    const worldY = (preview.scrollTop + localY) / oldScale;
    previewState.zoom = Math.max(previewState.minZoom, Math.min(previewState.maxZoom, nextZoom));
    applyPreviewScale();
    const newScale = Math.max(0.0001, previewState.baseScale * previewState.zoom);
    preview.scrollLeft = Math.max(0, worldX * newScale - localX);
    preview.scrollTop = Math.max(0, worldY * newScale - localY);
  }

  function bindPreviewInteractions() {
    preview.addEventListener('wheel', evt => {
      if (!getPreviewSvg()) return;
      evt.preventDefault();
      const factor = evt.deltaY < 0 ? 1.14 : (1 / 1.14);
      setPreviewZoom(previewState.zoom * factor, evt.clientX, evt.clientY);
    }, { passive: false });

    preview.addEventListener('pointerdown', evt => {
      if (evt.button !== 0 || !getPreviewSvg()) return;
      previewState.dragActive = true;
      previewState.pointerId = evt.pointerId;
      previewState.dragStartX = evt.clientX;
      previewState.dragStartY = evt.clientY;
      previewState.dragScrollLeft = preview.scrollLeft;
      previewState.dragScrollTop = preview.scrollTop;
      preview.classList.add('is-dragging');
      if (preview.setPointerCapture) {
        try { preview.setPointerCapture(evt.pointerId); } catch (_) {}
      }
      evt.preventDefault();
    });

    preview.addEventListener('pointermove', evt => {
      if (!previewState.dragActive) return;
      preview.scrollLeft = previewState.dragScrollLeft - (evt.clientX - previewState.dragStartX);
      preview.scrollTop = previewState.dragScrollTop - (evt.clientY - previewState.dragStartY);
    });

    const stopDrag = evt => {
      if (evt && preview.releasePointerCapture && previewState.pointerId !== null) {
        try { preview.releasePointerCapture(previewState.pointerId); } catch (_) {}
      }
      previewState.dragActive = false;
      previewState.pointerId = null;
      preview.classList.remove('is-dragging');
    };

    preview.addEventListener('pointerup', stopDrag);
    preview.addEventListener('pointercancel', stopDrag);
    preview.addEventListener('dblclick', evt => {
      if (!getPreviewSvg()) return;
      const next = previewState.zoom < 1.6 ? Math.max(1.8, previewState.zoom * 1.6) : 1;
      setPreviewZoom(next, evt.clientX, evt.clientY);
    });
    window.addEventListener('resize', () => applyPreviewScale());
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
    return window.PulumurDXF.safeFileName(`${drawing.input.project}-${drawing.input.product}-web-dxf-v8_2_55-v${drawing.input.version}`);
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

  function hexToRgb(hex) {
    const clean = String(hex || '#000000').replace('#', '').trim();
    if (clean.length !== 6) return [0, 0, 0];
    const value = Number.parseInt(clean, 16);
    if (!Number.isFinite(value)) return [0, 0, 0];
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  const ACI_HEX = {
    1: '#ff0000',
    2: '#ffff00',
    3: '#00ff00',
    4: '#00ffff',
    5: '#0000ff',
    6: '#ff00ff',
    7: '#000000',
    8: '#808080',
    9: '#c0c0c0',
    42: '#ffbf00',
    130: '#00bf00',
    256: null
  };

  function aciColorToHex(color, fallback = '#000000') {
    if (window.PulumurGeometry && typeof window.PulumurGeometry.aciColorToHex === 'function') {
      return window.PulumurGeometry.aciColorToHex(color, fallback);
    }
    const n = Number(color);
    if (!Number.isFinite(n) || n === 256 || n === 0) return fallback;
    return ACI_HEX[n] || fallback;
  }

  function entityPdfColor(ent, st) {
    return aciColorToHex(ent && ent.color, (st && st.stroke) || '#000000');
  }

  function pdfPageForBounds(box) {
    const ratio = Math.max(0.1, Math.min(10, box.width / Math.max(1, box.height)));
    const landscape = ratio >= 1;
    return landscape
      ? { width: 1189, height: 841, orientation: 'landscape' }
      : { width: 841, height: 1189, orientation: 'portrait' };
  }

  function setPdfStroke(pdf, ent, layerStyle, scale) {
    const st = layerStyle[ent.layer] || layerStyle.OUTLINE || { stroke: '#000000', width: 1 };
    const [r, g, b] = hexToRgb(entityPdfColor(ent, st));
    pdf.setDrawColor(r, g, b);
    pdf.setTextColor(r, g, b);
    // DraftSight çıktısına yakın A0 görünümü: ince, vektörel ve keskin çizgi.
    const lw = Math.max(0.04, Math.min(0.30, (Number(st.width) || 1) * scale * 0.85));
    pdf.setLineWidth(lw);
    if (st.dash && typeof pdf.setLineDashPattern === 'function') {
      const dash = String(st.dash).split(/\s+/).map(Number).filter(Number.isFinite).map(v => Math.max(0.12, v * scale));
      pdf.setLineDashPattern(dash.length ? dash : [], 0);
    } else if (typeof pdf.setLineDashPattern === 'function') {
      pdf.setLineDashPattern([], 0);
    }
  }

  function writePdfText(pdf, ent, mx, my, scale) {
    const raw = String(ent.value || '');
    if (!raw) return;
    const fontMm = Math.max(0.75, (Number(ent.height) || 100) * scale);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(fontMm * 72 / 25.4);
    const align = ent.align === 'center' ? 'center' : (ent.align === 'right' ? 'right' : 'left');
    const lines = ent.type === 'mtext' ? raw.split('\\P') : [raw];
    lines.forEach((line, idx) => {
      pdf.text(line, mx(ent.x), my(ent.y) + idx * fontMm * 1.15, {
        align,
        baseline: 'middle',
        angle: -(Number(ent.rotation) || 0)
      });
    });
  }

  function drawVectorPdf(pdf, drawing, page, margin) {
    const flat = window.PulumurGeometry.flattenDrawingForExport
      ? window.PulumurGeometry.flattenDrawingForExport(drawing)
      : { entities: drawing.entities || [], bounds: window.PulumurGeometry.bounds(drawing.entities || []), layerStyle: drawing.layerStyle || window.PulumurGeometry.LAYER_STYLE };
    const box = flat.bounds;
    const usableW = Math.max(1, page.width - margin * 2);
    const usableH = Math.max(1, page.height - margin * 2);
    const scale = Math.min(usableW / Math.max(1, box.width), usableH / Math.max(1, box.height));
    const contentW = box.width * scale;
    const contentH = box.height * scale;
    const offsetX = (page.width - contentW) / 2 - box.minX * scale;
    const offsetY = (page.height - contentH) / 2 + box.maxY * scale;
    const mx = x => offsetX + x * scale;
    const my = y => offsetY - y * scale;
    const layerStyle = flat.layerStyle || window.PulumurGeometry.LAYER_STYLE;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, page.width, page.height, 'F');
    (flat.entities || []).forEach(ent => {
      setPdfStroke(pdf, ent, layerStyle, scale);
      if (ent.type === 'line') {
        pdf.line(mx(ent.x1), my(ent.y1), mx(ent.x2), my(ent.y2));
      } else if (ent.type === 'polyline') {
        const pts = ent.points || [];
        for (let i = 0; i < pts.length - 1; i += 1) pdf.line(mx(pts[i][0]), my(pts[i][1]), mx(pts[i + 1][0]), my(pts[i + 1][1]));
        if (ent.closed && pts.length > 2) pdf.line(mx(pts[pts.length - 1][0]), my(pts[pts.length - 1][1]), mx(pts[0][0]), my(pts[0][1]));
      } else if (ent.type === 'circle') {
        pdf.circle(mx(ent.x), my(ent.y), Math.abs(ent.r) * scale, 'S');
      } else if (ent.type === 'text' || ent.type === 'mtext') {
        writePdfText(pdf, ent, mx, my, scale);
      }
    });
    if (typeof pdf.setLineDashPattern === 'function') pdf.setLineDashPattern([], 0);
  }

  async function generatePdf() {
    preview.classList.add('is-loading');
    try {
      const drawing = updatePreview();
      if (!drawing) return;
      const jsPDF = await ensureJsPdf();
      if (!jsPDF) throw new Error('PDF kütüphanesi aktif değil.');
      const flat = window.PulumurGeometry.flattenDrawingForExport
        ? window.PulumurGeometry.flattenDrawingForExport(drawing)
        : { bounds: window.PulumurGeometry.bounds(drawing.entities || []) };
      const page = pdfPageForBounds(flat.bounds);
      const pdf = new jsPDF({ orientation: page.orientation, unit: 'mm', format: [page.width, page.height], compress: true, precision: 12, putOnlyUsedFonts: true });
      drawVectorPdf(pdf, drawing, page, 6);
      const blob = pdf.output('blob');
      const nameRoot = buildNameRoot(drawing);
      downloadBlob(`${nameRoot}.pdf`, blob);
      statusText.textContent = `PDF indirildi: ${nameRoot}.pdf`;
    } catch (err) {
      statusText.textContent = `PDF oluşturma hatası: ${err.message}`;
      window.alert(`PDF oluşturma hatası:\n${err.message}`);
      console.error(err);
    } finally {
      preview.classList.remove('is-loading');
    }
  }

  function syncExpandButton() {
    const btn = $('expandPreviewBtn');
    if (!btn || !previewPanel) return;
    const expanded = document.fullscreenElement === previewPanel || previewPanel.classList.contains('is-expanded');
    const txt = UI_TEXT[currentLanguage] || UI_TEXT.tr;
    btn.textContent = expanded ? txt.shrinkPreviewBtn : txt.expandPreviewBtn;
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
    window.setTimeout(() => applyPreviewScale(), 60);
    syncExpandButton();
  }

  function resetForm() {
    fillInitial();
    document.querySelectorAll('.quick-test-btn.active').forEach(btn => btn.classList.remove('active'));
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
      {
        const txt = UI_TEXT[currentLanguage] || UI_TEXT.tr;
        $('calcResult').textContent = `${txt.calcReady} (${result.pozSay} ${txt.calcPoz}): ${result.resultText}`;
      }
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
    $('calcResult').textContent = (UI_TEXT[currentLanguage] || UI_TEXT.tr).calcWaiting;
    lastCalc = null;
  }

  function openCalculator() {
    $('calcOpening').value = $('opening').value || '';
    $('calcRear').value = $('rearHeight').value || '';
    $('calcFront').value = $('frontHeight').value || '';
    $('calcAngle').value = '';
    $('calcResult').textContent = (UI_TEXT[currentLanguage] || UI_TEXT.tr).calcOpenNote;
    $('calculatorDialog').showModal();
  }

  const WEB_HELP_TEXT_TR = `WEB KULLANIM KILAVUZU
Pülümür Automation Studio, Pergo Rise Module 1 için DXF ve A0 PDF üretir.

1) Temel kullanım
- Proje bilgilerini yaz.
- Sistem ölçülerini mm olarak gir.
- Önizleme otomatik oluşur.
- PDF İndir veya DXF İndir butonlarını kullan.

2) Çoklu poz
- Değerleri noktalı virgül (;) ile ayır.
- Örnek genişlik: 4000;4500;5000
- Örnek açılım: 4500;5200;6000
- Tek değer yazarsan tüm pozlar için ortak kabul edilir.

3) NO modu
- Genişlikte sonuna ;NO yazabilirsin.
- Örnek: 3000;100;3000;NO
- Bu durumda aradaki 100 ara boşluktur.

4) Otomatik ray ve dikme
- Ray sayısı genişliğe göre otomatik gelir.
- Cam Kaydı EVET ise ray hesabı gerçek çizim genişliğine göre yapılır.
- Ray veya dikme sayısını manuel yazarsan o değer kullanılır.

5) Önizleme
- Mouse tekerleği ile yakınlaş / uzaklaş.
- Sol tuşa basılı tutup sürükle.
- Çizimi Sığdır ile tekrar ekrana oturt.

6) Dil
- Türkçe veya İngilizce seçebilirsin.`;

  const WEB_HELP_TEXT_EN = `WEB USER GUIDE
Pulumur Automation Studio creates DXF and A0 PDF files for Pergo Rise Module 1.

1) Basic use
- Write the project information.
- Enter the system dimensions in mm.
- The preview is created automatically.
- Use Download PDF or Download DXF.

2) Multiple positions
- Separate values with semicolon (;).
- Width example: 4000;4500;5000
- Projection example: 4500;5200;6000
- If you write one value, it is used for all positions.

3) NO mode
- In Width, you can write ;NO at the end.
- Example: 3000;100;3000;NO
- Here, 100 is the gap between systems.

4) Automatic rail and post count
- Rail count is calculated from the width.
- If Glass Gable is YES, the rail count uses the real drawing width.
- If you write rail or post count manually, your value is used.

5) Preview
- Use the mouse wheel to zoom in and out.
- Hold left mouse button and drag to move.
- Use Fit Drawing to fit the drawing again.

6) Language
- You can use Turkish or English.`;

  function showHelp() {
    const dialog = $('helpDialog');
    const box = $('helpContent');
    const text = currentLanguage === 'en' ? WEB_HELP_TEXT_EN : WEB_HELP_TEXT_TR;
    if (dialog && box) {
      box.textContent = text;
      dialog.showModal();
    } else {
      alert(text);
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function optionValuesForInput(input) {
    const key = input && input.dataset ? input.dataset.excelCombo : '';
    if (key === 'remote') {
      const motorValue = $('motor') ? $('motor').value : '-';
      const motorKey = String(motorValue || '-').trim().toLocaleUpperCase('tr-TR');
      return REMOTE_OPTIONS_BY_MOTOR[motorKey] || ['-'];
    }
    return key && EXCEL_COMBO_OPTIONS[key] ? EXCEL_COMBO_OPTIONS[key] : [];
  }

  function closeAllCombos(except) {
    document.querySelectorAll('.excel-combo.open').forEach(box => {
      if (box !== except) box.classList.remove('open');
    });
  }

  function buildComboMenu(input, box) {
    let menu = box.querySelector('.excel-combo-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'excel-combo-menu';
      box.appendChild(menu);
    }
    const values = optionValuesForInput(input);
    const current = String(input.value || '').trim().toLocaleUpperCase('tr-TR');
    menu.innerHTML = values.map(v => {
      const selected = String(v).trim().toLocaleUpperCase('tr-TR') === current ? ' selected' : '';
      return `<button type="button" class="excel-combo-option${selected}" data-value="${escapeHtml(v)}">${escapeHtml(v)}</button>`;
    }).join('') || '<div class="excel-combo-empty">Liste yok</div>';
    menu.querySelectorAll('.excel-combo-option').forEach(btn => {
      btn.addEventListener('mousedown', evt => evt.preventDefault());
      btn.addEventListener('click', () => {
        input.value = btn.dataset.value || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        box.classList.remove('open');
        input.focus();
      });
    });
  }

  function enhanceExcelCombos() {
    document.querySelectorAll('input[data-excel-combo]').forEach(input => {
      if (input.closest('.excel-combo')) return;
      const box = document.createElement('div');
      box.className = 'excel-combo';
      const parent = input.parentNode;
      parent.insertBefore(box, input);
      box.appendChild(input);
      input.setAttribute('autocomplete', 'off');
      input.classList.add('excel-combo-input');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'excel-combo-button';
      btn.setAttribute('aria-label', 'Listeyi aç');
      btn.textContent = '▾';
      box.appendChild(btn);
      const toggle = () => {
        const willOpen = !box.classList.contains('open');
        closeAllCombos(box);
        if (willOpen) {
          buildComboMenu(input, box);
          box.classList.add('open');
        } else {
          box.classList.remove('open');
        }
      };
      btn.addEventListener('click', evt => { evt.preventDefault(); toggle(); });
      input.addEventListener('focus', () => buildComboMenu(input, box));
      input.addEventListener('keydown', evt => {
        if (evt.key === 'ArrowDown' && evt.altKey) {
          evt.preventDefault();
          closeAllCombos(box);
          buildComboMenu(input, box);
          box.classList.add('open');
        } else if (evt.key === 'Escape') {
          box.classList.remove('open');
        }
      });
    });
    document.addEventListener('click', evt => {
      if (!evt.target.closest('.excel-combo')) closeAllCombos(null);
    });
  }

  function updateRemoteOptions(preserve = true) {
    const remoteEl = $('remote');
    if (!remoteEl) return;
    const options = optionValuesForInput(remoteEl);
    const previous = preserve ? String(remoteEl.value || '-') : '-';
    if (!preserve || !options.includes(previous)) remoteEl.value = '-';
    const box = remoteEl.closest('.excel-combo');
    if (box && box.classList.contains('open')) buildComboMenu(remoteEl, box);
  }

  function filterSemiNumeric(value, allowNo) {
    const src = String(value || '').toLocaleUpperCase('tr-TR');
    let out = '';
    let hasN = false;
    let hasO = false;
    for (const ch of src) {
      if (/[0-9;]/.test(ch)) {
        out += ch;
      } else if (allowNo && ch === 'N' && !hasN && !hasO) {
        out += 'N';
        hasN = true;
      } else if (allowNo && ch === 'O' && hasN && !hasO && out.endsWith('N')) {
        out += 'O';
        hasO = true;
      }
    }
    return out;
  }

  function applyPresetValues(values) {
    fillInitial();
    const deferredManual = {};
    Object.entries(values || {}).forEach(([id, value]) => {
      const el = $(id);
      if (!el) return;
      if (id === 'rayCount' || id === 'postCount') {
        deferredManual[id] = value;
        return;
      }
      el.value = value;
    });
    updateRemoteOptions(false);
    applyAutoRayPost(true);
    ['rayCount', 'postCount'].forEach(id => {
      if (!$(id)) return;
      $(id).dataset.userEdited = 'false';
    });
    if (deferredManual.rayCount !== undefined && $('rayCount')) {
      $('rayCount').value = deferredManual.rayCount;
      $('rayCount').dataset.userEdited = String(deferredManual.rayCount || '').trim() ? 'true' : 'false';
      if (deferredManual.postCount === undefined && $('postCount')) {
        const raw = collectForm();
        const br = window.PulumurExcelBridge;
        if (br && br.postCountFromRayText) $('postCount').value = br.postCountFromRayText($('rayCount').value, raw.systemCount, raw.width, raw.frontHeight);
      }
    }
    if (deferredManual.postCount !== undefined && $('postCount')) {
      $('postCount').value = deferredManual.postCount;
      $('postCount').dataset.userEdited = String(deferredManual.postCount || '').trim() ? 'true' : 'false';
    }
    updateRemoteOptions(true);
    updatePreview();
  }

  function renderQuickTests() {
    const host = $('quickTestsGrid');
    if (!host) return;
    host.innerHTML = QUICK_TEST_PRESETS.map((preset, index) => (
      `<button type="button" class="quick-test-btn" data-test-index="${index}" title="${escapeHtml(preset.title)}">${escapeHtml(preset.name)}</button>`
    )).join('');
    host.querySelectorAll('.quick-test-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.testIndex);
        const preset = QUICK_TEST_PRESETS[idx];
        if (!preset) return;
        host.querySelectorAll('.quick-test-btn').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        applyPresetValues(preset.values);
        statusText.textContent = `${preset.name} yüklendi: ${preset.title}`;
      });
    });
  }

  function bindStrictInputs() {
    const numericOnly = id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const clean = String(el.value || '').replace(/[^0-9]/g, '');
        if (el.value !== clean) el.value = clean;
      });
    };
    const semiNumeric = (id, allowNo = false) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const clean = filterSemiNumeric(el.value, allowNo);
        if (el.value !== clean) el.value = clean;
      });
    };
    numericOnly('parapetHeight');
    semiNumeric('width', true);
    ['opening', 'rearHeight', 'frontHeight', 'rayCount', 'postCount'].forEach(id => semiNumeric(id, false));
  }

  function bindEvents() {
    $('generateBtn').addEventListener('click', generateDxf);
    $('pdfBtn').addEventListener('click', () => { void generatePdf(); });
    $('previewBtn').addEventListener('click', updatePreview);
    $('resetBtn').addEventListener('click', resetForm);
    $('expandPreviewBtn').addEventListener('click', () => { void togglePreviewFullscreen(); });
    $('fitPreviewBtn').addEventListener('click', fitPreview);
    $('calcBtn').addEventListener('click', openCalculator);
    $('helpBtn').addEventListener('click', showHelp);
    $('languageSelect').addEventListener('change', evt => { translateUI(evt.target.value); updatePreview(); });
    $('motor').addEventListener('input', () => { updateRemoteOptions(true); });
    $('motor').addEventListener('change', () => { updateRemoteOptions(true); updatePreview(); });
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
        if (['systemCount', 'width', 'frontHeight', 'glassTrack'].includes(id)) {
          applyAutoRayPost(false);
        }
        window.clearTimeout(el._previewTimer);
        el._previewTimer = window.setTimeout(updatePreview, 350);
      });
    });
  }

  document.addEventListener('fullscreenchange', () => { window.setTimeout(() => applyPreviewScale(), 60); syncExpandButton(); });
  bindPreviewInteractions();
  enhanceExcelCombos();
  bindStrictInputs();
  renderQuickTests();
  fillInitial();
  bindEvents();
  setupPwaInstall();
  const savedLang = (() => { try { return localStorage.getItem('pulumur_lang') || 'tr'; } catch (e) { return 'tr'; } })();
  if ($('languageSelect')) $('languageSelect').value = savedLang === 'en' ? 'en' : 'tr';
  translateUI(savedLang);
  updatePreview();
  syncExpandButton();
})();
