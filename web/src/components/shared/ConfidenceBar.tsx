interface ConfidenceBarProps {
  confidence: number;
}

function getBarColor(confidence: number): string {
  if (confidence < 0.5) return "bg-green-500";
  if (confidence < 0.7) return "bg-yellow-500";
  if (confidence < 0.85) return "bg-orange-500";
  return "bg-red-500";
}

export default function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  const widthPercent = Math.round(confidence * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 rounded-full bg-gray-200 w-full">
        <div
          className={`h-2 rounded-full ${getBarColor(confidence)}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className="text-sm text-gray-600">{widthPercent}%</span>
    </div>
  );
}
