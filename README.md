# Pülümür Automation Studio — V8 PERI01 Excel Bridge

Bu sürümde PERI01 Excel + LISP akışındaki önemli detaylar web çekirdeğine taşındı.

## Ana değişiklikler

- Ana form değerleri doğrudan çizime gönderilmiyor; önce Excel'deki gizli **Sayfa1** mantığına çevriliyor.
- Genişlik değeri Sayfa1!B1 üretim mantığıyla optimize ediliyor.
- Otomatik ray sayısı / dikme sayısı hesaplama eklendi.
- Pülümür Hesaplayıcı, Excel Module22 mantığıyla çoklu poz destekli hale getirildi.
- Yardım içeriği, Excel formundaki kullanım kılavuzundan web yardım penceresine taşındı.
- Üst opsiyon tablosu ve alt antet tablosu Sayfa1'deki I sütunu ölçülerini ve PERI01 LISP ölçekleme mantığını kullanıyor.
- Bloklar V7.2'deki gibi paylaşımlı tek blok tanımı + INSERT mantığını koruyor.
- Polyline sadeleştirme kapalı kalmıştır.

## Not

Bu sürüm birebirlik için altyapı sürümüdür. PERI01'in görsel çıktısına milim milim yaklaşmak için bundan sonra referans DXF/PDF karşılaştırması ile sabitler ayarlanacaktır.


## V8.1 UI / Download Fix

- DXF Oluştur butonuna try/catch ve kullanıcıya görünen hata mesajı eklendi.
- Genişlik, Açılım, Arka Yükseklik, Ön Yükseklik, Ray Sayısı, Dikme Sayısı ve Parapet Yüksekliği alanları serbest metin girişine alındı.
- ; ve NO yazımı tarayıcı tarafından engellenmez.
- Sayfa1 dönüşümünde ilk sayısal token okuma düzeltildi.
- GitHub cache kırmak için script/css versiyonu 8.1 yapıldı.
