import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PéGuard — Painel do Paciente" },
      { name: "description", content: "Temperatura do calcanhar em tempo real, médias por período e alertas para cuidadores." },
      { property: "og:title", content: "PéGuard — Painel do Paciente" },
      { property: "og:description", content: "Temperatura do calcanhar em tempo real e alertas multicuidador." },
    ],
  }),
  component: Index,
});

type Mode = "normal" | "hot" | "cold";
const fmt = (n: number) => n.toFixed(1).replace(".", ",") + " °C";

const week = {
  manha: [32.0, 32.4, 31.9, 32.3, 32.1, 32.5, 32.2],
  tarde: [34.1, 34.8, 35.2, 35.9, 36.1, 36.4, 36.8],
  noite: [30.2, 29.8, 30.0, 29.5, 29.3, 29.1, 28.9],
};
const days = ["Sáb", "Dom", "Seg", "Ter", "Qua", "Qui", "Hoje"];

function Index() {
  const [mode, setMode] = useState<Mode>("normal");
  const [hi, setHi] = useState(35.5);
  const [lo, setLo] = useState(29.5);
  const [freq, setFreq] = useState(15);
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState([true, true, true]);

  const temp = mode === "normal" ? 32.8 : mode === "hot" ? 37.1 : 28.5;
  const state: Mode = temp > hi ? "hot" : temp < lo ? "cold" : "normal";
  const tone = { normal: "success", hot: "fever", cold: "cold" }[state];
  const toneBg = { success: "bg-success", fever: "bg-fever", cold: "bg-cold" }[tone]!;
  const toneText = { success: "text-success", fever: "text-fever", cold: "text-cold" }[tone]!;
  const toneFill = { success: "fill-success", fever: "fill-fever", cold: "fill-cold" }[tone]!;

  return (
    <div className="flex min-h-screen justify-center bg-shell sm:py-8">
      <main className="relative w-full max-w-[430px] overflow-hidden bg-background pb-40 sm:rounded-[2.5rem] sm:border-8 sm:border-clinical-soft">
        {/* Header */}
        <header className="bg-clinical px-5 pb-6 pt-6 text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">PéGuard</h1>
              <p className="text-sm opacity-80">by FootSense</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Sr. Carlos, 62 anos</p>
              <p className="text-base">🔋 Bateria 88%</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <span className="rounded-full bg-clinical-soft px-3 py-1.5">📶 Palmilha Conectada (Bluetooth 5.0) • Sensor DS18B20</span>
            <span className="self-start rounded-full bg-clinical-soft px-3 py-1.5">⏱️ Leitura a cada {freq} min</span>
          </div>
        </header>

        {/* Alert */}
        <section className={`mx-4 mt-4 rounded-xl p-4 text-primary-foreground ${toneBg}`} role="alert">
          <p className="text-xl font-bold">
            {state === "normal" && "✅ Temperatura Normal"}
            {state === "hot" && "🔥 ALERTA: Ponto Quente!"}
            {state === "cold" && "❄️ ALERTA: Baixa Temperatura"}
          </p>
          <p className="mt-1 text-base">
            {state === "normal" && "Tudo certo com seu calcanhar. Continue usando a palmilha."}
            {state === "hot" && "Possível inflamação ou úlcera. Alerta enviado aos cuidadores e médico."}
            {state === "cold" && "Possível má circulação (isquemia). Aqueça o pé e procure o médico."}
          </p>
        </section>

        {/* Foot */}
        <section className="mx-4 mt-4 rounded-xl bg-card p-4 shadow-sm">
          <h2 className="text-lg font-bold">🦶 Calcanhar Direito</h2>
          <svg viewBox="0 0 200 300" className="mx-auto mt-2 h-72" aria-label={`Temperatura atual ${fmt(temp)}`}>
            <path d="M70 60 C40 90 45 150 60 200 C70 250 80 285 110 285 C145 285 150 250 148 210 C146 170 160 130 158 90 C156 60 120 50 70 60Z" className="fill-muted stroke-border" strokeWidth="3" />
            {[[72, 40, 14], [100, 32, 11], [122, 34, 10], [141, 42, 9], [156, 56, 8]].map(([x, y, r]) => (
              <circle key={x} cx={x} cy={y} r={r} className="fill-muted stroke-border" strokeWidth="2" />
            ))}
            <ellipse cx="105" cy="110" rx="40" ry="22" className="fill-border opacity-50" />
            <circle cx="107" cy="240" r="34" className={`${toneFill} pulse-ring origin-[107px_240px]`} />
            <circle cx="107" cy="240" r="34" className={toneFill} />
          </svg>
          <p className={`text-center font-display text-6xl font-extrabold ${toneText}`}>{fmt(temp)}</p>
          <p className="text-center text-base text-muted-foreground">Leitura atual • Calcanhar</p>
        </section>

        {/* Averages */}
        <section className="mx-4 mt-4">
          <h2 className="text-lg font-bold">📊 Média de Temperatura Hoje (Por Período)</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { i: "🌅", n: "Manhã", h: "06h-12h", v: 32.2, s: "Normal", c: "border-success text-success" },
              { i: "☀️", n: "Tarde", h: "12h-18h", v: 36.8, s: "Ponto Quente", c: "border-warn text-warn" },
              { i: "🌙", n: "Noite", h: "18h-00h", v: 28.9, s: "Baixa", c: "border-cold text-cold" },
            ].map((p) => (
              <div key={p.n} className={`rounded-xl border-2 bg-card p-3 text-center ${p.c}`}>
                <div className="text-2xl">{p.i}</div>
                <p className="font-bold text-foreground">{p.n}</p>
                <p className="text-xs text-muted-foreground">{p.h}</p>
                <p className="mt-1 text-xl font-extrabold">{fmt(p.v)}</p>
                <p className="text-xs font-bold">{p.s}</p>
              </div>
            ))}
          </div>
          <Chart />
        </section>

        {/* Contacts */}
        <section className="mx-4 mt-4 rounded-xl bg-card p-4 shadow-sm">
          <h2 className="text-lg font-bold">👥 Enviar Alertas Simultâneos Para:</h2>
          {["Paciente (Este Celular)", "Filho(a): Marcos (53) 99123-4567", "Médico: Dr. Silva (Endocrinologista)"].map((c, i) => (
            <label key={c} className="mt-3 flex min-h-12 items-center gap-3 text-base">
              <input type="checkbox" className="h-6 w-6 accent-success" checked={contacts[i]}
                onChange={() => setContacts(contacts.map((v, j) => (j === i ? !v : v)))} />
              {c}
            </label>
          ))}
        </section>

        <div className="mx-4 mt-4">
          <button onClick={() => setOpen(true)} className="min-h-14 w-full rounded-xl bg-clinical text-lg font-bold text-primary-foreground">
            ⚙️ Ajustes Clínicos (Médico)
          </button>
        </div>

        {/* Simulator */}
        <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 border-t bg-card p-3 shadow-lg">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">Simulador • Pitch Startup Weekend</p>
          <div className="grid grid-cols-3 gap-2">
            {([["normal", "Normal", "32,8°C", "bg-success"], ["hot", "Ponto Quente", "37,1°C", "bg-fever"], ["cold", "Isquemia/Frio", "28,5°C", "bg-cold"]] as const).map(([m, l, t, bg]) => (
              <button key={m} onClick={() => setMode(m)}
                className={`min-h-14 rounded-xl px-1 text-sm font-bold text-primary-foreground ${bg} ${mode === m ? "ring-4 ring-clinical" : "opacity-80"}`}>
                {l}<br />({t})
              </button>
            ))}
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 z-20 flex items-end justify-center bg-shell/70" onClick={() => setOpen(false)}>
            <div className="w-full max-w-[430px] rounded-t-3xl bg-card p-5" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold">⚙️ Painel de Ajustes Clínicos</h2>
              {[
                ["Limite de Alta Temperatura (°C)", hi, setHi, 0.1],
                ["Limite de Baixa Temperatura (°C)", lo, setLo, 0.1],
                ["Frequência de Leitura (min)", freq, setFreq, 1],
              ].map(([l, v, set, step]) => (
                <label key={l as string} className="mt-4 block text-base font-bold">
                  {l as string}
                  <input type="number" step={step as number} value={v as number}
                    onChange={(e) => (set as (n: number) => void)(Number(e.target.value))}
                    className="mt-1 h-14 w-full rounded-xl border-2 border-input px-4 text-xl" />
                </label>
              ))}
              <button onClick={() => setOpen(false)} className="mt-5 min-h-14 w-full rounded-xl bg-success text-lg font-bold text-primary-foreground">
                Salvar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Chart() {
  const W = 320, H = 140, min = 27, max = 38;
  const x = (i: number) => 20 + (i * (W - 30)) / 6;
  const y = (v: number) => H - 20 - ((v - min) / (max - min)) * (H - 30);
  const line = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <div className="mt-3 rounded-xl bg-card p-3 shadow-sm">
      <p className="text-sm font-bold">Últimos 7 dias</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <path d={line(week.manha)} className="fill-none stroke-success" strokeWidth="3" />
        <path d={line(week.tarde)} className="fill-none stroke-warn" strokeWidth="3" />
        <path d={line(week.noite)} className="fill-none stroke-cold" strokeWidth="3" />
        {days.map((d, i) => (
          <text key={d} x={x(i)} y={H - 4} textAnchor="middle" className="fill-muted-foreground text-[10px]">{d}</text>
        ))}
      </svg>
      <div className="flex justify-around text-xs font-bold">
        <span className="text-success">● Manhã</span><span className="text-warn">● Tarde</span><span className="text-cold">● Noite</span>
      </div>
    </div>
  );
}
