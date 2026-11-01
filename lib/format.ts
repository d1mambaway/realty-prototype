import type { Dict } from "./dict";
import type { Listing } from "./types";

export function img(id: string, w = 1600): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

const HECTARE = 10_000;
const ARE = 100;

/** Площадь для показа: у земли — сотки или гектары, у остального — м² */
export function areaText(l: Listing, d: Dict): string {
  if (l.type === "land") {
    if (l.area >= HECTARE) return `${trim(l.area / HECTARE)} ${d.catalog.unitHa}`;
    return `${trim(l.area / ARE)} ${d.catalog.unitAre}`;
  }
  return `${l.area.toLocaleString("ru-RU")} m²`;
}

/** Цена за единицу площади: у земли — за сотку или гектар, у бизнеса не показываем */
export function unitPriceText(l: Listing, d: Dict): string | null {
  if (l.deal !== "sale" || l.area <= 0 || l.business) return null;
  if (l.type === "land") {
    if (l.area >= HECTARE) return `${Math.round(l.price / (l.area / HECTARE)).toLocaleString("ru-RU")} ${d.price.perHa}`;
    return `${Math.round(l.price / (l.area / ARE)).toLocaleString("ru-RU")} ${d.price.perAre}`;
  }
  return `${Math.round(l.price / l.area).toLocaleString("ru-RU")} ${d.price.perSqm}`;
}

function trim(n: number): string {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: n < 10 ? 2 : 1 });
}
