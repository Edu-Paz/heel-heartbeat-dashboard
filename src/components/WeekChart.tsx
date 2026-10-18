import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const days = ["Sáb", "Dom", "Seg", "Ter", "Qua", "Qui", "Hoje"];
const manha = [30.0, 30.3, 29.8, 30.2, 30.1, 30.4, 30.1];
const tarde = [31.2, 31.8, 32.3, 32.8, 33.1, 33.5, 33.8];
const noite = [28.4, 28.0, 27.6, 27.3, 27.0, 26.7, 26.4];
const data = days.map((d, i) => ({ d, manha: manha[i], tarde: tarde[i], noite: noite[i] }));
const c = (n: number) => n.toFixed(1).replace(".", ",");

const series = [
  { k: "manha", l: "🌅 Manhã", color: "var(--period-morning)", v: manha },
  { k: "tarde", l: "☀️ Tarde", color: "var(--period-afternoon)", v: tarde },
  { k: "noite", l: "🌙 Noite", color: "var(--period-night)", v: noite },
] as const;

export function WeekChart({ hi, lo }: { hi: number; lo: number }) {
  return (
    <div className="mt-4 rounded-3xl bg-card p-5 shadow-soft">
      <h3 className="text-lg font-bold">Últimos 7 dias</h3>
      <p className="text-sm text-muted-foreground">A faixa verde é a zona segura ({c(lo)} a {c(hi)} °C).</p>
      <div className="-ml-3 mt-3 h-60">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <ReferenceArea y1={lo} y2={hi} fill="var(--success)" fillOpacity={0.08} />
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <ReferenceLine y={hi} stroke="var(--fever)" strokeDasharray="5 4" label={{ value: "Febre", position: "insideTopRight", fill: "var(--fever)", fontSize: 12, fontWeight: 700 }} />
            <ReferenceLine y={lo} stroke="var(--cold)" strokeDasharray="5 4" label={{ value: "Frio", position: "insideBottomRight", fill: "var(--cold)", fontSize: 12, fontWeight: 700 }} />
            <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: "var(--muted-foreground)" }} />
            <YAxis domain={[24, 36]} ticks={[24, 26, 28, 30, 32, 34, 36]} width={36} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip formatter={(v: number, n: string) => [c(v) + " °C", { manha: "Manhã", tarde: "Tarde", noite: "Noite" }[n]]}
              contentStyle={{ borderRadius: 16, border: "1px solid var(--border)", fontSize: 14 }} />
            {series.map((s) => (
              <Line key={s.k} dataKey={s.k} stroke={s.color} strokeWidth={3.5} dot={{ r: 3, fill: s.color }} activeDot={{ r: 6 }} type="monotone" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {series.map((s) => {
          const diff = s.v[6]! - s.v[0]!;
          const msg = Math.abs(diff) < 0.5 ? "estável" : diff > 0 ? `subiu ${c(diff)} °C` : `caiu ${c(-diff)} °C`;
          return (
            <div key={s.k} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
              <span className="flex items-center gap-2 font-bold">
                <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />{s.l}
              </span>
              <span className="text-sm">na semana: <b>{msg}</b></span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 rounded-2xl bg-warn-soft p-4 text-base">
        💡 <b>O que isso quer dizer?</b> As tardes estão esquentando dia após dia e já passaram do limite seguro. Isso pode indicar inflamação: avise o médico.
      </p>
    </div>
  );
}
