"use client";

import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

type Language = "python" | "cpp" | "at" | "bash" | "json" | "typescript";

interface CodeLine {
  code: string;
  comment?: string;
  highlight?: boolean;
}

interface CodeBlockProps {
  code: string | CodeLine[];
  language?: Language;
  filename?: string;
  showLineNumbers?: boolean;
  title?: string;
}

// Simple syntax tokenizer for AT commands
function tokenizeAT(line: string): React.ReactNode {
  // AT command structure: AT+CMD=params or AT+CMD?
  const atCmdRegex = /^(AT\+?[A-Z0-9]+)(=|\?)?(.*)$/;
  const match = line.match(atCmdRegex);
  if (match) {
    return (
      <>
        <span className="text-[#53F2FA]">{match[1]}</span>
        {match[2] && <span className="text-white/50">{match[2]}</span>}
        {match[3] && <span className="text-[#BFFD11]">{match[3]}</span>}
      </>
    );
  }
  // Response lines
  if (line.startsWith("+") || line === "OK" || line === "ERROR") {
    return <span className="text-[#4ade80]">{line}</span>;
  }
  // Comments
  if (line.startsWith("//") || line.startsWith("#")) {
    return <span className="text-[#7A8999]">{line}</span>;
  }
  return <span className="text-white/75">{line}</span>;
}

// Simple Python tokenizer
function tokenizePython(line: string): React.ReactNode {
  const keywords = /\b(def|class|import|from|return|if|else|elif|for|while|in|not|and|or|True|False|None|try|except|with|as|pass|raise)\b/g;
  const stringRegex = /(["'])((?:[^"'\\]|\\.)*?)\1/g;
  const commentRegex = /#.+$/;
  const funcRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g;

  // Just return a formatted line with basic coloring via spans
  // For production, use shiki. This is a lightweight fallback.
  const commentMatch = line.match(commentRegex);
  if (commentMatch) {
    const beforeComment = line.slice(0, commentMatch.index);
    return (
      <>
        <span className="text-white/75">{beforeComment}</span>
        <span className="text-[#7A8999]">{commentMatch[0]}</span>
      </>
    );
  }
  if (line.trim().startsWith("import ") || line.trim().startsWith("from ")) {
    return <span className="text-[#53F2FA]">{line}</span>;
  }
  if (line.trim().startsWith("def ") || line.trim().startsWith("class ")) {
    const parts = line.split(/\b(def|class)\b/);
    return (
      <>
        <span className="text-white/50">{parts[0]}</span>
        <span className="text-[#BFFD11]">{parts[1]}</span>
        <span className="text-white/75">{parts.slice(2).join("")}</span>
      </>
    );
  }
  return <span className="text-white/75">{line}</span>;
}

function renderLine(line: string, language: Language): React.ReactNode {
  if (language === "at") return tokenizeAT(line);
  if (language === "python") return tokenizePython(line);
  return <span className="text-white/75">{line}</span>;
}

const langLabels: Record<Language, string> = {
  python: "Python",
  cpp: "C++",
  at: "AT Commands",
  bash: "Bash",
  json: "JSON",
  typescript: "TypeScript",
};

export default function CodeBlock({
  code,
  language = "at",
  filename,
  showLineNumbers = true,
  title,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const lines: CodeLine[] = typeof code === "string"
    ? code.split("\n").map((c) => ({ code: c }))
    : code;

  const rawText = lines.map((l) => l.code).join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[#3A3C46]/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0e1a] border-b border-[#3A3C46]/40">
        <div className="flex items-center gap-2.5">
          <Terminal size={13} className="text-[#7A8999]" />
          {filename ? (
            <span className="font-mono text-[11px] font-semibold tracking-wider text-white/50">
              {filename}
            </span>
          ) : (
            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#BFFD11]/70">
              {langLabels[language]}
            </span>
          )}
          {title && (
            <span className="text-xs text-white/30 pl-2 border-l border-[#3A3C46]/40">
              {title}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-white/40 hover:text-white hover:bg-white/5 transition-all duration-150 cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#BFFD11]" />
              <span className="text-[#BFFD11]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto bg-[#030710]">
        <table className="w-full min-w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr
                key={idx}
                className={`group ${line.highlight ? "bg-[#BFFD11]/5 border-l-2 border-[#BFFD11]" : ""}`}
              >
                {showLineNumbers && (
                  <td className="select-none text-right pr-4 pl-4 py-0.5 text-[#7A8999] font-mono text-xs w-10 text-[11px]">
                    {idx + 1}
                  </td>
                )}
                <td className="pr-6 py-0.5 font-mono text-xs leading-6 whitespace-pre">
                  {renderLine(line.code, language)}
                  {line.comment && (
                    <span className="text-[#7A8999] ml-3 select-none">
                      {" "}
                      {language === "python" || language === "bash" ? "#" : "//"} {line.comment}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
