"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CheckCircle2, Phone, User } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { SubmitButton, type SubmitStatus } from "@/components/ui/SubmitButton";
import { normalizePhone, requiredText, uzPhoneRules } from "@/lib/validation";
import { useShop } from "@/store/useShop";

/**
 * Buyurtmani rasmiylashtirish — savat panelining ichida.
 *
 * Nega alohida sahifa emas: savatda o'rtacha bir-ikki qator bo'ladi va
 * kerak bo'lgani ikkita maydon. Alohida sahifa foydalanuvchini
 * kontekstdan uzib, yana bitta qadam qo'shardi — bu bosqichda har
 * qadam yo'qotilgan buyurtma degani.
 *
 * NARX bu yerdan yuborilmaydi: server uni katalogdan qayta hisoblaydi.
 * Mijozdan faqat qaysi mahsulot va nechta ekani olinadi.
 */
export function CheckoutForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations("cart");
  const cart = useShop((s) => s.cart);
  const clearCart = useShop((s) => s.clearCart);

  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [failed, setFailed] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string; phone: string }>({ mode: "onSubmit" });

  if (status === "sent") {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-gold/12 text-gold-deep">
          <CheckCircle2 size={26} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="font-display mt-4 text-xl text-espresso">{t("sentTitle")}</p>
        <p className="mt-2 text-sm leading-relaxed text-espresso-soft">{t("sentText")}</p>
        <button
          type="button"
          onClick={onDone}
          className="mt-6 text-[14px] font-medium text-gold-deep hover:underline"
        >
          {t("close")}
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setStatus("sending");
        setFailed(null);

        const res = await fetch("/api/order", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            source: "cart",
            name: values.name,
            phone: normalizePhone(values.phone),
            items: cart.map((l) => ({ productId: l.productId, qty: l.qty })),
          }),
        }).catch(() => null);

        if (!res || !res.ok) {
          const msg = res ? ((await res.json().catch(() => ({}))).error as string) : null;
          setStatus("idle");
          setFailed(msg ?? t("failed"));
          return;
        }

        /*
         * Savat FAQAT muvaffaqiyatdan keyin tozalanadi. Oldin
         * tozalansa, tarmoq uzilganda foydalanuvchi tanlovini
         * yo'qotardi va hammasini qaytadan yig'ishga majbur bo'lardi.
         */
        clearCart();
        setStatus("sent");
      })}
      className="grid gap-3"
    >
      <p className="text-[13px] leading-relaxed text-espresso-soft">{t("checkoutHint")}</p>

      <Field
        label={t("name")}
        error={errors.name?.message}
        icon={<User size={16} strokeWidth={1.5} />}
        autoComplete="name"
        {...register("name", requiredText<{ name: string; phone: string }, "name">(t("nameError")))}
      />

      <Field
        label={t("phone")}
        type="tel"
        inputMode="tel"
        error={errors.phone?.message}
        icon={<Phone size={16} strokeWidth={1.5} />}
        autoComplete="tel"
        {...register("phone", uzPhoneRules<{ name: string; phone: string }, "phone">(t("phoneError")))}
      />

      {failed && (
        <p role="alert" className="rounded-xl bg-rosewood/10 px-4 py-3 text-[13px] text-rosewood">
          {failed}
        </p>
      )}

      <SubmitButton
        status={status}
        className="w-full"
        labels={{ idle: t("submit"), sending: t("sending"), sent: t("sentTitle") }}
      />

      <button
        type="button"
        onClick={onDone}
        className="text-[13px] text-espresso-soft transition-colors duration-300 hover:text-espresso"
      >
        {t("back")}
      </button>
    </form>
  );
}
