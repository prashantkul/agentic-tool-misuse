import type { Decision, FilterState, MisuseCategory, Severity } from "../../types";

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  resultCounts: {
    decisions: Record<string, number>;
    categories: Record<string, number>;
    severities: Record<string, number>;
  };
}

const decisionOptions: Decision[] = ["block", "warn", "allow"];
const severityOptions: Severity[] = ["critical", "high", "medium", "low", "none"];

const categoryLabels: Record<string, string> = {
  data_exfiltration: "Data Exfiltration",
  unauthorized_file_access: "Unauthorized Access",
  destructive_command: "Destructive Command",
  prompt_injection_compliance: "Prompt Injection",
  obfuscated_exfiltration: "Obfuscated Exfil",
  privilege_escalation: "Privilege Escalation",
  none: "None",
};

export default function FilterSidebar({ filters, onChange, resultCounts }: Props) {
  const toggleDecision = (decision: Decision) => {
    const next = filters.decisions.includes(decision)
      ? filters.decisions.filter((d) => d !== decision)
      : [...filters.decisions, decision];
    onChange({ ...filters, decisions: next });
  };

  const toggleCategory = (category: MisuseCategory) => {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: next });
  };

  const toggleSeverity = (severity: Severity) => {
    const next = filters.severities.includes(severity)
      ? filters.severities.filter((s) => s !== severity)
      : [...filters.severities, severity];
    onChange({ ...filters, severities: next });
  };

  const nonZeroCategories = Object.entries(resultCounts.categories).filter(
    ([, count]) => count > 0,
  );

  return (
    <div className="w-72 shrink-0 glass-card rounded-2xl p-5 border border-gray-100 sticky top-24 self-start">
      <div className="space-y-6">
        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">Decision</h4>
          <div className="space-y-2">
            {decisionOptions.map((decision) => (
              <label
                key={decision}
                className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.decisions.includes(decision)}
                  onChange={() => toggleDecision(decision)}
                  className="accent-cyan-600 rounded"
                />
                <span className="capitalize">{decision}</span>
                <span className="text-xs text-gray-400 ml-auto font-medium">
                  {resultCounts.decisions[decision] ?? 0}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">Category</h4>
          <div className="space-y-2">
            {nonZeroCategories.map(([category, count]) => (
              <label
                key={category}
                className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category as MisuseCategory)}
                  onChange={() => toggleCategory(category as MisuseCategory)}
                  className="accent-cyan-600 rounded"
                />
                <span>{categoryLabels[category] ?? category}</span>
                <span className="text-xs text-gray-400 ml-auto font-medium">{count}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">Severity</h4>
          <div className="space-y-2">
            {severityOptions.map((severity) => (
              <label
                key={severity}
                className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.severities.includes(severity)}
                  onChange={() => toggleSeverity(severity)}
                  className="accent-cyan-600 rounded"
                />
                <span className="capitalize">{severity}</span>
                <span className="text-xs text-gray-400 ml-auto font-medium">
                  {resultCounts.severities[severity] ?? 0}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">Search</h4>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search traces..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
          />
        </div>
      </div>
    </div>
  );
}
