"use client";

import { useForm } from "react-hook-form";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { Media, SiteContact, TrustPoint } from "@/content/types";
import type { Locale } from "@/i18n/routing";
import { t as pick } from "@/lib/locale";
import { IMAGE_QUALITY } from "@/lib/media";
import { Phone, Search, Send, ShieldCheck } from "lucide-react";
import { ICONS } from "@/components/ui/icons";
import { TelegramIcon } from "@/components/ui/icons";
import { SplitHeading } from "@/components/ui/SplitHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { normalizePhone, requiredText, uzPhoneRules } from "@/lib/validation";
import { useLeadSubmit } from "@/hooks/useLeadSubmit";

/** "Kerakli mahsulotni topmadingizmi?" — qisqa ariza formasi (§8). */
export function LeadForm({
  media,
  contact,
  trust,
}: {
  media: Media;
  contact: SiteContact;
  /**
   * Ishonch chizig'i — admin tahrirlaydigan kontent.
   *
   * Ilgari bu matnlar tarjima fayllarida (`lead.trust.*`) edi va ularni
   * o'zgartirish uchun dasturchi kerak edi. Endi ular kolleksiya.
   */
  trust: TrustPoint[];
}) {
  const t = useTranslations("lead");
  const locale = useLocale() as Locale;
  const { status, send } = useLeadSubmit<{ query: string; phone: string }>(
    "lead-form",
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ query: string; phone: string }>({ mode: "onSubmit" });

  return (
    /*
     * To'liq kenglikdagi band: ilgari bu bo'lim `container-lux` ichidagi
     * yumaloq karta edi va o'ng yarmi bo'sh turardi. Endi sirt ekran
     * chetidan chetigacha cho'ziladi, foto esa o'ng chekkadan chiqib
     * ketadi — sahifaning krem ritmini bo'luvchi arxitektura elementi.
     *
     * MATN esa baribir `container-lux` ichida qoladi: uning chap chizig'i
     * qolgan barcha bo'limlarniki bilan bir xil, ya'ni band kengaysa ham
     * tipografik panjara buzilmaydi.
     */
    <section id="lead" className="scroll-mt-28">
      <div className="border-y border-taupe/30 bg-alabaster">
        <div className="relative isolate overflow-hidden">
          {/*
            Foto BUTUN fonni egallaydi va u yerda MIXLANIB turadi:
            sahifa siljiydi, rasm qimirlamaydi (`bg-pinned-*` izohiga
            qarang). Shu sabab u endi bandning emas, EKRANNING
            o'lchamida — `sizes` va tavsiya etilgan fayl o'lchami ham
            shundan kelib chiqadi (`image-slots.ts`).

            Ilgari u o'ng chekkadagi 42% da turardi va bandning chap
            yarmi tekis alabaster bo'lib qolardi. Endi rasm butun
            yuzada, matn esa uning ustida — o'qish uchun "parda"
            qatlami qo'yiladi.
          */}
          <div
            aria-hidden="true"
            className="bg-pinned-frame pointer-events-none -z-10"
          >
            <div className="bg-pinned-layer">
              <Image
                src={media.src}
                alt=""
                fill
                priority={false}
                quality={IMAGE_QUALITY}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: "72% 50%" }}
              />
            </div>

            {/*
              Ikki xil parda, chunki matn ikki xil joylashadi:
               · keng ekranda matn CHAPDA — gorizontal gradient yetadi;
               · tor ekranda matn fotoning USTIDA yotadi, u yerda
                 gorizontal gradient ish bermaydi — shuning uchun
                 yuqoridan pastga so'nuvchi qatlam.
            */}
            <div className="lead-veil-narrow absolute inset-0 lg:hidden" />
            <div className="lead-veil absolute inset-0 hidden lg:block" />
          </div>

          <div className="container-lux relative py-20 sm:py-24 lg:py-28">
            {/* Matn ustuni foto zonasidan tashqarida qoladi: 1024px da 32rem,
                  kengroq ekranda 40rem — ikkalasi ham 58% chizig'idan chapda. */}
            <div className="lg:max-w-[32rem] xl:max-w-[40rem]">
              <SplitHeading
                label={t("title")}
                className="text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.12]"
              >
                {t("title")}
              </SplitHeading>

              <Reveal as="p" variant="smoke" delay={0.1}>
                <span className="measure mt-4 block text-sm leading-relaxed text-espresso-soft">
                  {t("text")}
                </span>
              </Reveal>

              <Reveal delay={0.16}>
                <form
                  noValidate
                  onSubmit={handleSubmit(async (values) => {
                    await send({
                      query: values.query,
                      phone: normalizePhone(values.phone),
                    });
                    reset();
                  })}
                  className="mt-8 grid gap-3"
                >
                  {/*
                    Maket ritmi: keng maydon tepada, pastda esa telefon va
                    yuborish tugmasi BIR QATORDA. Ilgari tugma ikkala maydon
                    yonida to'liq balandlikdagi kvadrat blok edi — u formaning
                    o'zidan og'irroq ko'rinardi va telefonda 115px balandlikni
                    egallardi.
                  */}
                  <Field
                    label={t("query")}
                    error={errors.query?.message}
                    icon={<Search size={16} strokeWidth={1.5} />}
                    autoComplete="off"
                    {...register(
                      "query",
                      requiredText(t("errors.queryMin"), 3),
                    )}
                  />

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <Field
                      label={t("phone")}
                      error={errors.phone?.message}
                      icon={<Phone size={16} strokeWidth={1.5} />}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      {...register(
                        "phone",
                        uzPhoneRules(t("errors.phoneInvalid")),
                      )}
                    />

                    <SubmitButton
                      status={status}
                      className="sm:w-48"
                      icon={
                        <Send size={16} strokeWidth={1.5} aria-hidden="true" />
                      }
                      labels={{
                        idle: t("submit"),
                        sending: t("sending"),
                        sent: t("sent"),
                      }}
                    />
                  </div>

                  {/* Rozilik eslatmasi — maketdagidek forma ostida, qalqon
                      ikoni bilan; huquqiy jihatdan ham shu yerda turishi kerak. */}
                  <p className="mt-1 flex items-start gap-2 text-[12px] leading-relaxed text-espresso-soft/85">
                    <ShieldCheck
                      size={14}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className="mt-px shrink-0 text-gold"
                    />
                    {t("consent")}
                  </p>

                  {status === "sent" && (
                    <p role="status" className="text-xs text-espresso-soft">
                      {t("successText")}
                    </p>
                  )}
                </form>
              </Reveal>
            </div>
          </div>
        </div>

        {/*
          Ishonch chizig'i.

          Ilgari bu bitta `flex-wrap` qator edi: uchta kafolat va aloqa
          bloki bir oqimda turardi. Joy yetmay qolganda aloqa bloki
          pastga tushardi, lekin `ms-auto` va chap ajratuvchi chiziq
          o'zi bilan birga ketardi — natijada u sahifa o'rtasida
          osilib, tepasidagi hech narsaga bog'lanmagan chiziq bilan
          turardi.

          Endi ikki zona ANIQ: kafolatlar panjarasi va aloqa bloki.
          Ajratuvchi chiziq faqat ular haqiqatan yonma-yon turganda
          (`xl`) chapdan chiziladi; undan tor ekranda esa u tepadagi
          chiziqqa aylanadi.
        */}
        <div className="border-t border-taupe/30">
          <div className="container-lux grid gap-7 py-7 xl:grid-cols-[1fr_auto] xl:items-center xl:gap-10">
            <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
              {/* Tartib `rank` bo'yicha — admin ro'yxatdagi joyini shu bilan
                  boshqaradi, omborga yozilish tartibi bilan emas. */}
              {[...trust]
                .sort((a, b) => a.rank - b.rank)
                .map(({ _id, icon, title, text }) => {
                  const Icon = ICONS[icon];
                  return (
                    <li key={_id} className="flex items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-taupe/40 bg-warm-white text-gold">
                        <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="text-sm font-medium text-espresso">
                          {pick(title, locale)}
                        </span>
                        <span className="text-[13px] text-espresso-soft/85">
                          {pick(text, locale)}
                        </span>
                      </span>
                    </li>
                  );
                })}
            </ul>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-taupe/30 pt-6 xl:border-t-0 xl:border-s xl:pt-0 xl:ps-10">
              <a
                href={contact.phoneHref}
                className="group flex items-center gap-3"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-taupe/40 bg-warm-white text-gold transition-colors duration-300 group-hover:border-gold/60">
                  <Phone size={17} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[11px] tracking-[0.12em] text-espresso-soft/85 uppercase">
                    {t("orCall")}
                  </span>
                  <span className="text-sm font-medium text-espresso transition-colors duration-300 group-hover:text-gold-ink">
                    {contact.phone}
                  </span>
                </span>
              </a>

              <a
                href={contact.telegram}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-3"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-taupe/40 bg-warm-white text-gold transition-colors duration-300 group-hover:border-gold/60">
                  <TelegramIcon className="size-4" />
                </span>
                <span className="text-sm text-espresso-soft transition-colors duration-300 group-hover:text-gold-ink">
                  {t("telegram")}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
