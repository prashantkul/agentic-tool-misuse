import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCollectionResults } from "../api/client";
import type { FilterState } from "../types";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import FilterSidebar from "../components/traces/FilterSidebar";
import TraceGrid from "../components/traces/TraceGrid";
import TraceDetail from "../components/traces/TraceDetail";

export default function CollectionResults() {
  const { id } = useParams<{ id: string }>();
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    decisions: [],
    categories: [],
    severities: [],
    search: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["collection-results", id],
    queryFn: () => getCollectionResults(id!),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? 3000 : false,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return null;

  const filteredResults = data.results.filter((result) => {
    if (
      filters.decisions.length > 0 &&
      !filters.decisions.includes(result.final_decision)
    )
      return false;

    const resultCategory =
      result.rule_verdicts.find((rv) => rv.triggered)?.category ??
      result.judge_verdict?.category ??
      "none";
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(resultCategory)
    )
      return false;

    const resultSeverity =
      result.rule_verdicts.find((rv) => rv.triggered)?.severity ??
      result.judge_verdict?.severity ??
      "none";
    if (
      filters.severities.length > 0 &&
      !filters.severities.includes(resultSeverity)
    )
      return false;

    if (
      filters.search &&
      !result.trace_id.toLowerCase().includes(filters.search.toLowerCase()) &&
      !result.agent_id.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;

    return true;
  });

  const resultCounts = {
    decisions: data.results.reduce(
      (acc, r) => {
        acc[r.final_decision] = (acc[r.final_decision] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    categories: data.results.reduce(
      (acc, r) => {
        const cat =
          r.rule_verdicts.find((rv) => rv.triggered)?.category ??
          r.judge_verdict?.category ??
          "none";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    severities: data.results.reduce(
      (acc, r) => {
        const sev =
          r.rule_verdicts.find((rv) => rv.triggered)?.severity ??
          r.judge_verdict?.severity ??
          "none";
        acc[sev] = (acc[sev] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  const progress =
    data.total_count > 0
      ? Math.round((data.analyzed_count / data.total_count) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="gradient-hero rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Collection Results
        </h1>
        <p className="text-gray-500 mt-1 font-mono text-sm">
          {data.collection_id}
        </p>
      </div>

      {data.status === "running" && (
        <div className="glass-card rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">Analyzing traces...</span>
            <span className="font-semibold text-gray-800">
              {data.analyzed_count} / {data.total_count}
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-2xl transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          resultCounts={resultCounts}
        />
        <div className="flex-1">
          <TraceGrid
            results={filteredResults}
            onSelect={setSelectedTraceId}
            selectedId={selectedTraceId ?? undefined}
          />
        </div>
      </div>

      {selectedTraceId && (
        <TraceDetail
          traceId={selectedTraceId}
          onClose={() => setSelectedTraceId(null)}
        />
      )}
    </div>
  );
}
