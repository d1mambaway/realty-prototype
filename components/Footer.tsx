import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-deep text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo className="text-white" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Площадка, где квартиры, дома и офисы находят своих людей. Без лишнего шума — только честные объявления и красивые фотографии.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-soft">Объявления</p>
          <Link href="/listings/?deal=sale" className="block hover:text-white">Купить</Link>
          <Link href="/listings/?deal=rent" className="block hover:text-white">Снять</Link>
          <Link href="/listings/?deal=daily" className="block hover:text-white">Посуточно</Link>
          <Link href="/new/" className="block hover:text-white">Подать объявление</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-soft">Контакты</p>
          <p>office@rezultat.example</p>
          <p>+7 800 000-00-00</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs sm:px-6 lg:px-8">© 2026 REZULTAT · Tranzactii Imobiliare. Прототип.</p>
      </div>
    </footer>
  );
}
