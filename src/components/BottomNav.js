"use client";

import React from "react";
import { BookOpen, Headphones, Brain, Sparkles } from "lucide-react";

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "read", label: "Read", icon: BookOpen, desc: "Baca + Terjemahan" },
    { id: "listen", label: "Listen", icon: Headphones, desc: "Murattal Player" },
    { id: "memorize", label: "Memorize", icon: Brain, desc: "Hafalan Mode" },
    { id: "reflect", label: "Reflect", icon: Sparkles, desc: "AI Tadabbur" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-lg border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-3">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 ${
                isActive
                  ? "text-emerald-900 font-semibold"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-100/60"
              }`}
            >
              <div
                className={`w-9 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive ? "bg-emerald-100 text-emerald-800 shadow-xs" : "text-stone-600"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? "font-bold text-emerald-900" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
