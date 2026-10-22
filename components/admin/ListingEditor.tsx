"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { DICTS, type Lang } from "@/lib/dict";
import { CITIES, DEALS, FEATURES, TYPES, type Listing, type Localized } from "@/lib/types";
import { uploadPhoto } from "./api";

const ru = DICTS.ru;
const LANG_LABEL: Record<Lang, string> = { ro: "Română", ru: "Русский", en: "English" };
type Texts = Record<Lang, string>;

const toTexts = (v: Localized | undefined): Texts =>
  typeof v === "string" ? { ro: v, ru: v, en: v } : { ro: v?.ro ?? "", ru: v?.ru ?? "", en: v?.en ?? "" };
const fromTexts = (t: Texts): Localized | undefined => {
  const filled = Object.fromEntries(Object.entries(t).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()]));
  return Object.keys(filled).length ? filled : undefined;
};

const input = "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-accent";

export function ListingEditor({
  listing,
  onSave,
  onCancel,
}: {
  listing: Listing | null;
  onSave: (l: Listing) => Promise<void>;
  onCancel: () => void;
}) {
  const [l, setL] = useState<Listing>(
    listing ?? {
      id: `l-${Date.now().toString(36)}`,
      title: "",
      deal: "sale",
      type: "house",
      price: 0,
      city: "chisinau",
      address: "",
      area: 0,
      rooms: 0,
      description: "",
      images: [],
      features: [],
      contactName: "",
      contactPhone: "",
      createdAt: new Date().toISOString().slice(0, 10),
      status: "active",
    },
  );
  const [title, setTitle] = useState<Texts>(toTexts(listing?.title));
  const [description, setDescription] = useState<Texts>(toTexts(listing?.description));
  const [exchangeFor, setExchangeFor] = useState<Texts>(toTexts(listing?.exchangeFor));
  const [lang, setLang] = useState<Lang>("ru");
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Listing>(key: K, value: Listing[K]) => setL((x) => ({ ...x, [key]: value }));
  const num = (v: string) => Number(v.replace(/\D/g, "")) || 0;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading(list.length);
    try {
      for (const file of list) {
        const url = await uploadPhoto(file);
        setL((x) => ({ ...x, images: [...x.images, url] }));
        setUploading((n) => n - 1);
      }
    } catch (e) {
      setError(`Не удалось загрузить фото: ${e instanceof Error ? e.message : e}`);
    } finally {
      setUploading(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function move(i: number, dir: -1 | 1) {
    const images = [...l.images];
    [images[i], images[i + dir]] = [images[i + dir], images[i]];
    set("images", images);
  }

  async function submit() {
    const t = fromTexts(title);
    if (!t) return setError("Заполните заголовок хотя бы на одном языке");
    if (!l.price) return setError("Укажите цену");
    if (!l.images.length) return setError("Добавьте хотя бы одно фото");
    setSaving(true);
    setError("");
    await onSave({ ...l, title: t, description: fromTexts(description) ?? "", exchangeFor: fromTexts(exchangeFor) });
    setSaving(false);
  }

  const LangTabs = (
    <div className="flex gap-1">
      {(Object.keys(LANG_LABEL) as Lang[]).map((k) => {
        const filled = title[k].trim() || description[k].trim();
        return (
          <button
            key={k}
            type="button"
            onClick={() => setLang(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${lang === k ? "bg-ink text-white" : "bg-sand text-ink"}`}
          >
            {LANG_LABEL[k]}
            {!filled && <span className="ml-1 text-xs opacity-60">(пусто)</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> К списку
      </button>
      <h1 className="mt-3 font-serif text-4xl">{listing ? "Редактирование" : "Новое объявление"}</h1>

      <div className="mt-8 space-y-8">
        <Section title="Фотографии" hint="Первое фото — обложка. Стрелками можно менять порядок.">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {l.images.map((src, i) => (
              <div key={src + i} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">Обложка</span>}
                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  <IconBtn disabled={i === 0} onClick={() => move(i, -1)} label="Левее"><ArrowLeft className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn onClick={() => set("images", l.images.filter((_, j) => j !== i))} label="Удалить"><X className="h-3.5 w-3.5" /></IconBtn>
                  <IconBtn disabled={i === l.images.length - 1} onClick={() => move(i, 1)} label="Правее"><ArrowRight className="h-3.5 w-3.5" /></IconBtn>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading > 0}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-muted hover:border-accent hover:text-accent"
            >
              {uploading > 0 ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
              <span className="text-xs font-semibold">{uploading > 0 ? `Загрузка… ${uploading}` : "Добавить"}</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
        </Section>

        <Section title="Сделка и тип">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Сделка">
              <select value={l.deal} onChange={(e) => set("deal", e.target.value as Listing["deal"])} className={input}>
                {DEALS.map((x) => <option key={x} value={x}>{ru.deal[x]}</option>)}
              </select>
            </Field>
            <Field label="Тип">
              <select value={l.type} onChange={(e) => set("type", e.target.value as Listing["type"])} className={input}>
                {TYPES.map((x) => <option key={x} value={x}>{ru.type[x]}</option>)}
              </select>
            </Field>
            <Field label="Статус">
              <select value={l.status ?? "active"} onChange={(e) => set("status", e.target.value as Listing["status"])} className={input}>
                <option value="active">На сайте</option>
                <option value="sold">Продано (видно с пометкой)</option>
                <option value="hidden">Скрыто</option>
              </select>
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={Boolean(l.featured)} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-ink" />
            Показывать в «Избранных объектах» на главной
          </label>
        </Section>

        <Section title="Текст объявления" hint="Можно заполнить один язык — на остальных покажется он же.">
          {LangTabs}
          <div className="mt-4 space-y-4">
            <Field label={`Заголовок (${LANG_LABEL[lang]})`}>
              <input value={title[lang]} onChange={(e) => setTitle({ ...title, [lang]: e.target.value })} className={input} />
            </Field>
            <Field label={`Описание (${LANG_LABEL[lang]})`}>
              <textarea
                value={description[lang]}
                onChange={(e) => setDescription({ ...description, [lang]: e.target.value })}
                rows={7}
                className={`${input} resize-y`}
              />
            </Field>
            <Field label={`${l.deal === "exchange" ? "Что хотят взамен" : "Возможен обмен (если нет — оставьте пустым)"} (${LANG_LABEL[lang]})`}>
              <input value={exchangeFor[lang]} onChange={(e) => setExchangeFor({ ...exchangeFor, [lang]: e.target.value })} className={input} />
            </Field>
          </div>
        </Section>

        <Section title="Параметры">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={l.deal === "rent" ? "Цена в месяц, €" : l.deal === "daily" ? "Цена за сутки, €" : l.deal === "exchange" ? "Оценочная стоимость, €" : "Цена, €"}>
              <input value={l.price || ""} onChange={(e) => set("price", num(e.target.value))} inputMode="numeric" className={input} />
            </Field>
            <Field label="Площадь, м² (участок: 1 сотка = 100 м²)">
              <input value={l.area || ""} onChange={(e) => set("area", num(e.target.value))} inputMode="numeric" className={input} />
            </Field>
            <Field label="Город / район">
              <select value={l.city} onChange={(e) => set("city", e.target.value)} className={input}>
                {CITIES.map((c) => <option key={c} value={c}>{ru.city[c as keyof typeof ru.city]}</option>)}
              </select>
            </Field>
            <Field label="Адрес (как показать на сайте)">
              <input value={l.address} onChange={(e) => set("address", e.target.value)} className={input} />
            </Field>
            <Field label="Комнат (0 — не показывать)">
              <input value={l.rooms || ""} onChange={(e) => set("rooms", num(e.target.value))} inputMode="numeric" className={input} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Этаж">
                <input value={l.floor ?? ""} onChange={(e) => set("floor", num(e.target.value) || undefined)} inputMode="numeric" className={input} />
              </Field>
              <Field label="Этажей">
                <input value={l.floors ?? ""} onChange={(e) => set("floors", num(e.target.value) || undefined)} inputMode="numeric" className={input} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Удобства">
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => {
              const on = l.features.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => set("features", on ? l.features.filter((x) => x !== f) : [...l.features, f])}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}
                >
                  {ru.feature[f as keyof typeof ru.feature]}
                </button>
              );
            })}
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-10 flex items-center justify-end gap-3 border-t border-line bg-ivory/95 px-4 py-4 backdrop-blur">
        {error && <p className="mr-auto text-sm font-medium text-red-600">{error}</p>}
        <button type="button" onClick={onCancel} className="rounded-full px-5 py-3 font-semibold text-muted hover:text-ink">
          Отмена
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving || uploading > 0}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 font-semibold text-white hover:bg-accent disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Сохранить
        </button>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function IconBtn({ onClick, label, disabled, children }: { onClick: () => void; label: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className="rounded-full bg-black/60 p-1.5 text-white disabled:opacity-30">
      {children}
    </button>
  );
}
