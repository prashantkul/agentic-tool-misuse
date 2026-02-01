import type { CollectionInfo } from "../../types";
import CollectionCard from "./CollectionCard";

interface Props {
  collections: CollectionInfo[];
}

export default function CollectionList({ collections }: Props) {
  if (collections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No collections found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
