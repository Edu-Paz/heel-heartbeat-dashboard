import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Footprints } from "lucide-react";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — PéGuard" },
      { name: "description", content: "Entre ou crie sua conta no PéGuard by FootSense." },
      { property: "og:title", content: "Entrar — PéGuard" },
      { property: "og:description", content: "Acesse o monitoramento do pé diabético." },
    ],
  }),
  component: Login,
});

const input = "mt-1 h-14 w-full rounded-2xl border-2 border-input bg-muted px-4 text-lg";

function Login() {
  const auth = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"in" | "up">("in");
  const [f, setF] = useState({ name: "", age: "", email: "carlos@footsense.com", password: "123456" });
  const [err, setErr] = useState("");

  useEffect(() => { if (auth.ready && auth.user) nav({ to: "/", replace: true }); }, [auth.ready, auth.user, nav]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "up") {
      if (f.name.trim().length < 2) return setErr("Digite seu nome.");
      if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("E-mail inválido.");
      if (f.password.length < 6) return setErr("A senha precisa de pelo menos 6 caracteres.");
    }
    const r = tab === "in" ? auth.login(f.email, f.password)
      : auth.register({ name: f.name.trim(), age: Number(f.age) || 0, email: f.email.trim(), password: f.password });
    setErr(r ?? "");
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="flex min-h-screen justify-center bg-shell sm:py-8">
      <main className="w-full max-w-[430px] overflow-hidden bg-background sm:rounded-[2.75rem] sm:border-[10px] sm:border-clinical-soft">
        <header className="rounded-b-[2rem] bg-header px-6 pb-12 pt-12 text-center text-primary-foreground">
          <span className="glass mx-auto flex h-20 w-20 items-center justify-center rounded-3xl"><Footprints className="h-10 w-10" /></span>
          <h1 className="mt-4 text-4xl font-extrabold">PéGuard</h1>
          <p className="opacity-80">by FootSense • Cuidando dos seus pés</p>
        </header>
        <section className="relative mx-4 -mt-6 rounded-3xl bg-card p-5 shadow-soft">
          <div className="grid grid-cols-2 rounded-2xl bg-muted p-1">
            {([["in", "Entrar"], ["up", "Criar conta"]] as const).map(([k, l]) => (
              <button key={k} type="button" onClick={() => { setTab(k); setErr(""); setF(k === "up" ? { name: "", age: "", email: "", password: "" } : { name: "", age: "", email: "carlos@footsense.com", password: "123456" }); }}
                className={`min-h-12 rounded-xl text-lg font-bold ${tab === k ? "bg-card shadow-soft" : "text-muted-foreground"}`}>{l}</button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-4 space-y-4">
            {tab === "up" && (
              <>
                <label className="block font-bold">Nome completo<input className={input} value={f.name} onChange={set("name")} placeholder="Ex: Carlos Souza" /></label>
                <label className="block font-bold">Idade<input className={input} type="number" inputMode="numeric" value={f.age} onChange={set("age")} placeholder="62" /></label>
              </>
            )}
            <label className="block font-bold">E-mail<input className={input} type="email" value={f.email} onChange={set("email")} placeholder="voce@email.com" /></label>
            <label className="block font-bold">Senha<input className={input} type="password" value={f.password} onChange={set("password")} placeholder="Mínimo 6 caracteres" /></label>
            {err && <p className="rounded-2xl bg-fever-soft p-3 font-bold text-fever" role="alert">{err}</p>}
            <button className="min-h-16 w-full rounded-2xl bg-clinical text-lg font-bold text-primary-foreground">{tab === "in" ? "Entrar" : "Criar conta"}</button>
          </form>
          {tab === "in" && <p className="mt-4 text-center text-sm text-muted-foreground">Conta de demonstração já preenchida: carlos@footsense.com / 123456</p>}
        </section>
      </main>
    </div>
  );
}
