#!/usr/bin/env bash
# Vaqtinchalik rasm o'rindoshlari: to'g'ri o'lcham + iliq palitra, shunda
# layout real foto bilan qanday tursa, hozir ham shunday turadi.
# Real foto kelganda shu nomdagi fayl almashtiriladi, kod o'zgarmaydi.
set -euo pipefail
cd "$(dirname "$0")/.."

make() { # path WxH label tone
  local out=$1 size=$2 label=$3 tone=$4
  # `label` faqat konsol chiqishida ishlatiladi: rasm ustiga YOZILMAYDI.
  # Kartada matn ikki marta ko'rinib qolmasligi uchun (karta o'z sarlavhasini
  # allaqachon chizadi) o'rindosh sof gradient bo'ladi.
  convert -size "$size" \
    "gradient:${tone}" \
    -swirl 12 \
    -fill '#29221E' -alpha set -channel A -evaluate set 8% +channel \
    "$out"
  echo "  $out  ($size)"
}

echo "hero"
make public/images/hero/hero-premium.webp     1600x1100 "hero · premium"    "#EFE6D8-#D8C7AC"
make public/images/hero/hero-technology.webp  1600x1100 "hero · technology" "#E9E2D6-#CDBEA6"
make public/images/hero/hero-showroom.webp    1600x1100 "hero · showroom"   "#F1EAE0-#D2C3AA"

echo "categories"
make public/images/categories/massage-chairs.webp 1200x1400 "massage chairs" "#EDE4D6-#D5C4A8"
make public/images/categories/office-chairs.webp   900x700  "office chairs"  "#EFE8DC-#D9CBB2"
make public/images/categories/treadmills.webp      900x700  "treadmills"     "#ECE5D9-#D3C5AD"
make public/images/categories/exercise-bikes.webp  900x700  "exercise bikes" "#F0E9DD-#D7C9B0"
make public/images/categories/ellipticals.webp     900x700  "ellipticals"    "#EDE6DA-#D5C7AF"
make public/images/categories/vending.webp        1600x600 "vending"        "#F1ECE6-#DDD5CD"

echo "lead"
make public/images/lead/lead-chair.webp          2400x1600 "lead chair"     "#FCFAF6-#F1ECE6"

echo "products"
for p in crown-2 takumi sfera runner-x3 prestige-pro infinity-a350; do
  make "public/images/products/$p.webp" 900x900 "$p" "#F5F0E7-#E0D4BE"
done

echo "about"
make public/images/about/showroom-1.webp 600x600  "showroom 1" "#EFE7DA-#D6C8AF"
make public/images/about/showroom-2.webp 600x600  "showroom 2" "#ECE4D7-#D3C4AB"
make public/images/about/team.webp       600x600  "team"       "#F1EADE-#D8CAB2"
make public/images/about/service.webp    600x600  "service"    "#EDE5D8-#D4C6AD"
make public/images/about/video-poster.webp 1280x720 "showroom video" "#E4DACA-#C7B69A"

echo "blog"
make public/images/blog/choose.webp   800x500 "blog · choose"   "#F1EBE0-#DACDB6"
make public/images/blog/back.webp     800x500 "blog · back"     "#EEE7DB-#D7C9B1"
make public/images/blog/tech.webp     800x500 "blog · tech"     "#ECE5D8-#D4C6AE"
make public/images/blog/care.webp     800x500 "blog · care"     "#F0E9DE-#D9CBB4"
make public/images/blog/office.webp   800x500 "blog · office"   "#EDE6DA-#D5C7B0"
make public/images/blog/showroom.webp 800x500 "blog · showroom" "#EFE8DC-#D8CAB3"

echo "social / brand"
make public/images/og.jpg 1200x630 "iSpace" "#F6F1E9-#D8C7AC"
convert -size 512x512 xc:'#F6F1E9' -gravity center -pointsize 190 -fill '#29221E' \
  -annotate 0 "i" -fill '#B0894F' -annotate +60+0 "S" public/images/logo.png
echo "  public/images/logo.png"
