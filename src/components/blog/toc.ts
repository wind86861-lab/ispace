import type { Locale } from "@/i18n/routing";
import type { PostBlock } from "@/content/types";
import { t as pick } from "@/lib/locale";
import type { TocItem } from "./PostToc";

/**
 * Sarlavha anchor'i — blok INDEKSIDAN.
 *
 * Matndan slug yasash jozibali ko'rinadi, lekin sarlavha tahrirlanganda
 * havola buziladi va uch tilda uchta boshqa anchor chiqadi. Indeks esa
 * barqaror va tildan mustaqil.
 */
export const headingId = (index: number) => `h-${index}`;

/** Matndagi sarlavhalardan mundarija yig'adi. */
export function buildToc(blocks: PostBlock[] | undefined, locale: Locale): TocItem[] {
  if (!blocks) return [];
  return blocks
    .map((block, i) => ({ block, i }))
    .filter(({ block }) => block.kind === "heading")
    .map(({ block, i }) => ({
      id: headingId(i),
      label: pick((block as Extract<PostBlock, { kind: "heading" }>).text, locale),
    }));
}
