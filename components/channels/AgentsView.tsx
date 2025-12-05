"use client";

import React from "react";
import { useAppSelector } from "@/lib/hooks";
import { Bot, Loader2, Plus } from "lucide-react";
import { Agent } from "@/lib/types";

export function AgentsView() {
  const { agents, loading, error } = useAppSelector((state) => state.agents);

  return (
    <div className="flex-1 flex flex-col bg-white p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Agents</h2>
          <p className="text-sm text-gray-500">Manage specialized AI teammates</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Construct New Agent
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
          {error}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <Bot className="w-14 h-14 mb-3 opacity-50" />
          <p className="text-sm">No agents yet. Click "Construct New Agent" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent: Agent) => (
            <div
              key={agent.id}
              className="rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-xs uppercase tracking-wide text-gray-400">{agent.role}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{agent.description}</p>
              {agent.capabilities?.length ? (
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.slice(0, 3).map((capability: string) => (
                    <span
                      key={capability}
                      className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
