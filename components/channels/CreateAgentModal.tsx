"use client";

import React, { useState } from "react";
import {
    X,
    Sparkles,
    Mail,
    Calendar,
    Twitter,
    Search,
    Linkedin,
    Upload,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    CheckCircle2
} from "lucide-react";

interface CreateAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TOOLS = [
    { id: "gmail", name: "Gmail", icon: Mail, color: "text-red-500", bg: "bg-red-50" },
    { id: "calendar", name: "Calendar", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "text-gray-900", bg: "bg-gray-100" },
    { id: "composio", name: "Composio Search", icon: Search, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-600", bg: "bg-blue-50" },
];

const STEPS = [
    { id: 1, name: "Identity", description: "Name & Personality" },
    { id: 2, name: "Tools", description: "Integrations" },
    { id: 3, name: "Knowledge", description: "Context & Memory" },
];

export function CreateAgentModal({ isOpen, onClose }: CreateAgentModalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [activeTools, setActiveTools] = useState<string[]>([]);
    const [memoryType, setMemoryType] = useState<"always" | "sometimes">("always");
    const [isRefining, setIsRefining] = useState(false);

    if (!isOpen) return null;

    const toggleTool = (id: string) => {
        setActiveTools(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleRefine = () => {
        setIsRefining(true);
        setTimeout(() => setIsRefining(false), 2000);
    };

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleCreate = () => {
        // Logic for creating agent
        onClose();
        setCurrentStep(1); // Reset for next time
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Construct New Agent</h2>
                            <p className="text-sm text-gray-500">Step {currentStep} of 3 — {STEPS[currentStep - 1].description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        {STEPS.map((step) => (
                            <React.Fragment key={step.id}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${currentStep >= step.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-400"
                                        }`}>
                                        {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                                    </div>
                                    <span className={`text-xs font-bold tracking-wider uppercase ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"
                                        }`}>
                                        {step.name}
                                    </span>
                                </div>
                                {step.id < 3 && (
                                    <div className="flex-1 px-4">
                                        <div className={`h-[2px] transition-all duration-500 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-100"}`} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <div key={currentStep} className="animate-in slide-in-from-right-4 fade-in duration-300">
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                {/* Basic Info */}
                                <section className="space-y-3">
                                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Agent Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., DevOps, Creative Writer, Researcher"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium"
                                    />
                                </section>

                                {/* System Prompt */}
                                <section className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">System Prompt</label>
                                        <button
                                            onClick={handleRefine}
                                            disabled={isRefining}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                                        >
                                            <Sparkles className={`w-4 h-4 ${isRefining ? 'animate-pulse' : ''}`} />
                                            <span className="text-xs font-bold uppercase tracking-wide">
                                                {isRefining ? 'Refining...' : 'Refine Prompt'}
                                            </span>
                                        </button>
                                    </div>
                                    <textarea
                                        rows={6}
                                        placeholder="Define your agent's personality, goals, and constraints..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 text-sm leading-relaxed resize-none"
                                    />
                                </section>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <section className="space-y-4">
                                    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 mb-6 font-medium">
                                        <p className="text-sm text-blue-700">
                                            Select the tools your agent can access to perform tasks and retrieve data.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {TOOLS.map((tool) => {
                                            const isActive = activeTools.includes(tool.id);
                                            return (
                                                <button
                                                    key={tool.id}
                                                    onClick={() => toggleTool(tool.id)}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${isActive
                                                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-lg ${tool.bg} flex items-center justify-center shrink-0`}>
                                                        <tool.icon className={`w-6 h-6 ${tool.color}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold text-gray-900">{tool.name}</div>
                                                        <div className="text-[11px] text-gray-500 font-medium">{isActive ? 'Access Granted' : 'Access Disabled'}</div>
                                                    </div>
                                                    {isActive && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Environment Knowledge</label>
                                        <div className="relative">
                                            <select
                                                value={memoryType}
                                                onChange={(e) => setMemoryType(e.target.value as any)}
                                                className="appearance-none bg-gray-50 border border-gray-100 pl-4 pr-10 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer hover:bg-gray-100/80"
                                            >
                                                <option value="always">Remember Always</option>
                                                <option value="sometimes">Remember Sometimes</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <textarea
                                            rows={4}
                                            placeholder="Enter specific rules, context, or long-term knowledge the agent should always remember..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm leading-relaxed resize-none"
                                        />

                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl p-10 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">Upload Data Source</p>
                                            <p className="text-xs text-gray-500 font-medium tracking-tight">Drop PDF, TXT or Markdown files here</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <button
                        onClick={currentStep === 1 ? onClose : handleBack}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                    >
                        {currentStep > 1 && <ChevronLeft className="w-4 h-4" />}
                        {currentStep === 1 ? "Cancel" : "Back"}
                    </button>

                    <button
                        onClick={currentStep === 3 ? handleCreate : handleNext}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                        <span>{currentStep === 3 ? "Create Agent" : "Continue"}</span>
                        {currentStep < 3 && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
