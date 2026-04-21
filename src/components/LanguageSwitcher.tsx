import type { LanguageCode } from "../lib/i18n";
import { supportedLanguages } from "../lib/i18n";

interface LanguageSwitcherProps {
  language: LanguageCode;
  onChange: (language: LanguageCode) => void;
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({
  language,
  onChange,
  className = "",
  compact = false,
}: LanguageSwitcherProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-sm backdrop-blur ${className}`.trim()}
    >
      {supportedLanguages.map((item) => {
        const active = item.code === language;

        return (
          <button
            key={item.code}
            type="button"
            onClick={() => onChange(item.code)}
            className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
              active
                ? "bg-ink text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            } ${compact ? "min-w-[42px]" : ""}`}
            aria-pressed={active}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
