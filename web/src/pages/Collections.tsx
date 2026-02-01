import { useQuery } from "@tanstack/react-query";
import { getCollections } from "../api/client";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import CollectionList from "../components/collections/CollectionList";

export default function Collections() {
  const { data: collections, isLoading, error } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-8 border border-red-200 text-center">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-red-700 mb-2">
          Failed to load collections
        </h2>
        <p className="text-sm text-gray-500">
          {error instanceof Error ? error.message : "Could not connect to the API."}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Make sure the FastAPI backend is running on port 8000.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="gradient-hero rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Audiowide', cursive" }}>Collections</h1>
        <p className="text-gray-500 mt-2">
          Browse and analyze agent trace collections.
        </p>
      </div>
      <CollectionList collections={collections ?? []} />
    </div>
  );
}
