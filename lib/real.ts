import type { Listing } from "./types";

// Настоящие объявления агентства (перенесены с 999.md, фото — в public/listings/)
// TODO: заменить на реальные имя и телефон агента
const CONTACT = { contactName: "REZULTAT", contactPhone: "+373 22 000 000" };

const photos = (slug: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/listings/${slug}/${i + 1}.jpg`);

export const REAL_LISTINGS: Listing[] = [
  {
    id: "hincesti-townhouses",
    title: {
      ro: "4 case townhouse în Hîncești — există chiriași",
      ru: "4 таунхауса в Хынчештах — есть арендаторы",
      en: "4 townhouses in Hîncești — tenants in place",
    },
    deal: "sale",
    type: "house",
    price: 550_000,
    exchangeFor: {
      ro: "Schimb parțial pe automobil, imobil sau materiale de construcție până la 150 000 €.",
      ru: "Частичный обмен на авто, недвижимость или стройматериалы до 150 000 €.",
      en: "Partial exchange for a car, property or building materials up to €150,000.",
    },
    city: "hincesti",
    address: "Hîncești",
    area: 560,
    rooms: 0,
    floors: 2,
    description: {
      ro: "Teren de 13 ari cu 4 case townhouse a câte 140 m², fiecare cu teren adiacent de 2–4 ari.\n\n1) O casă este gata de locuit: nouă, cu reparație, mobilă și tehnică. Are chiriași pe termen lung (de la 3 ani) — 1 000 € pe lună.\n2) Trei case în variantă albă (gri).\n\nPotrivit pentru hotel, oficiu sau locuințe. Este posibil creditul ipotecar. Casele se pot vinde și separat.",
      ru: "Участок 13 соток, на нём 4 таунхауса по 140 м², у каждого прилегающий участок 2–4 сотки.\n\n1) Один дом готов к въезду: новый, с ремонтом, мебелью и техникой. Есть долгосрочные арендаторы (от 3 лет) — 1 000 € в месяц.\n2) Три дома в сером варианте.\n\nПодходит под отель, офис или жильё. Возможна ипотека. Возможна продажа по отдельности.",
      en: "A 1,300 m² plot with 4 townhouses of 140 m² each, every one with its own 200–400 m² yard.\n\n1) One house is move-in ready: new, renovated, furnished and equipped. Long-term tenants (3+ years) pay €1,000 per month.\n2) Three houses are at the shell-and-core stage.\n\nSuitable for a hotel, offices or housing. Mortgage possible. The houses can also be sold separately.",
    },
    images: photos("hincesti-townhouses", 10),
    features: ["parking", "furniture", "appliances", "terrace"],
    ...CONTACT,
    createdAt: "2026-10-21",
    featured: true,
  },
  {
    id: "anenii-noi-block",
    title: {
      ro: "Pentru investitori: bloc locativ cu 47 de apartamente",
      ru: "Инвестору: жилой дом на 47 квартир",
      en: "For investors: residential block with 47 apartments",
    },
    deal: "sale",
    type: "commercial",
    price: 890_000,
    exchangeFor: {
      ro: "Schimb pe automobil sau imobil până la 100 000 €.",
      ru: "Обмен на авто или недвижимость до 100 000 €.",
      en: "Exchange for a car or property up to €100,000.",
    },
    city: "aneniiNoi",
    address: "or. Anenii Noi",
    area: 4000,
    rooms: 0,
    floors: 6,
    description: {
      ro: "Proiect investițional: bloc locativ cu 47 de apartamente pe un teren de 30 de ari. Proiectul este înregistrat la Cadastru — 47 de numere cadastrale, există expertiza tehnică a clădirii.\n\n6 etaje plus demisol, suprafața totală 4 000 m². Preț: 222 €/m². La o investiție de circa 500 000 € (120 €/m²) e posibilă finisarea albă, cu un cost final de circa 350 €/m².\n\nLa 10 minute pe jos de magazin și stația de pe traseul Chișinău–Bender, 30 de minute cu mașina până la Chișinău.\n\nExistă cumpărători pentru apartamente. Organizăm reparația și vânzarea ulterioară, inclusiv o ipotecă de grup pentru familii tinere. Detalii la cerere.",
      ru: "Инвестиционный проект: жилой дом на 47 квартир на участке 30 соток. Проект зарегистрирован в Кадастре — 47 кадастровых номеров, есть заключение технической экспертизы здания.\n\n6 этажей плюс полуподвал, общая площадь 4 000 м². Цена: 222 €/м². При инвестициях около 500 000 € (120 €/м²) возможна «белая» отделка с итоговой себестоимостью около 350 €/м².\n\n10 минут пешком до магазина и остановки на трассе Кишинёв–Бендеры, 30 минут на машине до Кишинёва.\n\nЕсть покупатели квартир. Организуем ремонт и последующую продажу, в том числе групповую ипотеку для молодых семей. Детали по запросу.",
      en: "Investment project: a residential block with 47 apartments on a 3,000 m² plot. Registered with the Cadastre — 47 cadastral numbers, with a technical survey of the building.\n\n6 floors plus a semi-basement, 4,000 m² in total. Price: €222/m². With an investment of about €500,000 (€120/m²) a white-box finish is possible, for a final cost of about €350/m².\n\nA 10-minute walk to a shop and the bus stop on the Chișinău–Bender road, 30 minutes by car to Chișinău.\n\nBuyers for the apartments are already lined up. We can organise the renovation and resale, including a group mortgage for young families. Details on request.",
    },
    images: photos("anenii-noi-block", 3),
    features: ["parking"],
    ...CONTACT,
    createdAt: "2026-10-21",
    featured: true,
  },
  {
    id: "office-botanica",
    title: {
      ro: "Oficiu de 250 m² în Botanica",
      ru: "Офис 250 м² на Ботанике",
      en: "250 m² office in Botanica",
    },
    deal: "rent",
    type: "commercial",
    // На 999.md указано 13 € — считаем, что это за м² в месяц: 13 × 250
    price: 3_250,
    city: "chisinau",
    address: "bd. Dacia 58/12, Botanica",
    area: 250,
    rooms: 0,
    description: {
      ro: "Spații de oficiu în business centrul iTower — de la 240 până la 2 000 m². Chiria: 13 € pe m² pe lună. Parcare.",
      ru: "Офисные помещения в бизнес-центре iTower — от 240 до 2 000 м². Аренда: 13 € за м² в месяц. Парковка.",
      en: "Office space in the iTower business centre — from 240 to 2,000 m². Rent: €13 per m² per month. Parking.",
    },
    images: photos("office-botanica", 4),
    features: ["parking", "elevator", "security"],
    ...CONTACT,
    createdAt: "2026-10-21",
    featured: true,
  },
  {
    id: "land-peresecina",
    title: {
      ro: "Teren agricol de 33 ari în Peresecina",
      ru: "Участок 33 сотки под с/х в Пересечино",
      en: "33-are farmland plot in Peresecina",
    },
    deal: "sale",
    type: "land",
    price: 20_000,
    exchangeFor: {
      ro: "Schimb pe automobil până la 10 000 €.",
      ru: "Обмен на авто до 10 000 €.",
      en: "Exchange for a car up to €10,000.",
    },
    city: "orhei",
    address: "s. Peresecina, la marginea satului",
    area: 3300,
    rooms: 0,
    description: {
      ro: "Teren cu destinație agricolă, dimensiuni 14 × 285 m. Vizavi — un restaurant. Acces la electricitate.",
      ru: "Участок сельхозназначения, размеры 14 × 285 м. Напротив — ресторан. Есть доступ к электричеству.",
      en: "Agricultural plot measuring 14 × 285 m, opposite a restaurant. Electricity available.",
    },
    images: photos("land-peresecina", 4),
    features: [],
    ...CONTACT,
    createdAt: "2026-10-21",
  },
  {
    id: "land-ivancea",
    title: {
      ro: "Teren de 70 ari pentru construcție în Ivancea",
      ru: "Участок 70 соток под строительство в Иванче",
      en: "70-are building plot in Ivancea",
    },
    deal: "sale",
    type: "land",
    price: 100_000,
    exchangeFor: {
      ro: "Schimb parțial pe automobil până la 30 000 €.",
      ru: "Частичный обмен на авто до 30 000 €.",
      en: "Partial exchange for a car up to €30,000.",
    },
    city: "orhei",
    address: "s. Ivancea, vizavi de primărie",
    area: 7000,
    rooms: 0,
    description: {
      ro: "Satul Ivancea, pe drumul spre Orheiul Vechi — direcție turistică! 70 de ari vizavi de primăria Ivancea. Toate comunicațiile la hotarul terenului. Terenul nu se învecinează cu alte loturi.",
      ru: "Село Иванча, по дороге на Старый Оргеев — туристическое направление! 70 соток напротив примэрии Иванчи. Все коммуникации на границе участка. Участок не граничит с другими участками.",
      en: "Ivancea village, on the road to Old Orhei — a popular tourist route! 7,000 m² opposite the Ivancea town hall. All utilities at the boundary. The plot has no neighbouring plots.",
    },
    images: photos("land-ivancea", 8),
    features: [],
    ...CONTACT,
    createdAt: "2026-10-21",
    featured: true,
  },
];
