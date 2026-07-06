# Pülümür Automation Studio — V6.4 Block Definitions

Bu sürüm tek poz Pergo Rise web DXF prototipidir.

## V6.4 değişiklikleri

- V6.2 Clean R12 motoru korunmuştur.
- Ayrı DXF dosyalarından süzgeçten geçirilen dikme blokları `blocks/filteredBlocks.js` içine alınmıştır.
- Bloklar DXF içinde gerçek `BLOCK` tanımı olarak yazılır.
- Çizimde ilgili noktalara `INSERT` ile çağrılır.
- Blok taban noktası: kaynak çizimin bounding-box merkezi, yani merkez bazlı yerleşim.
- Kaynak DXF dosyaları değiştirilmemiştir.

## Dahil edilen bloklar

- PergoRise Dikme Alt Bağlantı Karşı Görünüş
- PergoRise Dikme Oluk Bağlantı Üst Görünüş
- PergoRise Dikme Oluk Bağlantı Yan Görünüş
- PergoRise Dikme Üst Görünüş
- PergoRise Dikme Alt Bağlantı Yan Görünüş
- PergoRise Dikme Oluk Bağlantı Karşı Görünüş

## Test dosyaları

- `samples/pergo-rise-v6_4-block-definitions-test.dxf`
- `blocks/FILTERED_BLOCKS_REPORT.md`

