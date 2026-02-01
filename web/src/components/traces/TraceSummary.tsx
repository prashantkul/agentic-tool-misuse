import { useState } from "react";

interface Props {
  summary: string;
}

interface Section {
  title: string;
  content: string;
  color: string;
}

const sectionColorMap: Record<string, string> = {
  "SENSITIVE DATA ACCESS": "border-red-500",
  "NETWORK ACTIVITY": "border-blue-500",
  "FILES CREATED": "border-green-500",
  "FILES MODIFIED": "border-yellow-500",
  "PRIVILEGE": "border-orange-500",
  "DESTRUCTIVE": "border-red-500",
  "FIREWALL": "border-red-500",
  "TOOL SEQUENCE": "border-gray-500",
};

function getSectionColor(title: string): string {
  for (const [key, color] of Object.entries(sectionColorMap)) {
    if (title.toUpperCase().includes(key)) return color;
  }
  return "border-gray-300";
}

function parseSections(summary: string): Section[] {
  const lines = summary.split("\n");
  const sections: Section[] = [];
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^[=#]*\s*([A-Z][A-Z\s/]+[A-Z])\s*:?\s*[=#]*$/);
    if (headerMatch) {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          content: currentContent.join("\n").trim(),
          color: getSectionColor(currentTitle),
        });
      }
      currentTitle = headerMatch[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentTitle) {
    sections.push({
      title: currentTitle,
      content: currentContent.join("\n").trim(),
      color: getSectionColor(currentTitle),
    });
  }

  if (sections.length === 0) {
    sections.push({
      title: "Summary",
      content: summary,
      color: "border-gray-300",
    });
  }

  return sections;
}

function SectionPanel({ section }: { section: Section }) {
  const [open, setOpen] = useState(true);
  const isToolSequence = section.title.toUpperCase().includes("TOOL SEQUENCE");
  const lines = section.content.split("\n").filter((l) => l.trim());

  return (
    <div className={`border-l-4 ${section.color} pl-4 mb-4`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left"
      >
        <span className="text-xs text-gray-400">{open ? "\u25BC" : "\u25B6"}</span>
        <h4 className="text-sm font-semibold text-gray-700">{section.title}</h4>
      </button>
      {open && (
        <div className="mt-2">
          {isToolSequence ? (
            <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
              {section.content}
            </pre>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {lines.map((line, idx) => (
                <li key={idx} className="text-sm text-gray-600">
                  {line.replace(/^[-*]\s*/, "")}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function TraceSummary({ summary }: Props) {
  const sections = parseSections(summary);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Trace Summary</h3>
      {sections.map((section, idx) => (
        <SectionPanel key={idx} section={section} />
      ))}
    </div>
  );
}
