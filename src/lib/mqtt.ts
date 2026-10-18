import { useEffect, useState } from "react";

export const MQTT_URL = "wss://test.mosquitto.org:8081";
export const MQTT_TOPIC = "hackathon/palmilha/temperatura";

export type LiveTemp = { status: "off" | "connecting" | "online" | "error"; temp: number | null; raw: string; at: number | null };

/** Assina o tópico da placa e devolve a última temperatura (payload = número puro). */
export function useLiveTemp(enabled: boolean): LiveTemp {
  const [s, setS] = useState<LiveTemp>({ status: "off", temp: null, raw: "", at: null });
  useEffect(() => {
    if (!enabled) { setS((p) => ({ ...p, status: "off" })); return; }
    let client: { end: (f?: boolean) => void } | null = null;
    let dead = false;
    setS((p) => ({ ...p, status: "connecting" }));
    import("mqtt").then((mod) => {
      if (dead) return;
      const c = mod.default.connect(MQTT_URL, { reconnectPeriod: 3000, connectTimeout: 10000 });
      client = c;
      c.on("connect", () => { setS((p) => ({ ...p, status: "online" })); c.subscribe(MQTT_TOPIC); });
      c.on("error", () => setS((p) => ({ ...p, status: "error" })));
      c.on("offline", () => setS((p) => ({ ...p, status: "connecting" })));
      c.on("message", (_t, buf) => {
        const raw = buf.toString().trim();
        const n = parseFloat(raw);
        setS({ status: "online", raw, temp: Number.isFinite(n) ? n : null, at: Date.now() });
      });
    });
    return () => { dead = true; client?.end(true); };
  }, [enabled]);
  return s;
}
