# Pülümür Automation Studio — V8.2.28

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
