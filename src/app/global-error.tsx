"use client";

/**
 * Ildiz layout'ning o'zi qulagandagi oxirgi zaxira. Bu yerda next-intl
 * konteksti mavjud emas, shuning uchun matn qat'iy ruscha (defaultLocale)
 * va uslub inline — hech qanday tashqi bog'liqlikka tayanmaydi.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#F6F1E9",
          color: "#4A403A",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <h1 style={{ color: "#29221E", fontSize: "1.75rem", fontWeight: 500 }}>
            Что-то пошло не так
          </h1>
          <p style={{ maxWidth: "34ch", margin: "0.75rem auto 1.5rem", fontSize: "0.9rem" }}>
            Мы уже разбираемся. Попробуйте обновить страницу.
          </p>
          <button
            onClick={reset}
            style={{
              border: 0,
              borderRadius: 999,
              background: "#B0894F",
              color: "#FCFAF6",
              padding: "0.8rem 1.75rem",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Обновить страницу
          </button>
        </div>
      </body>
    </html>
  );
}
