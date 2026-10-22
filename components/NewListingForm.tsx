"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { sendLead } from "@/lib/store";
import { Consent } from "@/components/Contact";
import { useI18n } from "@/lib/i18n";
import { CITIES, DEALS, FEATURES, TYPES, type Deal, type PropertyType } from "@/lib/types";
import { DICTS } from "@/lib/dict";

const STEP_COUNT = 4;

interface FormState {
  deal: Deal;
  type: PropertyType;
  title: string;
  city: string;
  address: string;
  price: string;
  exchangeFor: string;
  area: string;
  rooms: string;
  floor: string;
  floors: string;
  description: string;
  features: string[];
  contactName: string;
  contactPhone: string;
}

const INITIAL: FormState = {
  deal: "sale",
  type: "apartment",
  title: "",
  city: CITIES[0],
  address: "",
  price: "",
  exchangeFor: "",
  area: "",
  rooms: "1",
  floor: "",
  floors: "",
  description: "",
  features: [],
  contactName: "",
  contactPhone: "",
};

export function NewListingForm() {
  const { d, city, feature } = useI18n();
  const e = d.form.errors;
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  function validate(s: number): string {
    if (s === 1) {
      if (!form.address.trim()) return e.address;
      if (form.deal === "exchange" && !form.exchangeFor.trim()) return e.exchangeFor;
    }
    if (s === 3) {
      if (!form.contactName.trim()) return e.name;
      if (form.contactPhone.replace(/\D/g, "").length < 8) return e.phone;
    }
    return "";
  }

  function next() {
    const err = validate(step);
    setError(err);
    if (err) return;
    if (step === STEP_COUNT - 1) return submit();
    setDir(1);
    setStep((s) => s + 1);
  }

  function back() {
    setError("");
    setDir(-1);
    setStep((s) => s - 1);
  }

  async function submit() {
    // Подписи — по-русски: заявка уходит агенту в Telegram и в админку
    const ru = DICTS.ru;
    setSending(true);
    try {
      await sendLead({
        kind: "sell",
        name: form.contactName.trim(),
        phone: form.contactPhone.trim(),
        message: [form.title.trim(), form.description.trim()].filter(Boolean).join("\n"),
        data: {
          Сделка: ru.dealAction[form.deal],
          Тип: ru.type[form.type],
          Город: ru.city[form.city as keyof typeof ru.city] ?? form.city,
          Адрес: form.address.trim(),
          "Цена, €": form.price,
          "Обмен на": form.deal === "exchange" ? form.exchangeFor.trim() : "",
          "Площадь, м²": form.area,
          Комнат: form.type === "land" ? "" : form.rooms,
          Этаж: form.floor && `${form.floor}${form.floors ? ` из ${form.floors}` : ""}`,
          Удобства: form.features.map((f) => ru.feature[f as keyof typeof ru.feature] ?? f),
        },
      });
      setDone(true);
    } catch {
      setError(e.storage);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-lg rounded-[2rem] bg-white p-10 text-center shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]"
      >
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent text-white"
        >
          <Check className="h-10 w-10" />
        </motion.span>
        <h2 className="mt-6 font-serif text-4xl">{d.form.doneTitle}</h2>
        <p className="mt-3 text-muted">{d.form.doneText}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-accent"
          >
            {d.form.view}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL);
              setStep(0);
              setDone(false);
            }}
            className="rounded-full border border-line px-6 py-3 font-semibold hover:border-ink"
          >
            {d.form.another}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{d.form.kicker}</p>
        <h1 className="mt-3 font-serif text-5xl font-medium sm:text-7xl">
          {d.form.title[0]} <em className="text-accent">{d.form.title[1]}</em> {d.form.title[2]}
        </h1>
      </div>
      {/* Прогресс */}
      <div className="flex items-center gap-2">
        {d.form.steps.map((label, i) => (
          <div key={label} className="flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full bg-accent"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className={`mt-2 hidden text-xs font-semibold sm:block ${i <= step ? "text-ink" : "text-muted"}`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-10 overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-10">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-accent">
              {d.form.stepOf(step + 1, STEP_COUNT)}
            </p>
            <h2 className="mt-2 font-serif text-4xl">{d.form.steps[step]}</h2>

            <div className="mt-8 space-y-6">
              {step === 0 && (
                <>
                  <Group label={d.form.whatToDo}>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {DEALS.map((x) => (
                        <Option key={x} active={form.deal === x} onClick={() => update("deal", x)}>
                          {d.dealAction[x]}
                        </Option>
                      ))}
                    </div>
                  </Group>
                  <Group label={d.form.propertyType}>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {TYPES.map((t) => (
                        <Option key={t} active={form.type === t} onClick={() => update("type", t)}>
                          {d.type[t]}
                        </Option>
                      ))}
                    </div>
                  </Group>
                </>
              )}

              {step === 1 && (
                <>
                  <Input label={d.form.titleLabel} value={form.title} onChange={(v) => update("title", v)} placeholder={d.form.titlePh} />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Group label={d.form.city}>
                      <select value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls}>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {city(c)}
                          </option>
                        ))}
                      </select>
                    </Group>
                    <Input label={d.form.address} value={form.address} onChange={(v) => update("address", v)} placeholder={d.form.addressPh} />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input
                      label={
                        form.deal === "sale"
                          ? d.form.priceSale
                          : form.deal === "rent"
                            ? d.form.priceRent
                            : form.deal === "daily"
                              ? d.form.priceDaily
                              : d.form.priceExchange
                      }
                      value={form.price}
                      onChange={(v) => update("price", v.replace(/\D/g, ""))}
                      inputMode="numeric"
                    />
                    <Input label={d.form.area} value={form.area} onChange={(v) => update("area", v.replace(/\D/g, ""))} inputMode="numeric" />
                  </div>
                  {form.deal === "exchange" && (
                    <Input
                      label={d.form.exchangeFor}
                      value={form.exchangeFor}
                      onChange={(v) => update("exchangeFor", v)}
                      placeholder={d.form.exchangeForPh}
                    />
                  )}
                  {form.type !== "land" && (
                    <div className="grid gap-6 sm:grid-cols-3">
                      <Group label={d.form.rooms}>
                        <select value={form.rooms} onChange={(e) => update("rooms", e.target.value)} className={inputCls}>
                          <option value="0">{d.rooms(0)}</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </Group>
                      <Input label={d.form.floor} value={form.floor} onChange={(v) => update("floor", v.replace(/\D/g, ""))} inputMode="numeric" />
                      <Input label={d.form.floors} value={form.floors} onChange={(v) => update("floors", v.replace(/\D/g, ""))} inputMode="numeric" />
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <Group label={d.form.description}>
                    <textarea
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      rows={5}
                      placeholder={d.form.descriptionPh}
                      className={`${inputCls} resize-none`}
                    />
                  </Group>
                  <Group label={d.form.amenities}>
                    <div className="flex flex-wrap gap-2">
                      {FEATURES.map((f) => {
                        const on = form.features.includes(f);
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => update("features", on ? form.features.filter((x) => x !== f) : [...form.features, f])}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                              on ? "border-accent bg-accent text-white" : "border-line hover:border-ink"
                            }`}
                          >
                            {feature(f)}
                          </button>
                        );
                      })}
                    </div>
                  </Group>
                </>
              )}

              {step === 3 && (
                <>
                  <Input label={d.form.name} value={form.contactName} onChange={(v) => update("contactName", v)} />
                  <Input
                    label={d.form.phone}
                    value={form.contactPhone}
                    onChange={(v) => update("contactPhone", v)}
                    placeholder={d.form.phonePh}
                    inputMode="tel"
                  />
                  <p className="rounded-2xl bg-sand/60 p-4 text-sm text-muted">
                    {d.form.note}
                  </p>
                  <Consent />
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <button type="button" onClick={back} className="inline-flex items-center gap-2 font-semibold text-muted hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> {d.form.back}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={next}
            disabled={sending}
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-accent disabled:opacity-50"
          >
            {step === STEP_COUNT - 1 ? d.form.publish : d.form.next}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-line bg-ivory/60 px-4 py-3.5 text-[15px] outline-none transition-all placeholder:text-muted/70 focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} className={inputCls} />
    </label>
  );
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition-all duration-300 ${
        active ? "border-ink bg-ink text-white shadow-lg" : "border-line hover:-translate-y-0.5 hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
