"use client";

import React from "react";
import { BookOpen, BookOpenText, BookmarkCheck, Wind } from "lucide-react";

const DEFAULT_TABS = [
  { id: "read", label: "Tilawah", icon: BookOpen },
  { id: "mushaf", label: "Mushaf", icon: BookOpenText },
  { id: "memorize", label: "Muraja'ah", icon: BookmarkCheck },
  { id: "khusyuk", label: "Khusyuk", icon: Wind },
];

export default function BottomNav({ activeTab, setActiveTab, items = DEFAULT_TABS }) {
  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-theme backdrop-blur-lg bg-[var(--bg-canvas)]/95 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-3"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {items.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
                isActive ? "ink-primary font-semibold" : "ink-muted hover:ink-primary"
              }`}
            >
              <div
                className={`w-9 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? "surface-accent-soft text-emerald-700" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
