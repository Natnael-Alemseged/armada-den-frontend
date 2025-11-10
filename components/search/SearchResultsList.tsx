'use client';

import React from 'react';
import { SearchResult } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

interface SearchResultsListProps {
  results: SearchResult[];
}

export function SearchResultsList({ results }: SearchResultsListProps) {
  return (
    <div className="p-4 space-y-4">
      {results.map((result, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                {result.title}
              </h3>
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
            </div>
            <p className="text-sm text-green-700 dark:text-green-400 mb-2 truncate">
              {result.link}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {result.snippet}
            </p>
          </a>
        </div>
      ))}
    </div>
  );
}