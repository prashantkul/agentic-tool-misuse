import type { MisuseCategory } from "../../types";

interface CategoryBadgeProps {
  category: MisuseCategory;
}

const labelMap: Record<MisuseCategory, string> = {
  data_exfiltration: "Data Exfiltration",
  unauthorized_file_access: "Unauthorized Access",
  destructive_command: "Destructive Command",
  prompt_injection_compliance: "Prompt Injection",
  obfuscated_exfiltration: "Obfuscated Exfil",
  privilege_escalation: "Privilege Escalation",
  none: "None",
};

const colorMap: Record<MisuseCategory, string> = {
  data_exfiltration: "bg-red-100 text-red-800",
  unauthorized_file_access: "bg-orange-100 text-orange-800",
  destructive_command: "bg-red-100 text-red-700",
  prompt_injection_compliance: "bg-violet-100 text-violet-800",
  obfuscated_exfiltration: "bg-pink-100 text-pink-800",
  privilege_escalation: "bg-amber-100 text-amber-800",
  none: "bg-gray-100 text-gray-600",
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`rounded-full text-xs px-2 py-0.5 font-medium ${colorMap[category]}`}
    >
      {labelMap[category]}
    </span>
  );
}
