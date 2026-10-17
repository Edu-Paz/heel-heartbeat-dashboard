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
