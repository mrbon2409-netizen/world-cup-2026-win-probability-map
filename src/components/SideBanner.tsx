import { useState } from "react";
import type { LanguageCode } from "../lib/i18n";
import bannerImage from "../assets/world-cup-2026-side-banner.png";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface SideBannerProps {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
}

export function SideBanner({ language, onLanguageChange }: SideBannerProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`fixed top-24 z-40 hidden xl:flex xl:flex-col xl:items-end transition-all duration-300 ${
        isOpen ? "right-4" : "right-0"
      }`}
    >
      <div className="mb-3 flex justify-end">
        <LanguageSwitcher
          language={language}
          onChange={onLanguageChange}
          compact
          className="border-white/80 bg-white/95 shadow-lg shadow-slate-300/50"
        />
      </div>
      <div
        className={`overflow-hidden rounded-[28px] border border-white/80 bg-slate-950/90 shadow-2xl shadow-slate-300/40 backdrop-blur transition-all duration-300 ${
          isOpen ? "w-[320px]" : "w-[52px] translate-x-0"
        }`}
      >
        <button
          type="button"
          aria-label={isOpen ? "Collapse World Cup banner" : "Expand World Cup banner"}
          onClick={() => setIsOpen((current) => !current)}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-900/70 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {isOpen ? ">" : "<"}
        </button>

        {isOpen ? (
          <div className="relative">
            <img
              src={bannerImage}
              alt="World Cup 2026 side banner"
              className="h-[680px] w-full object-cover object-top"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-[420px] w-full items-center justify-center rounded-r-none bg-[linear-gradient(180deg,#08162b_0%,#0f2c55_100%)] px-2 text-center"
            aria-label="Open World Cup banner"
          >
            <span className="banner-vertical text-[12px] font-semibold uppercase tracking-[0.32em] text-white/90">
              World Cup 2026
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
