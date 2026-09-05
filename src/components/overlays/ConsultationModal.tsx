"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { MessageSquare, Phone, User } from "lucide-react";
import { Modal } from "./Modal";
import { Field } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { normalizePhone, requiredText, uzPhoneRules } from "@/lib/validation";
import { useLeadSubmit } from "@/hooks/useLeadSubmit";
import { useUi } from "@/store/useUi";

export function ConsultationModal() {
  const t = useTranslations("consult");
  const open = useUi((s) => s.overlay === "consult");
  const close = useUi((s) => s.close);
  const { status, send } = useLeadSubmit<{ name: string; phone: string }>("consultation");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string; phone: string }>({ mode: "onSubmit" });

  return (
    <Modal open={open} onClose={close} title={t("title")} description={t("text")}>
      <form
        noValidate
        onSubmit={handleSubmit(async (values) => {
          await send({ name: values.name, phone: normalizePhone(values.phone) });
          reset();
        })}
        className="space-y-3"
      >
        <Field
          label={t("name")}
          error={errors.name?.message}
          icon={<User size={16} strokeWidth={1.5} />}
          autoComplete="name"
          {...register("name", requiredText(t("errors.nameMin")))}
        />
        <Field
          label={t("phone")}
          error={errors.phone?.message}
          icon={<Phone size={16} strokeWidth={1.5} />}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          {...register("phone", uzPhoneRules(t("errors.phoneInvalid")))}
        />

        <SubmitButton
          status={status}
          className="mt-2"
          icon={<MessageSquare size={16} strokeWidth={1.5} aria-hidden="true" />}
          labels={{ idle: t("submit"), sending: t("sending"), sent: t("sent") }}
        />

        {status === "sent" && (
          <p role="status" className="pt-1 text-center text-xs text-espresso-soft">
            {t("successText")}
          </p>
        )}
      </form>

      <ul className="mt-6 grid gap-2 border-t border-taupe/25 pt-5 text-[12px] text-espresso-soft sm:grid-cols-3">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
          {t("benefits.free")}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
          {t("benefits.fast")}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
          {t("benefits.safe")}
        </li>
      </ul>
    </Modal>
  );
}
