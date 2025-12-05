'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

export function MessageContent({ content, isUser }: MessageContentProps) {
  // For user messages, render as plain text
  if (isUser) {
    return (
      <p className="text-sm whitespace-pre-wrap break-words overflow-hidden">
        {content}
      </p>
    );
  }

  // For assistant messages, render with markdown support
  return (
    <div className="text-sm max-w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize rendering of different markdown elements
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words">
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (isInline) {
              return (
                <code
                  className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono break-all"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <code
                className={cn(
                  'block bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto font-mono text-sm max-w-full',
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-2">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 italic">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-2 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-2 mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mb-2 mt-3 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-bold mb-2 mt-2 first:mt-0">
              {children}
            </h4>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 max-w-full">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
