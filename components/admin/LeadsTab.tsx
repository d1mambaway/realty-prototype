"use client";

import { useEffect, useState } from "react";
import { Check, Phone, RotateCcw, Trash2 } from "lucide-react";
import type { Lead } from "@/lib/settings";
import { adminFetch, jsonBody } from "./api";

const KIND = { listing: "По объявлению", sell: "Хочет продать / обменять", contact: "Обратная связь" } as const;

export function LeadsTab({ onError }: { onError: (e: unknown) => void }) {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [showDone, setShowDone] = useState(false);

  const load = () => adminFetch<Lead[]>("leads").then(setLeads).catch(onError);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(lead: Lead, init: RequestInit) {
    try {
      await adminFetch(`leads/${lead.id}`, init);
      await load();
    } catch (e) {
      onError(e);
    }
  }

  const shown = (leads ?? []).filter((l) => showDone || l.status === "new");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Заявки</h1>
          {leads && <p className="mt-1 text-sm text-muted">Новых: {leads.filter((l) => l.status === "new").length}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} className="h-4 w-4 accent-ink" />
          Показывать обработанные
        </label>
      </div>

      {!leads ? (
        <p className="mt-10 text-muted">Загрузка…</p>
      ) : shown.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-line p-10 text-center text-muted">Новых заявок нет</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {shown.map((lead) => {
            const data = lead.data ? (JSON.parse(lead.data) as Record<string, unknown>) : null;
            return (
              <li key={lead.id} className={`rounded-3xl border border-line bg-white p-5 ${lead.status === "done" ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                      {KIND[lead.kind]} · {new Date(`${lead.created_at}Z`).toLocaleString("ru-RU")}
                    </p>
                    <p className="mt-1 text-lg font-semibold">{lead.name}</p>
                    <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-accent hover:underline">
                      <Phone className="h-4 w-4" /> {lead.phone}
                    </a>
                  </div>
                  <div className="flex gap-1">
                    {lead.status === "new" ? (
                      <button type="button" onClick={() => act(lead, { method: "PATCH", ...jsonBody({ status: "done" }) })} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-accent">
                        <Check className="h-4 w-4" /> Обработано
                      </button>
                    ) : (
                      <button type="button" onClick={() => act(lead, { method: "PATCH", ...jsonBody({ status: "new" }) })} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold hover:bg-sand">
                        <RotateCcw className="h-4 w-4" /> Вернуть
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Удалить"
                      onClick={() => confirm("Удалить заявку?") && act(lead, { method: "DELETE" })}
                      className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {lead.message && <p className="mt-3 whitespace-pre-line text-ink/80">{lead.message}</p>}
                {lead.listing_id && (
                  <a href={`/listing/?id=${lead.listing_id}`} target="_blank" className="mt-2 inline-block text-sm font-medium text-accent hover:underline">
                    Открыть объявление →
                  </a>
                )}
                {data && (
                  <dl className="mt-3 grid gap-x-6 gap-y-1 rounded-2xl bg-sand/50 p-4 text-sm sm:grid-cols-2">
                    {Object.entries(data)
                      .filter(([, v]) => v !== "" && v != null && !(Array.isArray(v) && v.length === 0))
                      .map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <dt className="text-muted">{k}:</dt>
                          <dd className="font-medium">{Array.isArray(v) ? v.join(", ") : String(v)}</dd>
                        </div>
                      ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
