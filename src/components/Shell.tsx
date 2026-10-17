import { Link } from "@tanstack/react-router";
import { Bluetooth, Home, Users } from "lucide-react";
import type { ReactNode } from "react";

export function Shell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-shell sm:py-8">
      <main className="relative w-full max-w-[430px] overflow-hidden bg-background pb-44 sm:rounded-[2.75rem] sm:border-[10px] sm:border-clinical-soft">
        {children}
        <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2">
          {footer}
          <nav className="grid grid-cols-3 border-t bg-card/95 backdrop-blur">
            {[
              { to: "/", l: "Início", I: Home },
              { to: "/conectar", l: "Palmilha", I: Bluetooth },
              { to: "/contatos", l: "Contatos", I: Users },
            ].map(({ to, l, I }) => (
              <Link key={to} to={to} activeOptions={{ exact: true }}
                className="flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-bold text-muted-foreground"
                activeProps={{ className: "text-cold" }}>
                <I className="h-6 w-6" />{l}
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="rounded-b-[2rem] bg-header px-6 pb-8 pt-8 text-primary-foreground">
      <p className="text-sm font-bold uppercase tracking-widest opacity-70">PéGuard</p>
      <h1 className="mt-1 text-3xl font-extrabold">{title}</h1>
      <p className="mt-1 text-base opacity-80">{subtitle}</p>
    </header>
  );
}
