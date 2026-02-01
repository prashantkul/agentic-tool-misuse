import { Link, useParams } from "react-router-dom";
import TraceDetail from "../components/traces/TraceDetail";

export default function TraceDetailPage() {
  const { traceId } = useParams<{ traceId: string }>();

  if (!traceId) return null;

  return (
    <div>
      <Link
        to=".."
        relative="path"
        className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
      >
        &larr; Back
      </Link>
      <TraceDetail traceId={traceId} />
    </div>
  );
}
