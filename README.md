# Pülümür Automation Studio

Pergo Rise için web tabanlı tek poz parametrik çizim ve DXF üretim denemesi.

## V6 - Clean R12

Bu sürümde DXF motoru özellikle DraftSight/AutoCAD açılış kararlılığı için yeniden sadeleştirildi.

- DXF formatı: `AC1009 / AutoCAD R12`
- Gerçek `BLOCK / INSERT` aktarımı kapatıldı.
- Blok yerleri geçici olarak temiz `POLYLINE + LINE + TEXT` önizleme geometrisiyle çiziliyor.
- Amaç: DraftSight açılışındaki "Teknik resim dosyasının kurtarılması gerekli" uyarısını kesmek.
- Çizim geometrisi PERI01 tek poz koordinat mantığını takip eder.

## Kullanım

1. GitHub repo ana dizinine dosyaları yükle.
2. GitHub Pages kaynağı olarak GitHub Actions veya `main / root` kullan.
3. Web formunu doldur.
4. `DXF Oluştur ve İndir` butonuna bas.

## Dosya yapısı

```text
index.html
style.css
app.js
peri01Geometry.js
dxfEngine.js
samples/pergo-rise-v6-clean-r12-test.dxf
samples/sample-input.json
.nojekyll
```

## Not

V4/V5'te blokları `pulumurapp.dxf` içinden gömme denemesi yapıldı; bazı CAD programlarında recovery uyarısı verdiği için V6'da blok gömme kapatıldı. Temiz R12 çizim motoru stabil olduktan sonra bloklar tek tek güvenli şekilde geri eklenecek.
