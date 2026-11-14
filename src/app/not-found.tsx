import Link from "next/link";

export default function NoEncontrado() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-120 flex-col items-start justify-center gap-5 px-4">
      <h1 className="font-display text-4xl font-extrabold">No encontramos esta página</h1>
      <Link
        href="/"
        className="inline-flex min-h-12 items-center rounded-full bg-mantequilla px-6 text-[15px] font-semibold"
      >
        Ir a la carta
      </Link>
    </main>
  );
}
