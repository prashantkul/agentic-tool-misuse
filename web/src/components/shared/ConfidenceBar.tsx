interface ConfidenceBarProps {
  confidence: number;
}

function getBarGradient(confidence: number): string {
  if (confidence < 0.5) return "bg-gradient-to-r from-green-400 to-emerald-500";
  if (confidence < 0.7) return "bg-gradient-to-r from-yellow-400 to-amber-500";
  if (confidence < 0.85) return "bg-gradient-to-r from-orange-400 to-orange-500";
  return "bg-gradient-to-r from-red-400 to-red-600";
}

export default function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  const widthPercent = Math.round(confidence * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 rounded-full bg-gray-200 w-full">
        <div
          className={`h-2.5 rounded-full ${getBarGradient(confidence)} transition-all duration-300`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className="font-semibold text-sm text-gray-700 min-w-[3ch] text-right">{widthPercent}%</span>
    </div>
  );
}
