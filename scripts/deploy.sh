#!/usr/bin/env bash
#
# iSpace — serverga yangilash.
#
# Build LOKALDA bajariladi, serverga faqat natija boradi. Sabab: maqsad
# server 1 GB RAM va 1 yadroga ega — u yerda `next build` (1-2 GB talab
# qiladi) ishga tushsa, OOM killer o'sha serverdagi boshqa proyektni
# ham o'ldiradi.
#
# `output: "standalone"` (next.config.ts) tufayli yuboriladigan hajm
# ~110 MB: to'liq `node_modules` (930 MB) ko'chirilmaydi.
#
# Ishlatish:
#   ./scripts/deploy.sh                 # SSH kalit bilan
#   SSHPASS='...' ./scripts/deploy.sh   # parol bilan (sshpass kerak)
#
set -euo pipefail

HOST="${DEPLOY_HOST:-root@159.194.210.37}"
DIR="${DEPLOY_DIR:-/var/www/ispace}"
APP="${DEPLOY_APP:-ispace}"

# Parol berilgan bo'lsa `sshpass` orqali, aks holda oddiy SSH.
if [ -n "${SSHPASS:-}" ]; then
  SSH=(sshpass -e ssh -o StrictHostKeyChecking=accept-new)
else
  SSH=(ssh -o StrictHostKeyChecking=accept-new)
fi

say() { printf "\n\033[1m▸ %s\033[0m\n" "$1"; }

# ------------------------------------------------------------------
# 1 · Kontentni SERVERDAN olib kelish
#
# Nega bu MAJBURIY: sahifalarning katta qismi statik (SSG) va ular
# BUILD paytida chiziladi. Build esa lokalda bajariladi — ya'ni
# prerender lokal `data/` ni o'qiydi. Natijada har deploy serverning
# haqiqiy kontentini ishlab chiquvchining eski nusxasi bilan
# almashtirib turardi: jonli saytda mavjud bo'lmagan rasm yo'llari
# paydo bo'lgan va sharhlar noto'g'ri ko'rsatilgan edi.
#
# Yuklangan fayllar ham olinadi. Prerenderning O'ZIGA ular kerak
# emas — HTML'ga faqat yo'l tushadi. Lekin ularsiz lokal nusxa
# yolg'onchi bo'lib qoladi: kontent `/media/...` ga ishora qiladi,
# fayl esa yo'q va lokal sayt `/_next/image` dan 400 oladi. Aynan shu
# konsol testini yiqitgan edi.
#
# Hajm hozir 3 MB atrofida. U o'nlab megabaytga chiqsa, bu qadamni
# `DEPLOY_SKIP_UPLOADS=1` bilan o'tkazib yuborish mumkin.
say "1/5 · Kontentni serverdan olish"
mkdir -p data/content
rsync -az --delete -e "${SSH[*]}" \
  "$HOST:$DIR/data/content/" data/content/ 2>/dev/null \
  || echo "  (serverda kontent yo'q — urug' qiymatlari ishlatiladi)"
rsync -az -e "${SSH[*]}" \
  "$HOST:$DIR/data/image-overrides.json" data/ 2>/dev/null \
  || echo "  (rasm almashtirishlari yo'q)"

if [ -z "${DEPLOY_SKIP_UPLOADS:-}" ]; then
  mkdir -p data/uploads
  rsync -az --delete -e "${SSH[*]}" \
    "$HOST:$DIR/data/uploads/" data/uploads/ 2>/dev/null \
    || echo "  (yuklangan fayllar yo'q)"
fi

say "2/5 · Build (lokal)"
npm run build

say "3/5 · Yuborish"
# MUHIM: bu ikki narsa HECH QACHON yuborilmaydi va o'chirilmaydi —
# ular serverda YASHAYDI, repoda esa yo'q:
#
#   data/  — saytning butun kontenti va admin yuklagan fayllari;
#   .env   — admin paroli va sessiya kaliti.
#
# `--delete` manbada yo'q faylni nishonda o'chiradi, ya'ni bu ro'yxatga
# qo'shilmagan har qanday server fayli deploy paytida yo'qoladi.
# Aynan shu bir marta `.env` ni o'chirib yuborgan va admin paneli
# "Admin sozlanmagan" deb ishlamay qolgan edi.
rsync -az --delete \
  --exclude 'data/' \
  --exclude '.env' \
  -e "${SSH[*]}" .next/standalone/ "$HOST:$DIR/"
rsync -az --delete -e "${SSH[*]}" .next/static/ "$HOST:$DIR/.next/static/"
rsync -az --delete -e "${SSH[*]}" public/ "$HOST:$DIR/public/"

say "4/5 · Qayta ishga tushirish"
"${SSH[@]}" "$HOST" "pm2 restart $APP --update-env >/dev/null && sleep 3 && pm2 list | grep -E '$APP|status'"

say "5/5 · Tekshirish"
code=$("${SSH[@]}" "$HOST" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/uz")
if [ "$code" = "200" ]; then
  printf "\033[32mOK — sayt javob beryapti (HTTP %s)\033[0m\n" "$code"
else
  printf "\033[31mXATO — HTTP %s. Loglar: ssh %s 'pm2 logs %s --lines 50'\033[0m\n" "$code" "$HOST" "$APP"
  exit 1
fi
