# Pülümür Automation Studio - V6.1 Clean R12

Bu paket GitHub repo köküne doğrudan yüklenecek şekilde hazırlanmıştır. Zip içinde ekstra üst klasör yoktur; `index.html` direkt kökte olmalıdır.

UI üzerindeki eski `Web DXF V4 Bloklu` yazısı kaldırıldı. Yeni sürüm etiketi: `Web DXF V6 Clean R12`.

## Yükleme

Zip'i açın ve içindeki dosyaları GitHub reposunun ana dizinine yükleyin. Repo ana ekranında şu dosyalar görünmeli:

```text
index.html
style.css
app.js
dxfEngine.js
peri01Geometry.js
README.md
VERSION.txt
.nojekyll
samples/
docs/
tools/
.github/
```

GitHub Pages cache ihtimaline karşı CSS/JS bağlantılarına `?v=6.1` eklendi.

## Not

Bu sürümde gerçek BLOCK/INSERT gömme kapalıdır. DXF temiz R12 mantığıyla üretilir. Blokların çizgisel yeniden üretimi ve etkileşimli önizleme sonraki aşamada eklenecektir.
