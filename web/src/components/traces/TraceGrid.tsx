import type { TraceResult } from "../../types";
import TraceCard from "./TraceCard";

interface Props {
  results: TraceResult[];
  onSelect: (traceId: string) => void;
  selectedId: string | undefined;
}

export default function TraceGrid({ results, onSelect, selectedId }: Props) {
  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-700">No traces found</p>
        <p className="text-sm text-gray-400 mt-1">No traces match the current filters.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4 font-medium">
        {results.length} trace{results.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {results.map((result) => (
          <TraceCard
            key={result.trace_id}
            result={result}
            selected={result.trace_id === selectedId}
            onClick={() => onSelect(result.trace_id)}
          />
        ))}
      </div>
    </div>
  );
}
