"use client";

import type { FaqItem } from "@/content/types";
import { CollectionAdmin } from "../CollectionAdmin";
import { LocaleField, emptyLocaleString } from "../LocaleFields";

export function FaqAdmin({ items }: { items: FaqItem[] }) {
  return (
    <CollectionAdmin<FaqItem>
      collection="faq"
      items={items}
      blank={() => ({ _id: "", question: emptyLocaleString(), answer: emptyLocaleString() })}
      addLabel="Savol qo‘shish"
      newTitle="Yangi savol"
      editTitle="Savolni tahrirlash"
      confirmText={(i) => `«${i.question.ru}» o‘chirilsinmi?`}
      renderRow={(i) => (
        <>
          <span className="block text-sm text-espresso">{i.question.ru}</span>
          <span className="mt-1 line-clamp-2 block text-[12px] text-espresso-soft">
            {i.answer.ru}
          </span>
        </>
      )}
      renderFields={(d, set) => (
        <>
          <LocaleField label="Savol" value={d.question} onChange={(question) => set({ ...d, question })} />
          <LocaleField label="Javob" multiline value={d.answer} onChange={(answer) => set({ ...d, answer })} />
        </>
      )}
    />
  );
}
