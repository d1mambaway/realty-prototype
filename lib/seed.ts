import { REAL_LISTINGS } from "./real";
import type { Listing } from "./types";

// Объявления, с которыми сайт собирается. Позже их заменит база (Cloudflare D1).
export const SEED_LISTINGS: Listing[] = REAL_LISTINGS;
