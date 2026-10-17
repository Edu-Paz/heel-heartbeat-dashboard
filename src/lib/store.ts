import { useEffect, useState } from "react";

export type Contact = { id: string; name: string; role: string; phone: string; active: boolean };

const defaults = {
  contacts: [
    { id: "1", name: "Sr. Carlos", role: "Paciente (Este Celular)", phone: "", active: true },
    { id: "2", name: "Marcos", role: "Filho(a)", phone: "(53) 99123-4567", active: true },
    { id: "3", name: "Dr. Silva", role: "Médico (Endocrinologista)", phone: "", active: true },
  ] as Contact[],
  device: { connected: true, name: "Palmilha FootSense #A47" },
};

export function usePersisted<K extends keyof typeof defaults>(key: K) {
  const [v, setV] = useState(defaults[key]);
  useEffect(() => {
    const s = localStorage.getItem("peguard-" + key);
    if (s) setV(JSON.parse(s));
  }, [key]);
  const set = (n: (typeof defaults)[K]) => {
    setV(n);
    localStorage.setItem("peguard-" + key, JSON.stringify(n));
  };
  return [v, set] as const;
}

export type User = { name: string; email: string; age: number };
const DEMO = { name: "Sr. Carlos", email: "carlos@footsense.com", password: "123456", age: 62 };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const s = localStorage.getItem("peguard-session");
    if (s) setUser(JSON.parse(s));
    setReady(true);
  }, []);
  const accounts = (): (User & { password: string })[] =>
    JSON.parse(localStorage.getItem("peguard-accounts") || "null") ?? [DEMO];
  const start = (u: User) => { localStorage.setItem("peguard-session", JSON.stringify(u)); setUser(u); };
  return {
    user, ready,
    login(email: string, password: string) {
      const a = accounts().find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
      if (!a) return "E-mail ou senha incorretos.";
      start({ name: a.name, email: a.email, age: a.age });
      return null;
    },
    register(d: User & { password: string }) {
      const list = accounts();
      if (list.some((x) => x.email.toLowerCase() === d.email.toLowerCase())) return "Este e-mail já está cadastrado.";
      localStorage.setItem("peguard-accounts", JSON.stringify([...list, d]));
      start({ name: d.name, email: d.email, age: d.age });
      return null;
    },
    logout() { localStorage.removeItem("peguard-session"); setUser(null); },
  };
}
