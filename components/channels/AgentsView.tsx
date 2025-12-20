"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, MoreHorizontal, Settings2, Trash2 } from "lucide-react";
import { CreateAgentModal } from "./CreateAgentModal";

const STATIC_AGENTS = [
  {
    id: "1",
    name: "DevOps",
    role: "INFRASTRUCTURE MONITOR",
    description: "You are a strict DevOps engineer. You care about uptime, latency, and clean logs...",
    capabilities: ["Log analysis", "Uptime check"],
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    id: "2",
    name: "Email Assistant",
    role: "COMMUNICATION SPECIALIST",
    description: "You are a professional email assistant. Your goal is to draft clear, concise, and polite emails...",
    capabilities: ["Email drafting", "Tone Analysis", "Proofreading"],
    iconColor: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    id: "3",
    name: "Research Analyst",
    role: "DATA SPECIALIST",
    description: "You are a thorough research analyst. You summarize complex topics, find key facts...",
    capabilities: ["Summarization", "Fact Checking"],
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
  },
];

export function AgentsView() {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }

    if (activeMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  const handleToggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Bot className="w-5 h-5" />
          Construct New agent
        </button>
      </div>

      <div className="p-8">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {STATIC_AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="relative group rounded-2xl border border-gray-100 p-6 bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${agent.bgColor} flex items-center justify-center`}>
                    <Bot className={`w-7 h-7 ${agent.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {agent.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleMenu(agent.id, e)}
                  className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <p className="text-[13px] leading-relaxed text-gray-500 mb-6">
                {agent.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-[11px] font-medium"
                  >
                    {capability}
                  </span>
                ))}
              </div>

              {/* Dynamic Menu */}
              {activeMenuId === agent.id && (
                <div
                  ref={menuRef}
                  className="absolute top-12 right-0 z-20 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 mt-2 transform translate-x-4 animate-in fade-in zoom-in duration-200"
                >
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings2 className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">Edit Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span className="font-semibold">Remove Agent</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
