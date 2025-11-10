'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getSearchHistory } from '@/lib/features/search/searchThunk';

import { SearchHistoryItem } from '@/lib/types';
import { Clock, Search, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void;
}

export function SearchHistory({ onSelectQuery }: SearchHistoryProps) {
  const dispatch = useAppDispatch();
  const { history, loading, error } = useAppSelector((state) => state.search);

  useEffect(() => {
    dispatch(getSearchHistory({ page: 1, pageSize: 20 }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No search history yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Search History
      </h3>
      {history.map((item: SearchHistoryItem) => (
        <button
          key={item.id}
          onClick={() => onSelectQuery(item.query)}
          className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {item.query}
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(item.created_at)}
                </span>
                <span>{item.results_count} results</span>
                <span className="uppercase">{item.engine}</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}