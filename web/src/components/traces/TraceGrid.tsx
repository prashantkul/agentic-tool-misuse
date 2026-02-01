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
      <div className="text-center py-12 text-gray-500">
        No traces match the current filters.
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {results.length} trace{results.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
