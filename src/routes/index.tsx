import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLiveTemp } from "@/lib/mqtt";
import { Battery, LogOut, Bluetooth, ChevronRight, Settings2, Timer } from "lucide-react";
import { Shell } from "@/components/Shell";
import { WeekChart } from "@/components/WeekChart";
import { AlertSim } from "@/components/AlertSim";
import { useAuth, usePersisted } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PéGuard — Painel do Paciente" },
      { name: "description", content: "Temperatura do peito do pé em tempo real, médias por período e alertas para cuidadores." },
      { property: "og:title", content: "PéGuard — Painel do Paciente" },
      { property: "og:description", content: "Temperatura do peito do pé em tempo real e alertas multicuidador." },
    ],
  }),
  component: Index,
});

type Mode = "normal" | "hot" | "cold";
const fmt = (n: number) => n.toFixed(1).replace(".", ",");

function Index() {
  const [mode, setMode] = useState<Mode>("normal");
  const [alertKey, setAlertKey] = useState(0);
  const [hi, setHi] = useState(33);
  const [lo, setLo] = useState(27);
  const [freq, setFreq] = useState(15);
  const [open, setOpen] = useState(false);
  const [contacts] = usePersisted("contacts");
  const [device] = usePersisted("device");
  const [emergency] = usePersisted("emergency");
  const auth = useAuth();
  const nav = useNavigate();
  const [useReal, setUseReal] = useState(true);
  const live = useLiveTemp(useReal && device.connected);
  const real = useReal && live.temp !== null;

  const simTemp = mode === "normal" ? 30.2 : mode === "hot" ? 34.6 : 25.8;
  const temp = real ? live.temp! : simTemp;
  const state: Mode = temp > hi ? "hot" : temp < lo ? "cold" : "normal";
  const prevState = useRef<Mode>("normal");
  useEffect(() => {
    if (real && state !== "normal" && prevState.current === "normal") setAlertKey((k) => k + 1);
    prevState.current = state;
  }, [state, real]);
  const t = {
    normal: { bg: "bg-success", soft: "bg-success-soft", text: "text-success", fill: "fill-success", title: "Tudo certo", msg: "Temperatura normal no peito do pé." },
    hot: { bg: "bg-fever", soft: "bg-fever-soft", text: "text-fever", fill: "fill-fever", title: "Ponto quente!", msg: "Possível inflamação. Cuidadores avisados." },
    cold: { bg: "bg-cold", soft: "bg-cold-soft", text: "text-cold", fill: "fill-cold", title: "Pé muito frio", msg: "Possível má circulação. Aqueça o pé." },
  }[state];
  const active = contacts.filter((c) => c.active).length;

  const footer = (
    <div className="mx-3 mb-2 rounded-2xl border bg-card/95 p-2 shadow-soft backdrop-blur">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        <span>
          {useReal
            ? live.status === "online" ? (live.temp !== null ? `Placa ao vivo • ${fmt(live.temp)}°` : "Broker ok • aguardando placa") : live.status === "error" ? "Erro no broker" : "Conectando broker…"
            : "Simulador • Pitch"}
        </span>
        <button onClick={() => setUseReal((v) => !v)} className="rounded-full bg-muted px-2 py-1 normal-case tracking-normal text-foreground">
          {useReal ? "Usar simulador" : "Usar placa real"}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {([["normal", "Normal", "30,2°", "bg-success"], ["hot", "Quente", "34,6°", "bg-fever"], ["cold", "Frio", "25,8°", "bg-cold"]] as const).map(([m, l, v, bg]) => (
          <button key={m} onClick={() => { setUseReal(false); setMode(m); setAlertKey((k) => k + 1); }}
            className={`min-h-12 rounded-xl text-sm font-bold text-primary-foreground transition ${bg} ${mode === m ? "ring-4 ring-clinical/30 scale-[1.03]" : "opacity-60"}`}>
            {l} {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Shell footer={footer}>
      <header className="rounded-b-[2rem] bg-header px-5 pb-8 pt-7 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">PéGuard</h1>
            <p className="text-sm opacity-70">by FootSense</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-base font-bold">
              <Battery className="h-5 w-5" /> 88%
            </div>
            <button onClick={() => { auth.logout(); nav({ to: "/login", replace: true }); }} aria-label="Sair"
              className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-base font-bold">
              <LogOut className="h-5 w-5" /> Sair
            </button>
          </div>
        </div>
        <p className="mt-5 text-2xl font-bold">Olá, {auth.user?.name ?? "Sr. Carlos"} 👋</p>
        <p className="opacity-80">{auth.user?.age ? `${auth.user.age} anos` : "62 anos"} • Peito do pé direito</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link to="/conectar" className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <Bluetooth className="h-4 w-4" />{device.connected ? "Palmilha conectada • DS18B20" : "Palmilha desconectada"}
          </Link>
          <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5"><Timer className="h-4 w-4" />A cada {freq} min</span>
        </div>
      </header>

      {!device.connected ? (
        <section className="relative mx-4 -mt-4 rounded-3xl bg-card p-6 text-center shadow-soft">
          <Bluetooth className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-xl font-extrabold">Palmilha desconectada</p>
          <p className="text-muted-foreground">Conecte a palmilha para ver a temperatura atual.</p>
          <Link to="/conectar" className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-clinical px-5 font-bold text-primary-foreground">Conectar palmilha</Link>
        </section>
      ) : (
      <section className="relative mx-4 -mt-4 rounded-3xl bg-card p-5 shadow-soft">
        <div className={`flex items-center gap-3 rounded-2xl p-3 ${t.soft}`} role="alert">
          <span className={`h-3 w-3 shrink-0 rounded-full ${t.bg}`} />
          <div>
            <p className={`text-lg font-extrabold ${t.text}`}>{t.title}</p>
            <p className="text-sm">{t.msg}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <svg viewBox="0 0 200 300" className="h-56 shrink-0" aria-hidden>
            <path d="M70 60 C40 90 45 150 60 200 C70 250 80 285 110 285 C145 285 150 250 148 210 C146 170 160 130 158 90 C156 60 120 50 70 60Z" className="fill-muted stroke-border" strokeWidth="3" />
            {[[72, 40, 14], [100, 32, 11], [122, 34, 10], [141, 42, 9], [156, 56, 8]].map(([x, y, r]) => (
              <circle key={x} cx={x} cy={y} r={r} className="fill-muted stroke-border" strokeWidth="2" />
            ))}
            <circle cx="104" cy="150" r="26" className={`${t.fill} pulse-ring`} style={{ transformOrigin: "104px 150px" }} />
            <circle cx="104" cy="150" r="26" className={t.fill} />
          </svg>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Agora</p>
            <p className={`font-display text-6xl font-extrabold leading-none ${t.text}`}>{fmt(temp)}</p>
            <p className="text-2xl font-bold text-muted-foreground">°C</p>
          </div>
        </div>
      </section>
      )}

      <section className="mx-4 mt-6">
        <h2 className="text-xl font-bold">Média de hoje</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { i: "🌅", n: "Manhã", h: "06–12h", v: 30.1, s: "Normal", c: "bg-success-soft text-success" },
            { i: "☀️", n: "Tarde", h: "12–18h", v: 33.8, s: "Quente", c: "bg-warn-soft text-warn" },
            { i: "🌙", n: "Noite", h: "18–00h", v: 26.4, s: "Baixa", c: "bg-cold-soft text-cold" },
          ].map((p) => (
            <div key={p.n} className="rounded-3xl bg-card p-3 text-center shadow-soft">
              <div className="text-2xl">{p.i}</div>
              <p className="font-bold">{p.n}</p>
              <p className="text-xs text-muted-foreground">{p.h}</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{fmt(p.v)}°</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${p.c}`}>{p.s}</span>
            </div>
          ))}
        </div>
        <WeekChart hi={hi} lo={lo} />
      </section>

      <section className="mx-4 mt-6 space-y-3">
        <Link to="/contatos" className="flex items-center justify-between rounded-3xl bg-card p-5 shadow-soft">
          <div>
            <p className="text-lg font-bold">👥 Quem recebe alertas</p>
            <p className="text-muted-foreground">{active} {active === 1 ? "pessoa ativa" : "pessoas ativas"}</p>
          </div>
          <ChevronRight className="h-6 w-6" />
        </Link>
        <button onClick={() => setOpen(true)} className="flex w-full items-center justify-between rounded-3xl bg-clinical p-5 text-left text-primary-foreground">
          <span className="text-lg font-bold">Ajustes clínicos (médico)</span><Settings2 className="h-6 w-6" />
        </button>
      </section>

      {alertKey > 0 && device.connected && state !== "normal" && (
        <AlertSim key={alertKey} kind={state} temp={fmt(temp)} contacts={contacts} emergencyId={emergency} onClose={() => setAlertKey(0)} />
      )}

      {open && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-shell/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-[430px] rounded-t-[2rem] bg-card p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold">Ajustes clínicos</h2>
            {([
              ["Limite de alta temperatura (°C)", hi, setHi, 0.1],
              ["Limite de baixa temperatura (°C)", lo, setLo, 0.1],
              ["Frequência de leitura (min)", freq, setFreq, 1],
            ] as const).map(([l, v, set, step]) => (
              <label key={l} className="mt-4 block text-base font-bold">
                {l}
                <input type="number" step={step} value={v} onChange={(e) => set(Number(e.target.value))}
                  className="mt-1 h-14 w-full rounded-2xl border-2 border-input bg-muted px-4 text-xl" />
              </label>
            ))}
            <button onClick={() => setOpen(false)} className="mt-6 min-h-14 w-full rounded-2xl bg-success text-lg font-bold text-primary-foreground">Salvar</button>
          </div>
        </div>
      )}
    </Shell>
  );
}
