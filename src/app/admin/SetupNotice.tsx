/**
 * `ADMIN_PASSWORD` sozlanmaganda ko'rsatiladigan yo'riqnoma.
 *
 * **Faqat `development` da.** Production'da bunday sahifa bo'lmaydi —
 * u yerda admin oddiygina 404 qaytaradi, ya'ni tashqaridan qaraganda
 * marshrutning o'zi mavjud emas. Dev'da esa jim 404 chalkashtiradi:
 * sozlanmagani bilan xato o'rtasidagi farq ko'rinmay qoladi.
 */
export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <p className="text-lg font-semibold tracking-tight text-espresso">
        i<span className="text-gold-deep">Space</span> — admin sozlanmagan
      </p>

      <p className="mt-3 text-[14px] leading-relaxed text-espresso-soft">
        Admin panel <code className="font-mono text-espresso">ADMIN_PASSWORD</code> berilgandagina
        ishlaydi. Hozir u bo‘sh, shuning uchun panel butunlay o‘chiq.
      </p>

      <ol className="mt-6 space-y-3 text-[13px] leading-relaxed text-espresso-soft">
        {[
          <>
            Loyiha ildizida <code className="font-mono text-espresso">.env.local</code> faylini
            yarating (yoki <code className="font-mono text-espresso">.env.example</code> dan nusxa oling).
          </>,
          <>
            Ichiga kamida 8 belgidan iborat parol yozing:
            <pre className="mt-2 overflow-x-auto rounded-lg bg-warm-white p-3 font-mono text-[12px] text-espresso">
              ADMIN_PASSWORD=sizning-kuchli-parolingiz
            </pre>
          </>,
          <>
            <strong className="font-semibold text-espresso">Serverni qayta ishga tushiring</strong> —
            muhit o‘zgaruvchilari faqat ishga tushishda o‘qiladi.
          </>,
        ].map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold-deep text-[11px] font-semibold text-warm-white">
              {i + 1}
            </span>
            <span className="flex-1">{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-8 rounded-xl border border-taupe/30 bg-warm-white p-4 text-[12px] leading-relaxed text-espresso-soft">
        Bu yo‘riqnoma faqat ishlab chiqish rejimida ko‘rinadi. Production’da parol
        berilmagan bo‘lsa <code className="font-mono">/admin</code> oddiy 404 qaytaradi.
      </p>
    </div>
  );
}
