export function WordFlash({ ar, en }: { ar: string; en: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[15%] z-20 flex justify-center px-4">
      <div className="bounce-in min-w-[46%] rounded-[1.7rem] bg-cream px-6 py-3 text-center shadow-[0_8px_0_#e4d8c8]">
        <p className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">{ar}</p>
        <p className="mt-0.5 text-lg font-bold tracking-wide text-ink-soft sm:text-xl">{en}</p>
      </div>
    </div>
  );
}
