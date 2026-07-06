# Pülümür Automation Studio - V4 Bloklu Test

Pergo Rise için tarayıcı üzerinden tek poz parametrik DXF üretim denemesi.

Bu repo ilk MVP sürümüdür. Excel makrosu / DraftSight bağımlılığını kaldırmak için hazırlanmıştır. Hesap ve çizim mantığı web tarafındaki JavaScript dosyalarına taşınır. Kullanıcı formu doldurur, önizlemeyi görür ve DXF dosyasını doğrudan indirir.

## Kapsam

- Tek poz Pergo Rise çizimi
- Web ve mobil uyumlu arayüz
- Üst görünüş
- Ön / karşı görünüş
- Yan görünüş
- Ray, oluk, dikme, duvar, parapet, cam kaydı ve özel su çıkışı için ilk seviye çizim mantığı
- Manuel çizilmiş ölçülendirme
- Proje bilgi tablosu
- Pülümür Hesaplayıcı modal penceresi
- Sunucusuz / statik çalışma
- GitHub Pages uyumlu dosya yapısı

## Henüz MVP dışında kalanlar

- Çoklu poz çizimi
- PDF teklif formu içe aktarma
- Excel görünümü / program görünümü geçişleri
- DraftSight / AutoCAD otomatik çalıştırma
- PDF / DWG klasörü açma
- Çıkış butonu
- `pulumurapp.dwg` içindeki blokların birebir DXF blok tanımı olarak aktarılması
- DWG çıktı üretimi

## Dosya yapısı

```text
pulumur-automation-studio/
├─ index.html
├─ style.css
├─ app.js
├─ peri01Geometry.js
├─ dxfEngine.js
├─ samples/
│  ├─ sample-input.json
│  └─ pergo-rise-v4-block-test.dxf
├─ docs/
│  └─ mvp-notlari.md
└─ tools/
   └─ smoke-test.js
```

## Lokal deneme

Dosyaları klasöre çıkarıp `index.html` dosyasını tarayıcıda açmak yeterlidir.

Chrome bazı yerel dosya güvenliklerinde sorun çıkarırsa klasör içinde basit bir lokal sunucu açılabilir:

```bash
python -m http.server 8080
```

Sonra tarayıcıdan şu adres açılır:

```text
http://localhost:8080
```

## GitHub Pages yayınlama

1. GitHub üzerinde `pulumur-automation-studio` adlı repo oluştur.
2. Bu zip içindeki dosyaları repo ana dizinine yükle.
3. Repo ayarlarından **Settings → Pages** bölümüne gir.
4. **Deploy from a branch** seç.
5. Branch: `main`, Folder: `/root` seç.
6. Yayın linki birkaç dakika içinde açılır.

## Geliştirme sırası önerisi

1. Bu MVP ile tek poz çizim ölçeği ve DXF açılabilirliği test edilir.
2. LISP’teki ray / dikme / cam kaydı / parapet kuralları birebir sadeleştirilerek JS tarafına taşınır.
3. Çoklu poz veri modeli eklenir.
4. `pulumurapp.dwg` blokları DXF blok tanımlarına çevrilir.
5. PDF önizleme ve teklif formu içe aktarma ayrı modül olarak eklenir.


## V3 Blok Eşleştirme

Bu sürümde `pulumurapp.dxf` içindeki PERI01 blokları web DXF çıktısına `BLOCK / INSERT` mantığıyla eklenmiştir. Tek poz referansı olarak `DENEME-DENEME.dxf` kullanılmıştır. Trapez tarama, RISING LOGO ve PLMR logo şimdilik bilinçli olarak kullanılmamıştır.


## V4 notu

Bu paket, önceki örnekle karışmaması için çıktılara `WEB DXF V4 - BLOKLU TEST - 06.07.2026` yazısı ekler. Örnek dosya adı: `samples/pergo-rise-v4-block-test.dxf`.


## V5 DXF Fix

Generated LINE, LWPOLYLINE, TEXT and INSERT entities now include AC1024 subclass markers to avoid broken DXF loading. Sample output name: `samples/pergo-rise-v5-dxf-fix-test.dxf`.
