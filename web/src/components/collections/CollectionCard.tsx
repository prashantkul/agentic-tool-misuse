import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { analyzeCollection, getCollectionResults } from "../../api/client";
import type { CollectionInfo } from "../../types";

interface Props {
  collection: CollectionInfo;
}

export default function CollectionCard({ collection }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [limit, setLimit] = useState<string>("");
  const [rulesOnly, setRulesOnly] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      analyzeCollection(collection.id, {
        limit: limit ? parseInt(limit, 10) : undefined,
        rules_only: rulesOnly,
      }),
  });

  const { data: results } = useQuery({
    queryKey: ["collection-status", collection.id],
    queryFn: () => getCollectionResults(collection.id),
    enabled: mutation.isSuccess,
    refetchInterval: (query) =>
      query.state.data?.status === "running" ? 3000 : false,
  });

  const handleAnalyze = () => {
    if (!showForm) {
      setShowForm(true);
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="glass-card card-hover rounded-2xl p-6 border-2 border-gray-100">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg mb-4">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 truncate">
        {collection.name}
      </h3>
      <p className="font-mono text-xs text-gray-400 mt-1">
        {collection.id}
      </p>
      {collection.description && (
        <p className="text-sm text-gray-500 mt-2">{collection.description}</p>
      )}
      {collection.agent_run_count !== undefined && (
        <p className="text-xs text-gray-400 mt-1">
          {collection.agent_run_count} traces
        </p>
      )}

      {showForm && !mutation.isSuccess && (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Limit (optional)
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="All traces"
              className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={rulesOnly}
              onChange={(e) => setRulesOnly(e.target.checked)}
              className="accent-cyan-600 rounded"
            />
            Rules only (skip LLM judge)
          </label>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm font-medium text-emerald-700">Analysis started!</p>
          {results && (
            <p className="text-xs text-emerald-600 mt-1">
              Status: {results.status} ({results.analyzed_count}/
              {results.total_count})
            </p>
          )}
          <Link
            to={`/collections/${collection.id}`}
            className="text-sm font-medium text-cyan-600 hover:text-cyan-700 mt-2 inline-block transition-colors"
          >
            View Results &rarr;
          </Link>
        </div>
      )}

      {mutation.isError && (
        <p className="mt-3 text-sm text-red-600">
          Error: {(mutation.error as Error).message}
        </p>
      )}

      {!mutation.isSuccess && (
        <button
          onClick={handleAnalyze}
          disabled={mutation.isPending}
          className="mt-4 bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:from-cyan-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm transition-all"
        >
          {mutation.isPending
            ? "Starting..."
            : showForm
              ? "Start Analysis"
              : "Analyze"}
        </button>
      )}
    </div>
  );
}
