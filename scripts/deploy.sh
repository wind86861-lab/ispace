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

say "1/4 · Build (lokal)"
npm run build

say "2/4 · Yuborish"
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

say "3/4 · Qayta ishga tushirish"
"${SSH[@]}" "$HOST" "pm2 restart $APP --update-env >/dev/null && sleep 3 && pm2 list | grep -E '$APP|status'"

say "4/4 · Tekshirish"
code=$("${SSH[@]}" "$HOST" "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/uz")
if [ "$code" = "200" ]; then
  printf "\033[32mOK — sayt javob beryapti (HTTP %s)\033[0m\n" "$code"
else
  printf "\033[31mXATO — HTTP %s. Loglar: ssh %s 'pm2 logs %s --lines 50'\033[0m\n" "$code" "$HOST" "$APP"
  exit 1
fi
