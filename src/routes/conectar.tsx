import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bluetooth, Check, Footprints, Loader2 } from "lucide-react";
import { PageHeader, Shell } from "@/components/Shell";
import { usePersisted } from "@/lib/store";

export const Route = createFileRoute("/conectar")({
  head: () => ({
    meta: [
      { title: "Conectar Palmilha — PéGuard" },
      { name: "description", content: "Pareie a palmilha FootSense via Bluetooth em poucos passos." },
      { property: "og:title", content: "Conectar Palmilha — PéGuard" },
      { property: "og:description", content: "Pareie a palmilha FootSense via Bluetooth." },
    ],
  }),
  component: Conectar,
});

const found = [
  { name: "Palmilha FootSense #A47", signal: "Forte" },
  { name: "Palmilha FootSense #B12", signal: "Fraco" },
];

function Conectar() {
  const [device, setDevice] = usePersisted("device");
  const [phase, setPhase] = useState<"idle" | "scan" | "list" | "pair">("idle");
  const [target, setTarget] = useState("");

  const scan = () => { setPhase("scan"); setTimeout(() => setPhase("list"), 1800); };
  const pair = (name: string) => {
    setTarget(name); setPhase("pair");
    setTimeout(() => { setDevice({ connected: true, name }); setPhase("idle"); }, 1800);
  };

  return (
    <Shell>
      <PageHeader title="Palmilha" subtitle="Conexão Bluetooth 5.0 com o sensor" />
      <div className="mx-4 -mt-4 space-y-4">
        {device.connected && phase === "idle" && (
          <section className="rounded-3xl bg-card p-6 text-center shadow-soft">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success-soft">
              <Check className="h-12 w-12 text-success" strokeWidth={3} />
            </div>
            <p className="mt-4 text-2xl font-bold">Conectada</p>
            <p className="text-lg text-muted-foreground">{device.name}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
              {[["Bateria", "88%"], ["Sensor", "DS18B20"], ["Sinal", "Forte"]].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-muted p-3"><p className="text-muted-foreground">{k}</p><p className="text-base font-bold">{v}</p></div>
              ))}
            </div>
            <button onClick={() => setDevice({ ...device, connected: false })}
              className="mt-5 min-h-14 w-full rounded-2xl border-2 border-fever text-lg font-bold text-fever">Desconectar</button>
          </section>
        )}

        {!device.connected && phase === "idle" && (
          <section className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="text-xl font-bold">Como conectar</h2>
            <ol className="mt-4 space-y-4 text-lg">
              {["Ligue o Bluetooth do celular.", "Aperte o botão da palmilha por 3 segundos.", "Toque em “Procurar palmilha”."].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cold-soft font-bold text-cold">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
            <button onClick={scan} className="mt-6 flex min-h-16 w-full items-center justify-center gap-2 rounded-2xl bg-cold text-lg font-bold text-primary-foreground">
              <Bluetooth className="h-6 w-6" /> Procurar palmilha
            </button>
          </section>
        )}

        {(phase === "scan" || phase === "pair") && (
          <section className="rounded-3xl bg-card p-8 text-center shadow-soft">
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
              <span className="pulse-ring absolute inset-0 rounded-full bg-cold/30" />
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-cold text-primary-foreground"><Bluetooth className="h-10 w-10" /></span>
            </div>
            <p className="mt-5 text-xl font-bold">{phase === "scan" ? "Procurando palmilhas..." : "Conectando..."}</p>
            <p className="text-muted-foreground">{phase === "scan" ? "Mantenha a palmilha perto do celular" : target}</p>
          </section>
        )}

        {phase === "list" && (
          <section className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="text-xl font-bold">Palmilhas encontradas</h2>
            {found.map((d) => (
              <button key={d.name} onClick={() => pair(d.name)} className="mt-3 flex min-h-16 w-full items-center gap-3 rounded-2xl bg-muted p-4 text-left">
                <Footprints className="h-7 w-7 text-cold" />
                <span className="flex-1"><b className="block text-lg">{d.name}</b><span className="text-sm text-muted-foreground">Sinal {d.signal}</span></span>
                <span className="rounded-full bg-cold px-4 py-2 font-bold text-primary-foreground">Conectar</span>
              </button>
            ))}
            <button onClick={scan} className="mt-4 flex w-full items-center justify-center gap-2 font-bold text-cold"><Loader2 className="h-4 w-4" /> Procurar de novo</button>
          </section>
        )}
      </div>
    </Shell>
  );
}
