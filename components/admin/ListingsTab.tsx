"use client";

import { useEffect, useState } from "react";
import { Edit3, Eye, Plus, Star, Trash2 } from "lucide-react";
import { DICTS } from "@/lib/dict";
import type { Listing } from "@/lib/types";
import { adminFetch, jsonBody } from "./api";
import { ListingEditor } from "./ListingEditor";

const ru = DICTS.ru;
const STATUS_LABEL = { active: "На сайте", sold: "Продано", hidden: "Скрыто" } as const;
const STATUS_COLOR = { active: "bg-emerald-100 text-emerald-800", sold: "bg-red-100 text-red-700", hidden: "bg-sand text-muted" };

const title = (l: Listing) => (typeof l.title === "string" ? l.title : (l.title.ru ?? l.title.ro ?? l.title.en ?? ""));
const money = (n: number) => `${n.toLocaleString("ru-RU")} €`;

export function ListingsTab({ onError }: { onError: (e: unknown) => void }) {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [editing, setEditing] = useState<Listing | "new" | null>(null);
  const [query, setQuery] = useState("");

  const load = () => adminFetch<Listing[]>("listings").then(setListings).catch(onError);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(listing: Listing) {
    await adminFetch(`listings/${listing.id}`, { method: "PUT", ...jsonBody(listing) });
    await load();
  }

  async function remove(listing: Listing) {
    if (!confirm(`Удалить «${title(listing)}» навсегда? Если объект просто продан, лучше поставить статус «Продано» или «Скрыто».`)) return;
    try {
      await adminFetch(`listings/${listing.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      onError(e);
    }
  }

  if (editing) {
    return (
      <ListingEditor
        listing={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSave={async (l) => {
          try {
            await save(l);
            setEditing(null);
          } catch (e) {
            onError(e);
          }
        }}
      />
    );
  }

  const shown = (listings ?? []).filter((l) => !query || title(l).toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">Объявления</h1>
          {listings && (
            <p className="mt-1 text-sm text-muted">
              Всего {listings.length} · на сайте {listings.filter((l) => l.status === "active").length}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию"
            className="w-48 rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-accent sm:w-64"
          />
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent"
          >
            <Plus className="h-4 w-4" /> Добавить
          </button>
        </div>
      </div>

      {!listings ? (
        <p className="mt-10 text-muted">Загрузка…</p>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
          {shown.map((l) => (
            <li key={l.id} className="flex items-center gap-4 p-3 sm:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.images[0]} alt="" className="h-16 w-20 shrink-0 rounded-xl bg-sand object-cover sm:h-20 sm:w-28" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {l.featured && <Star className="mr-1 inline h-4 w-4 fill-amber-400 text-amber-400" />}
                  {title(l)}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {ru.deal[l.deal]} · {ru.type[l.type]} · {ru.city[l.city as keyof typeof ru.city] ?? l.city} · {money(l.price)}
                </p>
                <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[l.status ?? "active"]}`}>
                  {STATUS_LABEL[l.status ?? "active"]}
                </span>
              </div>
              <div className="flex shrink-0 gap-1">
                <a href={`/listing/?id=${l.id}`} target="_blank" title="Открыть на сайте" className="rounded-full p-2.5 text-muted hover:bg-sand hover:text-ink">
                  <Eye className="h-4 w-4" />
                </a>
                <button type="button" title="Редактировать" onClick={() => setEditing(l)} className="rounded-full p-2.5 text-muted hover:bg-sand hover:text-ink">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button type="button" title="Удалить" onClick={() => remove(l)} className="rounded-full p-2.5 text-muted hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {shown.length === 0 && <li className="p-10 text-center text-muted">Ничего не найдено</li>}
        </ul>
      )}
    </div>
  );
}
