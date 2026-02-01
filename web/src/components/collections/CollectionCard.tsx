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
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-900 truncate">
        {collection.name}
      </h3>
      <p className="text-xs text-gray-400 font-mono mt-1">
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
        <div className="mt-4 space-y-3 border-t pt-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Limit (optional)
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="All traces"
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={rulesOnly}
              onChange={(e) => setRulesOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            Rules only (skip LLM judge)
          </label>
        </div>
      )}

      {mutation.isSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">Analysis started!</p>
          {results && (
            <p className="text-xs text-green-600 mt-1">
              Status: {results.status} ({results.analyzed_count}/
              {results.total_count})
            </p>
          )}
          <Link
            to={`/collections/${collection.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            View Results
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
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
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
