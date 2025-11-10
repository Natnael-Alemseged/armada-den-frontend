'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SearchResult } from '@/lib/types';
import { Search, Loader2, AlertCircle, ExternalLink, History } from 'lucide-react';
import { SearchResultsList } from './SearchResultsList';
import { SearchHistory } from './SearchHistory';

export function SearchView() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setCheckingConnection(true);
      const status = await api.getSearchStatus();
      setIsConnected(status.connected);
    } catch (err) {
      console.error('Failed to check search connection:', err);
      setIsConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const connectSearch = async () => {
    try {
      setError('');
      const response = await api.connectSearch(
        window.location.origin + '/search/callback'
      );
      window.location.href = response.connection_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect search');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      setShowHistory(false);
      const response = await api.performSearch({
        query: query.trim(),
        num_results: 10,
        engine: 'SERPAPI',
        save_to_db: true,
      });
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (checkingConnection) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Search Engine
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect a search engine to perform web searches directly from Armada Den.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={connectSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Connect Search Engine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Web Search
          </h2>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <History className="w-4 h-4" />
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto">
        {error && (
          <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {showHistory ? (
          <SearchHistory onSelectQuery={(q: string) => {
            setQuery(q);
            setShowHistory(false);
          }} />
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : results.length === 0 && !error ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Enter a search query to get started</p>
            </div>
          </div>
        ) : (
          <SearchResultsList results={results} />
        )}
      </div>
    </div>
  );
}