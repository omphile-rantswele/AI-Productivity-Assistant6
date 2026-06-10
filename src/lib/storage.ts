import { useEffect, useState, useCallback } from "react";

export type MetricKey = "emails" | "summaries" | "plans" | "research";

const METRICS_KEY = "ai-wpa:metrics";
const HISTORY_PREFIX = "ai-wpa:history:";

export interface Metrics {
  emails: number;
  summaries: number;
  plans: number;
  research: number;
}

const defaultMetrics: Metrics = { emails: 0, summaries: 0, plans: 0, research: 0 };

export function loadMetrics(): Metrics {
  if (typeof window === "undefined") return defaultMetrics;
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    return raw ? { ...defaultMetrics, ...JSON.parse(raw) } : defaultMetrics;
  } catch {
    return defaultMetrics;
  }
}

export function incrementMetric(key: MetricKey) {
  if (typeof window === "undefined") return;
  const m = loadMetrics();
  m[key] = (m[key] || 0) + 1;
  localStorage.setItem(METRICS_KEY, JSON.stringify(m));
  window.dispatchEvent(new CustomEvent("ai-wpa:metrics-changed"));
}

export function useMetrics(): Metrics {
  const [m, setM] = useState<Metrics>(defaultMetrics);
  useEffect(() => {
    setM(loadMetrics());
    const h = () => setM(loadMetrics());
    window.addEventListener("ai-wpa:metrics-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("ai-wpa:metrics-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return m;
}

export interface HistoryItem<T = unknown> {
  id: string;
  createdAt: number;
  title: string;
  data: T;
}

export function useHistory<T>(bucket: string) {
  const key = HISTORY_PREFIX + bucket;
  const [items, setItems] = useState<HistoryItem<T>[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(key);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [key]);

  const save = useCallback(
    (next: HistoryItem<T>[]) => {
      setItems(next);
      localStorage.setItem(key, JSON.stringify(next));
    },
    [key],
  );

  const add = useCallback(
    (title: string, data: T) => {
      const item: HistoryItem<T> = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        title,
        data,
      };
      save([item, ...items].slice(0, 50));
    },
    [items, save],
  );

  const remove = useCallback(
    (id: string) => {
      save(items.filter((i) => i.id !== id));
    },
    [items, save],
  );

  return { items, add, remove };
}
