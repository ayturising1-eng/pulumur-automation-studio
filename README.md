# Pülümür Automation Studio

## v8.2.36
- Çoklu poz üst toplam ölçüsü, yan/cam kayıt profili çiziliyorsa poz 1 sol profil -X dış ucundan son poz sağ profil +X dış ucuna göre alınır.
- Yan/cam kayıt yoksa v8.2.31 ray arka mekanizma bloğu uç sınırı korunur.

Bu sürümde:
- PERI01 DraftSight v32 / AutoCAD v30 LISP kaynak mantığına göre parapet aktifken karşı görünüşe parapet ölçülendirmesi eklendi.
- Parapet yüksekliği, parapet alt kotu ile parapet üst kotu arasında ölçülür.
- Parapet üstünden oluk altı/dikme üst referansına kadar kalan dikme yüksekliği ayrıca ölçülür.
- Parapet ek ölçüleri LISP tarafındaki gibi sol ölçü aksına alınır ve %18 küçük ölçü grafiğiyle çizilir.
- Yan görünüş ön yükseklik ölçüsü, parapet aktifken de toplam ön yüksekliği gösterecek şekilde PERI01 kot mantığına göre düzeltildi.
- V8.2.27 çoklu poz üst genişlik ve toplam dıştan dışa genişlik ölçüleri korunmuştur.
- V8.2.26 trapez tarama sınırı korunur: tarama her pozda ilk ray ile son ray arasında kalır.


## v8.2.31
- Parapetli karşı görünüş ölçüleri sadeleştirildi.
- Çoklu poz toplam üst ölçüsü ray arka mekanizma blok uçlarına bağlandı.
- PDF çıktısı vektörel çizim kalitesine yükseltildi.


## v8.2.77
- Cam kaydı profilleri önizlemede tıklanabilir hale getirildi.
- Cam kaydı profil editörü eklendi: Standart 100x100x2, 40x130x2 ve Diğer.
- Yan görünüşte profil yüksekliği En değerine, üst görünüşte profil genişliği Boy değerine bağlandı.
- Et kalınlığı için iç dikdörtgen ofset çizimi eklendi.


## v8.2.79
- Cam kaydı uzun profillerinde iç et/ofset çizimi kaldırıldı.
- Et/ofset çizimi sadece destek dikmesinin üst kesit görünüşünde bırakıldı.
- Yan destek dikmesinin alt ucu sabit, üst ucu cam kaydı profil yüksekliğine göre uzayıp/kısalacak şekilde düzenlendi.
- Sağ yan görünüşte aynalanan cam kaydı/destek interaction alanları korunur.
