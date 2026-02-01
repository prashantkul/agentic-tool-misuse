import type { Decision } from "../types";

export const decisionTooltips: Record<Decision, string> = {
  block: "Traces with clearly malicious or dangerous tool calls. The agent attempted data exfiltration, unauthorized access, or destructive actions.",
  warn: "Traces with suspicious tool calls that may indicate misuse. Requires human review and monitoring.",
  allow: "Traces with only legitimate tool calls consistent with the task. No evidence of misuse detected.",
};

export const categoryTooltips: Record<string, string> = {
  data_exfiltration: "Agent attempts to steal sensitive data (credentials, API keys, PII) via network requests or file operations.",
  unauthorized_file_access: "Agent reads or modifies files outside its allowed scope without authorization.",
  destructive_command: "Agent executes commands that could destroy data or disrupt systems (rm -rf, DROP TABLE, etc.).",
  prompt_injection_compliance: "Agent complies with injected instructions found in tool outputs or external content.",
  obfuscated_exfiltration: "Agent uses encoding, steganography, or indirect channels to hide data exfiltration.",
  privilege_escalation: "Agent attempts to gain elevated permissions or access restricted resources.",
  none: "No specific misuse category detected.",
};

export const severityTooltips: Record<string, string> = {
  critical: "Immediate threat requiring urgent action. Active exploitation or imminent data loss.",
  high: "Serious risk. Successful attack that accessed sensitive data or caused damage.",
  medium: "Moderate risk. Suspicious behavior that could lead to harm if unchecked.",
  low: "Minor concern. Unusual behavior with limited potential impact.",
  none: "No security concern detected.",
};

export const metricCardTooltips: Record<string, string> = {
  "Total Traces": "Total number of agent traces analyzed across all collections.",
  "Blocked": decisionTooltips.block,
  "Warned": decisionTooltips.warn,
  "Allowed": decisionTooltips.allow,
};
