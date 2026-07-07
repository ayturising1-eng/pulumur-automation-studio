# Pülümür Automation Studio V8.2.2

Bu sürüm V8.2.1 çalışan tabanı üzerinden sadece hedefli düzeltmeler içerir.

- Üst görünüşte `PergoRise Oluk` bloğu çizime gelmez; oluk çizgisel profil olarak kalır.
- Üçgen doğrama aktifse üst sol tablonun triangle alanıyla çakışmasını azaltan PERI01 benzeri tablo limit/küçültme mantığı eklendi.
- Yan Kayıt alanı eklendi.
- Tek açılımda Yan Kayıt veya Cam Kaydı EVET ise yan görünüş ayna kopyası oluşur.
- Çoklu/farklı açılımda PERI01 kuralına göre yalnız son yan görünüş pozunun ayna kopyası üretilir.
- DXF yazı stili V8.2.1'deki Arial tabanlı ayarda korunur.

# Pülümür Automation Studio — V8.2 PERI01 Ray/Dikme Fix

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


## V8.2 Ray/Dikme Fix

- Ray sayısı ve dikme sayısı otomatik hesaplama PERI01 Sayfa2 makro mantığına çekildi.
- `3;2;4` gibi manuel çoklu ray sayısı girişleri artık tüm pozlara uygulanır.
- Dikme sayısı boşsa manuel ray listesine göre `Toplam Ray - (Poz Sayısı - 1)` formülüyle hesaplanır.
- Üst görünüşte çatı kayıt profili blok olarak değil, dikdörtgen olarak çizilir.
- Üst/ön/yan görünüş başlık yazıları kaldırıldı.
- Ön görünüşte oluk profili bloğu kaldırıldı.
- Cam kayıt çizimleri PERI01 gibi magenta / AutoCAD color 6 katmanına alındı.


V8.2.1 hedefli düzeltme:
- V8.2 çalışan çizim motoru baz alınmıştır.
- Yan görünüşte çatı kayıt profili çizimi kaldırıldı.
- Yan görünüşte PergoRise RayÇekici Araba Set İnce/Kalın blokları kaldırıldı.
- DXF TEXT STYLE STANDARD fontu Arial.ttf olarak ayarlandı.
