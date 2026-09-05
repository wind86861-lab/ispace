/**
 * YouTube havolasidan video ID sini ajratadi.
 *
 * Admin havolani qaysi ko'rinishda nusxalashini oldindan bilib
 * bo'lmaydi — brauzer manzil qatoridan, "Ulashish" oynasidan yoki
 * mobil ilovadan olingan havolalar har xil. Shuning uchun to'rttala
 * keng tarqalgan shakl ham qabul qilinadi:
 *
 *   youtube.com/watch?v=ID · youtu.be/ID
 *   youtube.com/embed/ID   · youtube.com/shorts/ID
 *
 * Faqat ID ning o'zi yozilgan bo'lsa ham ishlaydi.
 *
 * Qaytadigan qiymat — 11 belgili ID yoki `null`. Havola noto'g'ri
 * bo'lsa `null`: chaqiruvchi bu holatda video umuman chizmaydi,
 * ya'ni sahifada buzilgan iframe paydo bo'lmaydi.
 */
const ID = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeId(input: string | undefined | null): string | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;
  if (ID.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return ID.test(id) ? id : null;
  }

  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "youtube-nocookie.com") {
    return null;
  }

  const v = url.searchParams.get("v");
  if (v && ID.test(v)) return v;

  const parts = url.pathname.split("/").filter(Boolean);
  // `/embed/ID`, `/shorts/ID`, `/live/ID`
  if (parts.length === 2 && ["embed", "shorts", "live"].includes(parts[0]) && ID.test(parts[1])) {
    return parts[1];
  }

  return null;
}

/** `youtube-nocookie` — kuzatuv cookie'lari qo'yilmaydi. */
export const youTubeEmbed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
