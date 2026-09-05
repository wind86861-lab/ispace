import Image from "next/image";
import { isVideoSrc } from "@/components/ui/SmartMedia";
import { youTubeEmbed } from "@/lib/youtube";
import type { Media, ProductStoryBlock } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { mediaFit, IMAGE_QUALITY } from "@/lib/media";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Mahsulot sahifasining pastki bloklari.
 *
 * ASOSIY QOIDA: blok faqat o'z rasmi HAQIQATAN yuklangan bo'lsa
 * chiziladi. Kontentda bloklar oldindan e'lon qilingan, lekin
 * `public/images/...` dagi fayl hali o'rindosh (iliq gradient) bo'lsa,
 * foydalanuvchi bo'sh ramkani ko'rmasligi kerak.
 *
 * Yuklanganini `Media.uploaded` aytadi — uni `applyOverrides` qo'yadi:
 * ya'ni "bu yo'l uchun admin panelida fayl bor". Fayl nomiga yoki
 * o'lchamiga qarab taxmin qilinmaydi.
 *
 * Kichik rasmlar (`thumbs`) ham alohida filtrlanadi: uchtadan ikkitasi
 * yuklangan bo'lsa, qatorda o'sha ikkitasi ko'rinadi.
 */
const isReady = (m: Media) => m.uploaded === true;

export function ProductStory({
  blocks,
  locale,
}: {
  blocks: ProductStoryBlock[];
  locale: Locale;
}) {
  /*
   * Blok qachon chiziladi:
   *
   *  · mediasi YUKLANGAN bo'lsa — banner yoki video bloki;
   *  · mediasi umuman belgilanmagan (bo'sh uyalar) bo'lsa, lekin matni
   *    bor — bu MATN bloki, admin uni ataylab shunday qoldirgan.
   *
   * Yo'l ko'rsatilgan, lekin fayl hali yuklanmagan blok esa
   * KO'RSATILMAYDI: u yarim tayyor va sahifada bo'sh ramka bo'lib
   * qolardi.
   */
  const ready = blocks.filter((b) => {
    if (b.media.some(isReady)) return true;
    const awaiting = b.media.some((m) => m.src.trim() !== "");
    const hasText = Boolean(b.title || b.text);
    return !awaiting && hasText;
  });

  if (ready.length === 0) return null;

  return (
    <div className="flex flex-col gap-16 sm:gap-24">
      {ready.map((block) => (
        <StoryBlock key={block._id} block={block} locale={locale} />
      ))}
    </div>
  );
}

function StoryBlock({ block, locale }: { block: ProductStoryBlock; locale: Locale }) {
  const media = block.media.filter(isReady);
  const thumbs = (block.thumbs ?? []).filter(isReady);

  const heading = block.title && (
    <Reveal>
      <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.15] break-words text-espresso">
        {pick(block.title, locale)}
      </h2>
    </Reveal>
  );

  const body = block.text && (
    <Reveal variant="smoke" delay={0.08}>
      {/* Qator tashlashlar saqlanadi — izohi `ProductTabs` da. */}
      <p className="measure mt-4 text-sm leading-relaxed whitespace-pre-line text-espresso-soft">
        {pick(block.text, locale)}
      </p>
    </Reveal>
  );

  /*
   * Maket YUKLANGAN media soniga moslashadi.
   *
   * `pair` ikkita media uchun mo'ljallangan: ikkita tor, baland kadr
   * yonma-yon. Bittasi yuklanmagan bo'lsa esa sahifada yarim kenglikdagi
   * yolg'iz baland ustun qolardi va uning yonida bo'sh joy — aynan
   * "banner to'liq ko'rinmayapti" degan holat. Bunday paytda blok
   * `wide` bo'lib chiziladi: bitta kadr butun kenglikni egallaydi.
   *
   * Xuddi shunday `split` ham: media yo'q bo'lsa matnning o'zi qoladi
   * va u yarim ustunda siqilib turmasligi kerak.
   */
  /*
   * YouTube havolasi bo'lsa u yuklangan mediadan USTUN: blok video
   * bo'lib chiziladi. Shu sabab maketni hisoblashda ham u media
   * bilan teng hisoblanadi — aks holda "media yo'q" deb matn blokiga
   * tushib qolardi.
   */
  const youtube = block.youtubeId;

  const layout =
    !youtube && media.length === 0
      ? "text"
      : block.layout === "pair" && media.length < 2
        ? "wide"
        : block.layout;

  if (layout === "text") {
    return (
      <section className="container-lux">
        {/*
          Matn bloki CHAPDAN boshlanadi va bo'lim kengligini TO'LIQ
          egallaydi — qolgan bo'limlar bilan bir xil chiziqlar orasida.
          Ilgari u `max-w-[46rem]` bilan yarim kenglikda qolardi va
          o'ng tomonda tushunarsiz bo'shliq turardi.

          Matnning o'zi esa `measure` bilan cheklanmaydi: bu blokda
          uzunligini admin hal qiladi, biz emas.
        */}
        {heading}
        {/*
          `overflow-wrap: anywhere` — bu blokda `measure` yo'q, ya'ni
          uning ichidagi bir xil himoya ham yo'q. Bo'sh joysiz uzun
          satr (yopishtirilgan havola) bo'linmasdan bo'limdan chiqib
          ketardi va butun sahifada gorizontal scroll paydo qilardi.
        */}
        {block.text && (
          <p className="mt-4 text-sm leading-relaxed whitespace-pre-line [overflow-wrap:anywhere] text-espresso-soft">
            {pick(block.text, locale)}
          </p>
        )}
      </section>
    );
  }

  if (layout === "wide") {
    return (
      <section>
        {(heading || body) && (
          <div className="container-lux mb-8 text-center">
            {heading}
            <div className="mx-auto flex justify-center">{body}</div>
          </div>
        )}
        <Reveal variant="mask">
          {youtube ? (
            <YouTubeFrame id={youtube} title={block.title ? pick(block.title, locale) : ""} />
          ) : (
            <Frame media={media[0]} locale={locale} ratio="aspect-[16/7]" sizes="100vw" />
          )}
        </Reveal>
      </section>
    );
  }

  if (layout === "pair") {
    return (
      <section className="container-lux">
        {(heading || body) && <div className="mb-8 text-center">{heading}{body}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          {media.map((m) => (
            <Reveal key={m.src} variant="mask">
              <Frame media={m} locale={locale} ratio="aspect-[4/5]" sizes="(max-width: 640px) 100vw, 50vw" />
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  /* split — matn va media yonma-yon */
  return (
    <section className="container-lux">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={block.reverse ? "lg:order-2" : undefined}>
          {heading}
          {body}

          {thumbs.length > 0 && (
            <Reveal stagger={0.07} delay={0.16} className="mt-6 flex flex-wrap gap-3">
              {thumbs.map((m) => (
                <span
                  key={m.src}
                  className="relative size-20 overflow-hidden rounded-xl border border-taupe/30 bg-cream sm:size-24"
                >
                  <Image
                    src={m.src}
                    alt={pick(m.alt, locale)}
                    fill
                    quality={IMAGE_QUALITY}
                    sizes="96px"
                    style={mediaFit(m).style}
                    className={mediaFit(m).className}
                  />
                </span>
              ))}
            </Reveal>
          )}
        </div>

        <Reveal variant="mask" className={block.reverse ? "lg:order-1" : undefined}>
          {youtube ? (
            <YouTubeFrame
              id={youtube}
              title={block.title ? pick(block.title, locale) : ""}
              ratio="aspect-video"
            />
          ) : (
            <Frame
              media={media[0]}
              locale={locale}
              ratio="aspect-[4/3]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </Reveal>
      </div>
    </section>
  );
}

function Frame({
  media,
  locale,
  ratio,
  sizes,
}: {
  media: Media;
  locale: Locale;
  ratio: string;
  sizes: string;
}) {
  return (
    <div className={`relative ${ratio} overflow-hidden rounded-2xl bg-cream`}>
      {/*
        Blok mediasi RASM ham, VIDEO ham bo'lishi mumkin — admin uni
        bir xil maydondan yuklaydi. Video bu yerda boshqaruvli:
        mahsulot haqidagi material odatda ko'rib chiqiladi, fon
        bezagi emas.
      */}
      {isVideoSrc(media.src) ? (
        <video
          src={media.src}
          controls
          playsInline
          preload="metadata"
          aria-label={pick(media.alt, locale)}
          className="size-full bg-espresso object-cover"
        />
      ) : (
        <Image
          src={media.src}
          alt={pick(media.alt, locale)}
          fill
          quality={IMAGE_QUALITY}
          sizes={sizes}
          style={mediaFit(media).style}
          className={mediaFit(media).className}
        />
      )}
    </div>
  );
}

/**
 * YouTube pleyeri.
 *
 * `loading="lazy"` MAJBURIY: iframe darrov yuklansa YouTube skriptlari
 * va uning kadr rasmlari sahifa og'irligiga qo'shiladi, holbuki blok
 * ko'pincha ekrandan ancha pastda turadi.
 */
function YouTubeFrame({
  id,
  title,
  ratio = "aspect-[16/7]",
}: {
  id: string;
  title: string;
  ratio?: string;
}) {
  return (
    <div className={`relative ${ratio} overflow-hidden rounded-2xl bg-espresso`}>
      <iframe
        src={youTubeEmbed(id)}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
