import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-8xl text-accent">404</p>
      <p className="mt-4 font-serif text-4xl">Такой страницы нет</p>
      <Link href="/" className="mt-8 rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-accent">
        На главную
      </Link>
    </div>
  );
}
