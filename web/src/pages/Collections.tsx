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
      <div className="text-center py-12">
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
    <div>
      <h1 className="text-2xl font-bold mb-1">Collections</h1>
      <p className="text-gray-500 mb-6">
        Browse and analyze agent trace collections.
      </p>
      <CollectionList collections={collections ?? []} />
    </div>
  );
}
