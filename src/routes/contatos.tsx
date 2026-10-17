import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, UserRound } from "lucide-react";
import { PageHeader, Shell } from "@/components/Shell";
import { usePersisted } from "@/lib/store";

export const Route = createFileRoute("/contatos")({
  head: () => ({
    meta: [
      { title: "Contatos de Alerta — PéGuard" },
      { name: "description", content: "Escolha quem recebe os alertas de temperatura do PéGuard." },
      { property: "og:title", content: "Contatos de Alerta — PéGuard" },
      { property: "og:description", content: "Cuidadores e médicos que recebem alertas simultâneos." },
    ],
  }),
  component: Contatos,
});

const roles = ["Filho(a)", "Cônjuge", "Cuidador(a)", "Médico", "Enfermeiro(a)", "Outro"];

function Contatos() {
  const [contacts, setContacts] = usePersisted("contacts");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", role: roles[0], phone: "" });
  const valid = form.name.trim().length > 1 && form.phone.replace(/\D/g, "").length >= 10;

  const save = () => {
    setContacts([...contacts, { ...form, id: String(Date.now()), active: true }]);
    setForm({ name: "", role: roles[0], phone: "" });
    setAdding(false);
  };

  return (
    <Shell>
      <PageHeader title="Contatos" subtitle="Todos recebem o alerta ao mesmo tempo" />
      <div className="mx-4 -mt-4 space-y-3">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-soft">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cold-soft text-cold"><UserRound className="h-6 w-6" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold">{c.name}</p>
              <p className="truncate text-sm text-muted-foreground">{c.role}{c.phone && ` • ${c.phone}`}</p>
            </div>
            <button role="switch" aria-checked={c.active} aria-label={`Alertas para ${c.name}`}
              onClick={() => setContacts(contacts.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)))}
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${c.active ? "bg-success" : "bg-input"}`}>
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-card transition-all ${c.active ? "left-7" : "left-1"}`} />
            </button>
            {c.id !== "1" && (
              <button aria-label={`Remover ${c.name}`} onClick={() => setContacts(contacts.filter((x) => x.id !== c.id))} className="p-2 text-fever">
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}

        {!adding ? (
          <button onClick={() => setAdding(true)} className="flex min-h-16 w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-cold text-lg font-bold text-cold">
            <Plus className="h-6 w-6" /> Adicionar pessoa
          </button>
        ) : (
          <section className="rounded-3xl bg-card p-5 shadow-soft">
            <h2 className="text-xl font-bold">Nova pessoa</h2>
            <label className="mt-4 block font-bold">Nome
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Ana"
                className="mt-1 h-14 w-full rounded-2xl border-2 border-input bg-muted px-4 text-lg" />
            </label>
            <p className="mt-4 font-bold">Relação</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {roles.map((r) => (
                <button key={r} onClick={() => setForm({ ...form, role: r })}
                  className={`rounded-full px-4 py-2 font-bold ${form.role === r ? "bg-clinical text-primary-foreground" : "bg-muted"}`}>{r}</button>
              ))}
            </div>
            <label className="mt-4 block font-bold">Celular (WhatsApp/SMS)
              <input type="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(53) 99999-9999"
                className="mt-1 h-14 w-full rounded-2xl border-2 border-input bg-muted px-4 text-lg" />
            </label>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setAdding(false)} className="min-h-14 rounded-2xl bg-muted text-lg font-bold">Cancelar</button>
              <button disabled={!valid} onClick={save} className="min-h-14 rounded-2xl bg-success text-lg font-bold text-primary-foreground disabled:opacity-40">Salvar</button>
            </div>
          </section>
        )}
      </div>
    </Shell>
  );
}
