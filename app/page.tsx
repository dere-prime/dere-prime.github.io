import { Terminal } from "@/components/terminal"

export default function Page() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden px-4 py-8">
      {/* Fondo sutil de grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <header className="z-10 text-center">
        <h1 className="text-balance text-xl font-bold tracking-tight text-primary crt-glow sm:text-2xl">
          Dere Prime
        </h1>
        <p className="text-sm text-muted-foreground">Marcos Lopez — Portfolio</p>
      </header>

      <Terminal />

      <footer className="z-10 text-center text-xs text-muted-foreground">
        <p>Hecho con Next.js · Listo para GitHub Pages</p>
      </footer>
    </main>
  )
}
