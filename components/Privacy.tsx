"use client";

import type { Lang } from "@/lib/dict";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/store";

// Текст политики. TODO: перед запуском вписать юридическое название агентства и IDNO.
const SECTIONS: Record<Lang, { title: string; text: string }[]> = {
  ro: [
    { title: "Cine prelucrează datele", text: "Datele sunt prelucrate de agenția imobiliară REZULTAT — Tranzacții Imobiliare (Republica Moldova), conform legislației Republicii Moldova privind protecția datelor cu caracter personal." },
    { title: "Ce date colectăm", text: "Numele, numărul de telefon și mesajul pe care le introduceți în formularele de pe site, precum și detaliile despre imobil, dacă ne propuneți un obiect spre vânzare sau schimb." },
    { title: "De ce", text: "Doar pentru a vă răspunde: să vă sunăm, să vă oferim informații despre obiect sau să organizăm o vizionare. Nu vindem și nu transmitem datele terților în scopuri de marketing." },
    { title: "Unde se păstrează", text: "Cererile se păstrează pe serverele Cloudflare (Uniunea Europeană) și se trimit agentului în Telegram. Le păstrăm cel mult 2 ani sau până la solicitarea dvs. de ștergere." },
    { title: "Cookie-uri și stocare locală", text: "Site-ul nu folosește cookie-uri de publicitate sau urmărire. În browserul dvs. se păstrează doar limba aleasă și lista de favorite." },
    { title: "Drepturile dvs.", text: "Puteți cere acces la datele dvs., corectarea sau ștergerea lor oricând — scrieți-ne sau sunați-ne la contactele de mai jos." },
  ],
  ru: [
    { title: "Кто обрабатывает данные", text: "Данные обрабатывает агентство недвижимости REZULTAT — Tranzacții Imobiliare (Республика Молдова) в соответствии с законодательством Республики Молдова о защите персональных данных." },
    { title: "Какие данные мы собираем", text: "Имя, номер телефона и сообщение, которые вы вводите в формы на сайте, а также сведения об объекте, если вы предлагаете его на продажу или обмен." },
    { title: "Зачем", text: "Только чтобы ответить вам: перезвонить, рассказать об объекте или договориться о просмотре. Мы не продаём и не передаём данные третьим лицам для рекламы." },
    { title: "Где хранятся", text: "Заявки хранятся на серверах Cloudflare (Европейский союз) и отправляются агенту в Telegram. Мы храним их не дольше 2 лет или до вашего запроса на удаление." },
    { title: "Cookies и локальное хранилище", text: "Сайт не использует рекламные и отслеживающие cookies. В вашем браузере сохраняются только выбранный язык и список избранного." },
    { title: "Ваши права", text: "Вы можете в любой момент запросить доступ к своим данным, их исправление или удаление — напишите или позвоните нам по контактам ниже." },
  ],
  en: [
    { title: "Who processes the data", text: "Your data is processed by the real estate agency REZULTAT — Tranzacții Imobiliare (Republic of Moldova), in line with the personal data protection laws of the Republic of Moldova." },
    { title: "What we collect", text: "The name, phone number and message you enter in the forms on this site, plus property details if you offer us a property to sell or exchange." },
    { title: "Why", text: "Only to get back to you: to call you, share details about a property or arrange a viewing. We never sell your data or share it with third parties for marketing." },
    { title: "Where it is stored", text: "Requests are stored on Cloudflare servers (European Union) and sent to the agent via Telegram. We keep them for up to 2 years or until you ask us to delete them." },
    { title: "Cookies and local storage", text: "This site uses no advertising or tracking cookies. Your browser only keeps your chosen language and your favourites list." },
    { title: "Your rights", text: "You can ask to access, correct or delete your data at any time — write to us or call us using the contacts below." },
  ],
};

export function Privacy() {
  const { d, lang } = useI18n();
  const settings = useSettings();
  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
      <h1 className="font-serif text-5xl font-medium sm:text-6xl">{d.privacy.title}</h1>
      <div className="mt-12 space-y-10">
        {SECTIONS[lang].map((s) => (
          <section key={s.title}>
            <h2 className="font-serif text-3xl">{s.title}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink/80">{s.text}</p>
          </section>
        ))}
        <section className="rounded-3xl bg-sand/60 p-6">
          <p className="font-semibold">{settings.agentName}</p>
          <p className="mt-1 text-muted">
            {settings.phone} · {settings.email} · {settings.address}
          </p>
        </section>
      </div>
    </article>
  );
}
