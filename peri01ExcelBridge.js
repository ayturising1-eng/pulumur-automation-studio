(function (root) {
  'use strict';

  // Excel Sayfa1 kaynak değerleri.
  // Veri akışı artık Excel'deki gibi: Ana form -> Sayfa1 dönüşümü -> WebDXF.
  const SAYFA1_DEFAULTS = {
    // Üst opsiyon tablosu. VBA/LISP data dosyasında I sütunu kullanılıyor.
    tabloRowH: 180,
    tabloCol1W: 1150,
    tabloCol2W: 1800,
    tabloTxtX: 60,
    tabloTxtY: 130,
    tabloTxtH: 90,

    // Alt antet tablosu. LISP aynı değerleri PERGO RISE yazı yüksekliğine göre ölçekliyor.
    alttabloRowH: 10,
    alttabloCol1W: 10,
    alttabloCol2W: 25,
    alttabloCol3W: 10,
    alttabloCol4W: 25,
    alttabloCol5W: 10,
    alttabloCol6W: 20,
    alttabloTxtX: 7.2,
    alttabloTxtY: 15.6,
    alttabloTxtH: 10.8,

    genislikOptimizeNormalBosluk: 25,
    genislikTekDegerDeductNoGlass: 12,
    genislikListeKenarDeductNoGlass: 6,
    noGapWidthDeductNoGlass: 12,
    noGapWidthDeductGlassEdge: 6,
    noGapWidthDeductGlassMiddle: 12,
    normalSystemGapForAutoRay: 13,

    calcOpeningCorrection: 71.1,
    calcHeightCorrection: 278
  };

  const HELP_TEXT = "KULLANIM KILAVUZU\nPülümür Automation Studio; ürün türü, ürün modülü, sistem ölçüleri, poz bilgileri ve proje detaylarını esas alarak otomatik teknik çizim oluşturan bir çizim hazırlama aracıdır.\nGirilen bilgilere göre ilgili çizim motoru çalıştırılır, teknik çizim oluşturulur ve proje klasörüne kaydedilir.\nGENEL PROGRAM MANTIĞI\nProgram içinde renkli olan ve üzerinde ok işareti bulunan hücreler buton olarak kullanılır.\nÜzerinde \nBu butonlar çizim oluşturma, klasör açma, hücreleri sıfırlama ve programdan çıkış gibi işlemler için kullanılır.\nMüşteri adı ve proje adı, programın klasör ve dosya oluşturma mantığında kullanılır.\nProgram, müşteri adı ve proje adına göre otomatik klasör oluşturur.\nOluşturulan çizim dosyaları bu proje klasörüne kaydedilir.\nSistem ile ilgili ölçüler, ürün bilgileri ve proje bilgileri girildikten sonra Çizim Oluştur butonuna basılır.\nÇizim Oluştur butonuna basıldığında program ilgili çizim motorunu açar.\nSeçilen çizim motoruna göre AutoCAD veya DraftSight çalıştırılır.\nProgram çizimi otomatik olarak oluşturur ve dosyayı farklı kaydeder.\nAutoCAD ile çalışıldığında DWG dosyasına ek olarak PDF çıktısı da oluşturulur.\nDraftSight ile çalışıldığında DWG dosyası oluşturulur; PDF çıktısı program tarafından otomatik oluşturulmaz.\nKURULUM VE DOSYA YAPISI\nBu sürümde AutoCAD LISP, DraftSight LISP, pulumurapp.dwg referans çizimi ve pdftotext.exe aracı Excel dosyasının içine gömülü kaynak olarak eklenmiştir.\nExcel dosyası masaüstünde, indirilenler klasöründe, ağ klasöründe veya kullanıcı tarafından seçilen herhangi bir klasörde tek başına çalışabilir.\nÇizim veya PDF içe aktarma işlemi için LISP, pulumurapp.dwg veya pdftotext.exe dosyalarının ayrıca dış klasöre kopyalanmasına gerek yoktur.\nÇizim başlatıldığında program, Excel içindeki gömülü LISP ve gömülü pulumurapp.dwg dosyasını otomatik olarak geçici çalışma klasörüne çıkarır.\nAutoCAD veya DraftSight bu geçici dosyaları kullanarak çizimi oluşturur ve çıktı DWG / PDF dosyalarını Excel dosyasının bulunduğu konuma göre oluşturulan proje klasörüne kaydeder.\nProgramın gömülü kaynak yapısında kullanıcı normal kullanım sırasında LISP, referans DWG veya pdftotext.exe dosyalarını görmez ve ayrıca kopyalamak zorunda kalmaz.\nKaynak dosyalar çalışma sırasında geçici klasöre çıkarılır; işlem tamamlandıktan sonra program bu dosyaları temizleyebilir.\nBu yapı kaynak dosyaların yanlışlıkla silinmesini, adının değiştirilmesini veya başka klasöre taşınmasını önlemek için kullanılır.\nDraftSight ve AutoCAD çizim motorları aynı ürün verilerini kullanır; ancak LISP dosyaları ve komut altyapıları farklıdır.\nBu nedenle AutoCAD için hazırlanmış gömülü LISP yalnızca AutoCAD çizim motoru ile, DraftSight için hazırlanmış gömülü LISP yalnızca DraftSight çizim motoru ile kullanılmalıdır.\nAutoCAD ve DraftSight programlarının bilgisayarda kurulu olması gerekir.\nHer bilgisayarda AutoCAD ve DraftSight kurulum yolu farklı olabilir. Çizim motoru açılmıyorsa ilgili makro içindeki AutoCAD / DraftSight exe yolu kontrol edilmelidir.\nİleride dinamik yol ayarlama modülü kullanılırsa, bu yollar makro koduna girmeden ayar sayfasından güncellenebilir.\npulumurapp.dwg referans çizimi veya LISP dosyaları zaman içinde güncellenirse, gömülü kaynakların da güncellenmesi gerekir.\nBu sürümde sadece dış klasöre yeni LISP veya yeni pulumurapp.dwg dosyası koymak mevcut gömülü kaynağı değiştirmez.\nGüncel dosyalar Excel içine tekrar gömülerek yeni sürüm oluşturulmalıdır.\npdftotext.exe aracı da PDF formu içe aktarma işlemi için Excel içine gömülüdür.\nPDF içe aktar butonu kullanıldığında program bu aracı geçici klasöre çıkarır ve seçilen müşteri PDF formunu metne çevirir.\nAntivirüs veya Windows güvenlik sistemi geçici klasöre çıkarılan pdftotext.exe dosyasını engellerse PDF içe aktarma işlemi tamamlanmayabilir.\nÇizim oluşturma işlemi devam ederken Excel, AutoCAD veya DraftSight üzerinde farklı bir işlem yapılmamalıdır.\nProgram çizimi tamamlayıp dosyayı kaydedene kadar beklenmelidir.\nPDF / DWG Klasörü butonu, çizimin kaydedildiği klasörü doğrudan açmak için kullanılır.\nBu butona basıldığında oluşturulan çizim dosyalarının bulunduğu klasör ekranda açılır.\nHücre Değerlerini Resetle butonu, programı açılış ekranındaki varsayılan durumuna getirir.\nBu işlemden sonra sistem ölçüleri ve proje giriş alanları yeniden doldurulabilir.\nÇıkış butonu programı kapatmak için kullanılır.\nİşlem tamamlandıktan sonra Çıkış butonuna basarak programdan çıkabilirsiniz.\nMÜŞTERİ PDF FORMU İÇE AKTARMA\nPDF İçe Aktar butonu, müşteriden gelen PDF formundaki bilgileri okuyarak ilgili Excel hücrelerine aktarmak için kullanılır.\nBu işlem için gerekli pdftotext.exe aracı Excel içine gömülüdür; ayrıca dışarıya pdftotext.exe dosyası koymak veya Pulumur_Resources klasörü oluşturmak gerekmez.\nProgram seçilen PDF dosyasını önce geçici TXT dosyasına çevirir, sonra PDF içindeki alanları okuyarak müşteri adı, proje adı, ölçüler, renkler, motor, kumanda, aydınlatma ve not bilgilerini ilgili hücrelere yazar.\nPDF aktarımından sonra hücreler kontrol edilmelidir. PDF içeriği müşteri tarafından hatalı veya eksik doldurulmuşsa çizim oluşturmadan önce Excel hücreleri manuel olarak düzeltilmelidir.\nPDF içe aktarma işlemi çizimi otomatik başlatmaz; sadece formdaki bilgileri Excel'e aktarır. Kontrolden sonra Çizim Oluştur butonu kullanılmalıdır.\nÜrün: Pergo Rise Module 1\nAşağıda Pergo Rise Module 1 ürünü için veri giriş mantığı ve programın çalışma şekli açıklanmaktadır.\n1. PROJE BİLGİLERİ\nMüşteri adı ve proje adı mutlaka girilmelidir.\nBu bilgiler çizim klasörü ve dosya isimlerinin oluşturulmasında kullanılır.\nMüşteri adı ve proje adı dosya / klasör isminde kullanılacağı için / \\ : * ? \" < > | gibi Windows tarafından kabul edilmeyen karakterler kullanılmamalıdır.\nBu karakterler kullanılırsa program proje klasörünü veya çıktı dosyasını oluşturamayabilir.\n2. ÖLÇÜ GİRİŞ MANTIĞI\nSistem ölçülerini ilgili hücrelere girin.\nBirden fazla poz varsa değerleri noktalı virgül (;) ile ayırın.\nÖrnek: 4000;6000;8000\nBu durumda:\n1. değer 1. poza,\n2. değer 2. poza,\n3. değer 3. poza ait olur.\nTek yazılan değer tüm pozlar için ortak kabul edilir.\nÖrnek: Sistem Açısı: 10\nBu değer tüm pozlarda 10 derece olarak kullanılır.\nBirden fazla poz kullanılıyorsa, pozlara özel girilen değerlerin sayısı sistem adediyle uyumlu olmalıdır.\nTek değer girilirse tüm pozlarda ortak kullanılır.\nNoktalı virgül ile birden fazla değer girilirse değer sırası poz sırasına göre okunur.\nÖrnek: Açılım: 4000;6000;8000 yazıldığında 1. değer 1. poza, 2. değer 2. poza, 3. değer 3. poza uygulanır.\n3. SİSTEM ADEDİ VE GENİŞLİK MANTIĞI\nSistem adedi ve genişlik bilgileri, çizimdeki sistemlerin yatay yerleşimini belirler.\nGenişlik değeri tek yazılırsa program bu değeri toplam genişlik olarak kabul eder.\nÖrnek:\nToplam Genişlik: 8000\nSistem Adedi: 4\nBu durumda program toplam genişliği sistem adedine göre otomatik böler.\nHer sistem 2000 mm olarak kabul edilir.\nGenişlikler noktalı virgül ile ayrılırsa, her sistem kendi genişliğine göre çizilir.\nBu durumda sistemler arası boşluklar program tarafından otomatik hesaplanır ve çizim buna göre oluşturulur.\nÖrnek:\nGenişlik: 2000;2500;1800;2200\nSistem Adedi: 4\nBu örnekte 4 sistem kendi genişliklerine göre çizilir.\nSistemler arasındaki boşluklar program tarafından otomatik dağıtılır.\nGenişlik değerlerinin sonunda ;NO yazılırsa otomatik boşluk hesaplama kapatılır.\nBu modda tek sıradaki değerler sistem genişliklerini, çift sıradaki değerler ise iki sistem arasındaki boşlukları ifade eder.\nÖrnek:\nGenişlik: 2000;50;2500;80;1800;60;2200;NO\nSistem Adedi: 4\nBu durumda:\n1. değer = 1. sistem genişliği: 2000 mm\n2. değer = 1. ve 2. sistem arası boşluk: 50 mm\n3. değer = 2. sistem genişliği: 2500 mm\n4. değer = 2. ve 3. sistem arası boşluk: 80 mm\n5. değer = 3. sistem genişliği: 1800 mm\n6. değer = 3. ve 4. sistem arası boşluk: 60 mm\n7. değer = 4. sistem genişliği: 2200 mm\nYani ;NO kullanılmadığında sistem arası boşlukları program otomatik hesaplar.\n;NO kullanıldığında ise sistem genişlikleri ve sistem arası boşluklar kullanıcı tarafından elle tanımlanır.\n;NO modunda son değer mutlaka NO olmalıdır.\nNO ifadesi genişlik veya boşluk değeri olarak değerlendirilmez; sadece otomatik boşluk hesabını kapatmak için kullanılır.\nRAY SAYISI VE DİKME SAYISI OTOMATİK HESAPLAMA\nBitişik sistem adedi ve genişlik değeri girildiğinde, program ray sayısını ve dikme sayısını otomatik hesaplar.\nBu nedenle ray sayısı ve dikme sayısı alanları manuel girilmek zorunda değildir.\nRay sayısı, her sistemin genişliğine göre otomatik belirlenir.\n0 - 4000 mm arası genişliklerde 2 ray kullanılır.\n4001 - 8000 mm arası genişliklerde 3 ray kullanılır.\n8001 - 12000 mm arası genişliklerde 4 ray kullanılır.\nTek sistemlerde dikme sayısı, ray sayısı ile aynı kabul edilir.\nBitişik sistemlerde ise yan yana gelen raylar ortak aks kabul edilir.\nBu nedenle bitişik sistemlerde dikme sayısı şu mantıkla hesaplanır:\nDikme Sayısı = Toplam Ray Sayısı - (Poz Sayısı - 1)\nÖrnek:\nGenişlik: 3000;5000;9000\nRay Sayısı: 2;3;4\nToplam Ray Sayısı: 9\nPoz Sayısı: 3\nDikme Sayısı: 9 - (3 - 1) = 7\nEğer bitişik sistem adedi 1'den fazla yazılır ve genişlik tek değer olarak girilirse, bu değer toplam genişlik kabul edilir.\nBu durumda program önce bir sistemin net genişliğini hesaplar.\nBir Sistem Genişliği = (Toplam Genişlik - ((Sistem Adedi - 1) x 13)) / Sistem Adedi\nÖrnek:\nToplam Genişlik: 8000\nSistem Adedi: 4\nBir Sistem Genişliği = (8000 - ((4 - 1) x 13)) / 4\nBir Sistem Genişliği = 1990.25 mm\nBu genişlik 4000 mm altında olduğu için ray sayısı 2 olur.\nToplam Ray Sayısı = 2 x 4 = 8\nDikme Sayısı = 8 - (4 - 1) = 5\nGenişlik birden fazla poz olarak yazıldıysa, ray sayısı da pozlara göre noktalı virgül ile otomatik ayrılır.\nÖrnek: Genişlik: 3500;6000;9500\nSonuç Ray Sayısı: 2;3;4\nGenişlik sonunda ;NO kullanılırsa, sadece tek sıradaki değerler sistem genişliği olarak hesaplanır.\nÇift sıradaki değerler sistem arası boşluk kabul edilir ve ray hesabına dahil edilmez.\nÖrnek: Genişlik: 2000;50;2500;80;6000;NO\nBu örnekte 2000, 2500 ve 6000 sistem genişlikleridir.\n50 ve 80 ise sistem arası boşluklardır.\nSonuç Ray Sayısı: 2;2;3\nBitişik sistem adedi veya genişlik hücresi silinirse, ray sayısı ve dikme sayısı alanları da otomatik temizlenir.\n4. AÇILIM VE YÜKSEKLİK MANTIĞI\nAçılımları farklı olan ürünlerde ön yükseklikler aynı yatay aks üzerinde hizalanır.\nÖn yükseklik tek değer yazılırsa, bu değer tüm pozlar için ortak kabul edilir.\nÖrnek:\nAçılım: 4000;6000;8000\nArka Yükseklik: 3100;3400;3750\nÖn Yükseklik: 2600\nBu durumda ön yükseklik tüm pozlarda 2600 kabul edilir.\nSistemler önde aynı hatta hizalanır, arka yükseklikler ise açılıma göre farklı olabilir.\n5. RAY SAYISI\nRay sayısı, bitişik sistem adedi ve genişlik değerine göre program tarafından otomatik hesaplanır.\nBirden fazla poz varsa ray sayısı da pozlara göre noktalı virgül ile otomatik ayrılır.\nGerekli durumlarda kullanıcı ray sayısı alanını manuel olarak da düzenleyebilir.\nRay sayısı alanı manuel doldurulursa program bu değeri esas alır.\nRay sayısı alanı boş bırakılırsa genişlik ve sistem adedine göre otomatik hesaplama yapılır.\n6. DİKME SAYISI\nDikme sayısı, hesaplanan ray sayıları ve poz sayısı dikkate alınarak otomatik hesaplanır.\nBitişik sistemlerde yan yana gelen raylar ortak aks kabul edildiği için birleşim noktalarında tek dikme kullanılır.\nGerekli durumlarda kullanıcı dikme sayısı alanını manuel olarak da düzenleyebilir.\nDikme sayısı alanı manuel doldurulursa program bu değeri esas alır.\nDikme sayısı alanı boş bırakılırsa ray sayısı ve poz sayısına göre otomatik hesaplama yapılır.\n7. PARAPET\nParapet seçeneği sadece ön taraf için çizilir.\nParapet varsa ön görünüş ve yan görünüş ölçüleri buna göre düzenlenir.\n8. CAM KAYDI\nCam kaydı seçildiğinde program yanlarda 100x100 profil çizer.\nCam kaydı verildiğinde sistem ölçüleri otomatik olarak buna göre düzenlenir.\n9. SU ÇIKIŞI STANDART MI?\n\"Evet\" seçilirse, su çıkışı dikmelerden alınacak şekilde standart çizim yapılır.\n\"Hayır\" seçilirse, su çıkışı oluk üzerinden alınacak şekilde çizime Ø70 boru detayı eklenir.\n10. ÇOKLU HESAPLAYICI\nÇoklu hesaplayıcıda 4 satırdan 3 tanesi doldurulur.\nBoş bırakılan satır otomatik hesaplanır.\nBağlı değerler:\n- Sistem Açısı\n- Açılım\n- Arka Yükseklik\n- Ön Yükseklik / Oluk Altı\nBirden fazla poz için değerler noktalı virgül (;) ile ayrılır.\nÖrnek:\nSistem Açısı: 10\nAçılım: 4000;6000;8000\nArka Yükseklik: 3100;3400;3750\nÖn Yükseklik: boş bırakılır\nProgram ön yükseklikleri pozlara göre hesaplar ve sonucu noktalı virgül ile ayırarak yazar.\n11. ÇİZİM OLUŞTURMA\nTüm bilgiler girildikten sonra Çizim Oluştur butonuna basılır.\nProgram ilgili çizim motorunu açar, teknik çizimi oluşturur ve dosyayı proje klasörüne farklı kaydeder.\nAutoCAD seçiliyse DWG dosyasına ek olarak PDF çıktısı da oluşturulur.\nDraftSight seçiliyse DWG dosyası oluşturulur; PDF çıktısı otomatik oluşturulmaz.\nÇizim tamamlandıktan sonra PDF / DWG Klasörü butonu ile çizimin kaydedildiği klasör doğrudan açılabilir.\nYeni bir proje girişi için Hücre Değerlerini Resetle butonu kullanılabilir.\nÇizim tamamlandığında proje klasörü içinde DWG dosyası oluşturulur.\nAutoCAD motoru seçildiyse aynı klasörde PDF çıktısı da oluşturulur.\nPDF / DWG Klasörü butonu ile bu klasör doğrudan açılabilir.\nSORUN GİDERME\nÇizim oluşmuyorsa aşağıdaki kontroller yapılmalıdır:\n- Ürün ve çizim motoru seçiminin doğru olduğundan emin olun.\n- Müşteri adı ve proje adının girildiğini kontrol edin.\n- AutoCAD veya DraftSight programının bilgisayarda kurulu olduğundan ve ilgili exe yolunun doğru olduğundan emin olun.\n- Bu sürümde LISP ve pulumurapp.dwg Excel içine gömülüdür; dış klasörde bu dosyaları aramanıza gerek yoktur.\n- Gömülü kaynak geçici klasöre çıkarılamıyorsa antivirüs, Windows izinleri veya açık kalan AutoCAD / DraftSight işlemleri kontrol edilmelidir.\n- Dosya veya klasör adlarında geçersiz karakter bulunmadığını kontrol edin.\n- Çizim motoru açıkken komut satırında hata mesajı oluşup oluşmadığını kontrol edin.\n- PDF içe aktarma çalışmıyorsa gömülü pdftotext.exe dosyasının geçici klasöre çıkarılmasına antivirüsün izin verdiğinden emin olun.\nProgramdan çıkmak için Çıkış butonu kullanılır.";

  function trUpper(s) {
    return String(s ?? '')
      .trim()
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .toUpperCase();
  }

  function splitSemi(value) {
    return String(value ?? '').split(';').map(s => s.trim()).filter(Boolean);
  }

  function isMissingValue(value) {
    const s = String(value ?? '').trim();
    return s === '' || s === '?' || trUpper(s) === 'X';
  }

  function isNoToken(value) { return trUpper(value) === 'NO'; }

  function numericToken(value) {
    const n = Number(String(value ?? '').replace(',', '.').trim());
    return Number.isFinite(n) ? n : 0;
  }

  function firstNumericToken(value) {
    const token = splitSemi(value).find(t => !isNoToken(t));
    return numericToken(token);
  }

  function onlyNumericTokens(value) {
    return splitSemi(value).filter(t => !isNoToken(t) && Number.isFinite(Number(String(t).replace(',', '.')))).map(numericToken);
  }

  function formatNum(value, digits = 6) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    let s = n.toFixed(digits);
    s = s.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
    if (s === '-0') s = '0';
    return s;
  }

  function listToText(list) { return list.map(v => formatNum(v)).join(';'); }

  function noGapModeActive(value) {
    const parts = splitSemi(value);
    const clean = parts.filter(p => !isNoToken(p));
    return parts.length > 0 && isNoToken(parts[parts.length - 1]) && clean.length >= 3 && clean.length % 2 === 1;
  }

  function noGapParts(value) {
    return splitSemi(value).filter(p => !isNoToken(p));
  }

  function rayCountForWidth(width) {
    const w = Number(width) || 0;
    if (w <= 0) return 0;
    if (w <= 4000) return 2;
    if (w <= 8000) return 3;
    if (w <= 12000) return 4;
    return 4;
  }

  function postCountFromRayText(rayTextRaw, systemCountRaw, widthRaw, frontHeightRaw) {
    const rayText = String(rayTextRaw ?? '').trim();
    if (!rayText) return '';
    const systemCount = Math.max(1, Math.round(firstNumericToken(systemCountRaw) || 1));
    const rayParts = splitSemi(rayText).filter(t => trUpper(t) !== 'NO');
    if (!rayParts.length) return '';

    let posCount;
    let rayList;
    if (rayParts.length === 1) {
      const r = Math.max(0, Math.round(numericToken(rayParts[0]) || 0));
      const widthText = String(widthRaw ?? '').trim();
      if (noGapModeActive(widthText)) posCount = noGapParts(widthText).filter((_, i) => i % 2 === 0).length || systemCount;
      else {
        const wParts = splitSemi(widthText);
        posCount = wParts.length > 1 ? wParts.length : systemCount;
      }
      rayList = Array.from({ length: Math.max(1, posCount) }, () => r);
    } else {
      rayList = rayParts.map(t => Math.max(0, Math.round(numericToken(t) || 0)));
      posCount = rayList.length;
    }

    let postCount = rayList.reduce((a, b) => a + b, 0) - Math.max(0, posCount - 1);
    const frontTokens = onlyNumericTokens(frontHeightRaw);
    if (frontTokens.length && frontTokens.every(v => Math.abs(v) <= 0.000001)) postCount = 0;
    return Math.max(0, postCount);
  }

  function autoRayPostCount(systemCountRaw, widthRaw, frontHeightRaw) {
    const systemCount = Math.max(1, Math.round(firstNumericToken(systemCountRaw) || 1));
    const widthText = String(widthRaw ?? '').trim();
    if (!widthText) return { rayText: '', postCount: '', rayList: [], positionCount: 0 };

    const noMode = noGapModeActive(widthText);
    let rayList = [];
    if (noMode) {
      const parts = noGapParts(widthText);
      for (let i = 0; i < parts.length; i += 2) {
        rayList.push(rayCountForWidth(numericToken(parts[i])));
      }
    } else {
      const parts = splitSemi(widthText);
      if (parts.length <= 1) {
        const totalW = firstNumericToken(widthText);
        const oneW = systemCount > 1 ? (totalW - ((systemCount - 1) * SAYFA1_DEFAULTS.normalSystemGapForAutoRay)) / systemCount : totalW;
        const ray = rayCountForWidth(oneW);
        rayList = Array.from({ length: systemCount }, () => ray);
      } else {
        rayList = parts.map(t => rayCountForWidth(numericToken(t)));
      }
    }

    const totalRay = rayList.reduce((a, b) => a + b, 0);
    const posCount = rayList.length || systemCount;
    let postCount = totalRay - Math.max(0, posCount - 1);

    const frontTokens = onlyNumericTokens(frontHeightRaw);
    if (frontTokens.length && frontTokens.every(v => Math.abs(v) <= 0.000001)) postCount = 0;

    return {
      rayText: (noMode || splitSemi(widthText).length > 1) ? rayList.join(';') : String(rayList[0] || 0),
      postCount,
      rayList,
      positionCount: posCount
    };
  }

  function optimizeWidthForSayfa1(widthRaw, glassTrackRaw, systemCountRaw) {
    const widthText = String(widthRaw ?? '').trim();
    if (!widthText) return '';
    const camVar = ['EVET', 'YES', 'E', 'Y'].includes(trUpper(glassTrackRaw));
    const systemCount = Math.max(1, Math.round(firstNumericToken(systemCountRaw) || 1));

    if (noGapModeActive(widthText)) {
      const parts = noGapParts(widthText);
      let genCount = 0;
      for (let i = 0; i < parts.length; i += 2) genCount += 1;
      const out = [];
      let sayac = 0;
      for (const token of parts) {
        if (sayac % 2 === 0) {
          const idx = (sayac / 2) + 1;
          const v = numericToken(token);
          if (camVar) {
            out.push(v - (idx === 1 || idx === genCount ? SAYFA1_DEFAULTS.noGapWidthDeductGlassEdge : SAYFA1_DEFAULTS.noGapWidthDeductGlassMiddle));
          } else {
            out.push(v - SAYFA1_DEFAULTS.noGapWidthDeductNoGlass);
          }
        } else {
          out.push(numericToken(token));
        }
        sayac += 1;
      }
      return `${listToText(out)};NO`;
    }

    const parts = splitSemi(widthText);
    if (parts.length > 1) {
      const n = parts.length;
      const pay = ((n - 1) * SAYFA1_DEFAULTS.genislikOptimizeNormalBosluk) / n;
      const out = parts.map((token, i) => {
        const gen = numericToken(token);
        if (camVar) return gen - pay;
        return gen - ((i === 0 || i === n - 1) ? SAYFA1_DEFAULTS.genislikListeKenarDeductNoGlass : 0) - pay;
      });
      return listToText(out);
    }

    const gen = numericToken(widthText);
    return formatNum(camVar ? gen : gen - SAYFA1_DEFAULTS.genislikTekDegerDeductNoGlass);
  }

  function normalizeYesNo(value) {
    return ['EVET', 'E', 'YES', 'Y'].includes(trUpper(value)) ? 'EVET' : 'HAYIR';
  }

  function safeLine(value) {
    return String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim() || '-';
  }

  function buildSayfa1Data(raw) {
    const auto = autoRayPostCount(raw.systemCount, raw.width, raw.frontHeight);
    // Excel mantığı: ray sayısı boşsa genişlikten otomatik hesaplanır;
    // kullanıcı 3;2;4 gibi manuel yazdıysa bu değer aynen esas alınır.
    const rayManual = String(raw.rayCount ?? '').trim();
    const rayText = rayManual ? rayManual : auto.rayText;
    // Dikme sayısı boşsa, manuel/otomatik ray metnine göre toplam ray - (poz-1) formülü uygulanır.
    const postCount = String(raw.postCount ?? '').trim() ? firstNumericToken(raw.postCount) : postCountFromRayText(rayText, raw.systemCount, raw.width, raw.frontHeight);

    const sayfa1 = {
      B1_width: optimizeWidthForSayfa1(raw.width, raw.glassTrack, raw.systemCount),
      B2_opening: safeLine(raw.opening),
      B3_rearHeight: safeLine(raw.rearHeight),
      B4_frontHeight: firstNumericToken(raw.frontHeight),
      B5_parapet: normalizeYesNo(raw.parapet),
      B6_parapetHeight: firstNumericToken(raw.parapetHeight),
      B7_rayCount: rayText,
      B8_postCount: postCount,
      B9_glassTrack: normalizeYesNo(raw.glassTrack),
      B10_waterStandard: normalizeYesNo(raw.waterStandard),
      B12_structureColor: safeLine(raw.structureColor),
      B13_fabric: safeLine(raw.fabric),
      B14_fabricProfiles: safeLine(raw.fabricProfiles),
      B15_motor: safeLine(raw.motor),
      B16_remote: safeLine(raw.remote),
      B17_led: safeLine(raw.led),
      B18_dimmer: safeLine(raw.dimmer),
      B19_extras: safeLine(raw.extras),
      B21_customer: safeLine(raw.customer),
      B22_project: safeLine(raw.project),
      B23_version: safeLine(raw.version),
      B24_drawnBy: safeLine(raw.drawnBy),
      B25_date: safeLine(raw.date),
      B27_systemCount: Math.max(1, Math.round(numericToken(raw.systemCount) || 1)),
      B29_triangleJoinery: normalizeYesNo(raw.triangleJoinery),
      row31_widthTokens: onlyNumericTokens(raw.width),
      layout: { ...SAYFA1_DEFAULTS },
      auto
    };
    return sayfa1;
  }

  function splitCalcValues(value) {
    if (isMissingValue(value)) return [];
    return splitSemi(value);
  }
  function arrayCount(arr) { return Array.isArray(arr) ? arr.length : 0; }
  function maxPozCount(...arrs) { return Math.max(1, ...arrs.map(arrayCount)); }
  function validPozCount(arr, n) { return arr.length === 0 || arr.length === 1 || arr.length === n; }
  function getPozNumber(arr, idx) {
    if (arr.length === 1) return numericToken(arr[0]);
    return numericToken(arr[idx - 1]);
  }
  function roundUp0(x) {
    const n = Number(x);
    if (!Number.isFinite(n)) return 0;
    if (n === Math.trunc(n)) return Math.trunc(n);
    return n > 0 ? Math.trunc(n) + 1 : Math.trunc(n);
  }
  function calculateSystem(values) {
    const vAci = String(values.angle ?? '').trim();
    const vAcilim = String(values.opening ?? '').trim();
    const vArka = String(values.rear ?? '').trim();
    const vOn = String(values.front ?? '').trim();
    const missing = [vAci, vAcilim, vArka, vOn].map(isMissingValue);
    if (missing.filter(Boolean).length !== 1) throw new Error('Hesaplama için tam olarak 1 hücre boş olmalı.');

    const arrAci = splitCalcValues(vAci);
    const arrAcilim = splitCalcValues(vAcilim);
    const arrArka = splitCalcValues(vArka);
    const arrOn = splitCalcValues(vOn);
    const pozSay = maxPozCount(arrAci, arrAcilim, arrArka, arrOn);
    if (![arrAci, arrAcilim, arrArka, arrOn].every(arr => validPozCount(arr, pozSay))) {
      throw new Error('Poz sayılarında uyumsuzluk var. Tek değer tüm pozlara uygulanır; çoklu değerler aynı sayıda olmalı.');
    }

    const out = [];
    for (let i = 1; i <= pozSay; i += 1) {
      if (missing[0]) {
        const acilim = getPozNumber(arrAcilim, i);
        const arkaY = getPozNumber(arrArka, i);
        const onY = getPozNumber(arrOn, i);
        if (Math.abs(acilim - SAYFA1_DEFAULTS.calcOpeningCorrection) < 0.000001) throw new Error('Açılım 71.1 olamaz.');
        const aci = Math.atan((arkaY - onY - SAYFA1_DEFAULTS.calcHeightCorrection) / (acilim - SAYFA1_DEFAULTS.calcOpeningCorrection)) * 180 / Math.PI;
        out.push(formatNum(Math.abs(aci), 2));
      } else if (missing[1]) {
        const aci = getPozNumber(arrAci, i);
        const arkaY = getPozNumber(arrArka, i);
        const onY = getPozNumber(arrOn, i);
        const t = Math.tan(aci * Math.PI / 180);
        if (Math.abs(t) < 0.0000001) throw new Error('Açı 0 olursa açılım hesaplanamaz.');
        out.push(String(roundUp0(((arkaY - onY - SAYFA1_DEFAULTS.calcHeightCorrection) / t) + SAYFA1_DEFAULTS.calcOpeningCorrection)));
      } else if (missing[2]) {
        const aci = getPozNumber(arrAci, i);
        const acilim = getPozNumber(arrAcilim, i);
        const onY = getPozNumber(arrOn, i);
        out.push(String(roundUp0(onY + SAYFA1_DEFAULTS.calcHeightCorrection + Math.tan(aci * Math.PI / 180) * (acilim - SAYFA1_DEFAULTS.calcOpeningCorrection))));
      } else if (missing[3]) {
        const aci = getPozNumber(arrAci, i);
        const acilim = getPozNumber(arrAcilim, i);
        const arkaY = getPozNumber(arrArka, i);
        out.push(String(roundUp0(arkaY - SAYFA1_DEFAULTS.calcHeightCorrection - Math.tan(aci * Math.PI / 180) * (acilim - SAYFA1_DEFAULTS.calcOpeningCorrection))));
      }
    }
    return {
      missingIndex: missing.findIndex(Boolean),
      resultText: out.join(';'),
      pozSay
    };
  }

  const api = {
    SAYFA1_DEFAULTS,
    HELP_TEXT,
    trUpper,
    splitSemi,
    numericToken,
    onlyNumericTokens,
    noGapModeActive,
    rayCountForWidth,
    autoRayPostCount,
    postCountFromRayText,
    optimizeWidthForSayfa1,
    buildSayfa1Data,
    calculateSystem
  };

  root.PulumurExcelBridge = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
