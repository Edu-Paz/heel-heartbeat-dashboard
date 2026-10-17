import { useEffect, useState } from "react";
import { BellRing, Check, CheckCheck, Phone, X } from "lucide-react";
import type { Contact } from "@/lib/store";

type Kind = "hot" | "cold";

function beep(kind: Kind) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const notes = kind === "hot" ? [880, 660, 880, 660] : [520, 440, 520, 440];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.22);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.22 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.22 + 0.2);
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + i * 0.22); o.stop(ctx.currentTime + i * 0.22 + 0.21);
    });
    navigator.vibrate?.([300, 120, 300, 120, 500]);
  } catch { /* sem áudio */ }
}

export function AlertSim({ kind, temp, contacts, emergencyId, onClose }: { kind: Kind; temp: string; contacts: Contact[]; emergencyId?: string; onClose: () => void }) {
  const emergency = contacts.find((c) => c.id === emergencyId && c.phone);
  const [stage, setStage] = useState<"banner" | "full">("banner");
  const [sent, setSent] = useState(0);
  const [ack, setAck] = useState(false);
  const targets = contacts.filter((c) => c.active);
  const hot = kind === "hot";
  const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const title = hot ? "Ponto quente no calcanhar" : "Pé muito frio (isquemia)";
  const msg = hot ? `Temperatura de ${temp} °C, acima do limite. Possível inflamação ou úlcera.` : `Temperatura de ${temp} °C, abaixo do limite. Possível má circulação.`;

  useEffect(() => {
    beep(kind);
    const t1 = setTimeout(() => setStage("full"), 2600);
    const ts = targets.map((_, i) => setTimeout(() => setSent(i + 1), 900 + i * 900));
    return () => { clearTimeout(t1); ts.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stage === "banner")
    return (
      <button onClick={() => setStage("full")} className="fixed left-1/2 top-3 z-30 w-[calc(100%-1.5rem)] max-w-[406px] -translate-x-1/2 animate-in slide-in-from-top-10 fade-in duration-500 rounded-3xl bg-card/95 p-4 text-left shadow-soft backdrop-blur">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
          <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${hot ? "bg-fever" : "bg-cold"} text-primary-foreground`}><BellRing className="h-3.5 w-3.5" /></span>
          PéGuard • agora
        </div>
        <p className="mt-2 text-base font-bold">⚠️ {title}</p>
        <p className="text-sm text-muted-foreground">{msg}</p>
      </button>
    );

  return (
    <div className={`fixed inset-0 z-30 flex justify-center ${hot ? "bg-fever" : "bg-cold"} animate-in fade-in duration-300`}>
      <div className="flex w-full max-w-[430px] flex-col overflow-y-auto p-6 text-primary-foreground">
        <div className="flex justify-between text-sm font-bold opacity-80"><span>{now}</span><button onClick={onClose} aria-label="Fechar"><X className="h-6 w-6" /></button></div>
        <div className="mt-6 text-center">
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            {!ack && <span className="pulse-ring absolute inset-0 rounded-full bg-card/40" />}
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-card/20 text-5xl">{hot ? "🔥" : "❄️"}</span>
          </div>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-80">Alerta PéGuard</p>
          <h2 className="mt-1 text-3xl font-extrabold">{title}</h2>
          <p className="mt-3 font-display text-7xl font-extrabold">{temp}°</p>
          <p className="mt-2 text-lg opacity-90">{msg}</p>
        </div>

        <div className="mt-6 rounded-3xl bg-card p-4 text-card-foreground">
          <p className="font-bold">📤 Alerta enviado para</p>
          {targets.map((c, i) => (
            <div key={c.id} className="mt-3 flex items-center justify-between">
              <span><b>{c.name}</b> <span className="text-sm text-muted-foreground">{c.role}</span></span>
              {sent > i ? (
                <span className="flex items-center gap-1 text-sm font-bold text-success">{ack ? <CheckCheck className="h-5 w-5" /> : <Check className="h-5 w-5" />}{ack ? "Visto" : "Entregue"}</span>
              ) : <span className="text-sm text-muted-foreground">Enviando…</span>}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-3xl bg-card/15 p-4">
          <p className="font-bold">O que fazer agora</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {(hot ? ["Tire o calçado e olhe o calcanhar.", "Procure vermelhidão, bolhas ou feridas.", "Não ande até falar com o médico."]
              : ["Aqueça o pé com meias (sem bolsa quente).", "Observe se a pele está pálida ou roxa.", "Se não melhorar em 30 min, ligue ao médico."]).map((s) => <li key={s}>{s}</li>)}
          </ul>
        </div>

        <div className="mt-auto grid gap-2 pt-6">
          {emergency?.phone ? (
            <a href={`tel:${emergency.phone.replace(/\D/g, "")}`} className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-card text-lg font-bold text-foreground"><Phone className="h-6 w-6" /> Ligar para {emergency.name}</a>
          ) : (
            <p className="rounded-2xl bg-card/15 p-3 text-center font-bold">Nenhum contato de emergência definido</p>
          )}
          <button onClick={() => (ack ? onClose() : setAck(true))} className="min-h-16 rounded-2xl border-2 border-card text-lg font-bold">
            {ack ? "Fechar" : "✅ Já verifiquei meu pé"}
          </button>
        </div>
      </div>
    </div>
  );
}
