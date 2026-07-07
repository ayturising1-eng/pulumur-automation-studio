# Pülümür Automation Studio — V8.2.6

V8.2.5 stabil tabanı korunarak sadece hedefli düzeltmeler yapıldı.

## Düzeltmeler

- Tablo yazılarında PERI01 v86/v99 mantığına yakın hücre içi sığdırma uygulandı.
  - Üst tabloda metin genişliğe göre kırılır.
  - Metin bloğu hücre içinde dikey ortalanır.
  - Gerekirse sadece ilgili hücre yazı yüksekliği küçülür.
- Alt antet tablosunda metin satır kırmadan hücre genişliğine göre küçültülür ve dikey ortalanır.
- MTEXT ana motorda kapalı tutuldu; DraftSight recovery hatası vermemesi için R12/AC1009 + TEXT satırları kullanılır.
- Ayna yan görünüş bloklarında rotation kuralı düzeltildi: mirror blok + `-rotation`.
- Ayna görünüşte alt hizalama korunur: sağ yan dikme alt ucu, ön görünüş dikme alt ucuyla aynı -Y hattına çekilir.
- Ölçülendirme kapalı kalır; açı yazısı da geçici olarak kapatıldı.
- Dış çerçeve, çizim sınırlarına göre genişletilir; görünüşler ana çerçeve dışına taşmamalıdır.

## Not

Bu sürüm V8.2.5 üzerinden ilerler. V8.3/V8.4 iptal hattına dönülmedi.
