import type {
  CollectionInfo,
  CollectionResults,
  StatsData,
  TraceSummaryData,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export const getHealth = () => fetchJSON<{ status: string }>("/health");

export const getStats = () => fetchJSON<StatsData>("/api/stats");

export const getCollections = () =>
  fetchJSON<CollectionInfo[]>("/api/collections");

export const analyzeCollection = (
  id: string,
  opts: { limit?: number; rules_only?: boolean },
) =>
  fetchJSON<{ collection_id: string; status: string }>(
    `/api/collections/${id}/analyze`,
    { method: "POST", body: JSON.stringify(opts) },
  );

export const getCollectionResults = (
  id: string,
  filters?: { decision?: string; category?: string; severity?: string },
) => {
  const params = new URLSearchParams();
  if (filters?.decision) params.set("decision", filters.decision);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.severity) params.set("severity", filters.severity);
  const qs = params.toString();
  return fetchJSON<CollectionResults>(
    `/api/collections/${id}/results${qs ? `?${qs}` : ""}`,
  );
};

export const getTraceSummary = (traceId: string) =>
  fetchJSON<TraceSummaryData>(
    `/api/traces/${encodeURIComponent(traceId)}/summary`,
  );
