import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';

interface MessageContentProps {
    content: string;
    className?: string;
}

export function MessageContent({ content, className = '' }: MessageContentProps) {
    return (
        <div className={`markdown-content break-words overflow-hidden ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Paragraphs
                    p: ({ children }) => <p className="mb-1 last:mb-0 leading-relaxed break-words">{children}</p>,

                    // Headings
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-1 mt-2 first:mt-0">{children}</h3>,

                    // Lists
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,

                    // Links
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline underline-offset-2 break-all"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {children}
                        </a>
                    ),

                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-3 py-1 my-2 text-gray-600 italic bg-gray-50/50 rounded-r">
                            {children}
                        </blockquote>
                    ),

                    // Code
                    code: ({ className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !String(children).includes('\n');

                        if (isInline) {
                            return (
                                <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-[0.9em] font-mono text-pink-600 dark:text-pink-400 break-all" {...props}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <div className="relative my-2 rounded-md overflow-hidden bg-[#1e1e1e] text-gray-200 max-w-full">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] text-xs text-gray-400 border-b border-gray-700">
                                    <span>{match?.[1] || 'text'}</span>
                                </div>
                                <pre className="p-3 overflow-x-auto text-sm font-mono custom-scrollbar max-w-full">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        );
                    },

                    // Tables
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-2 border border-gray-200 rounded-lg w-full">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                    tbody: ({ children }) => <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>,
                    tr: ({ children }) => <tr>{children}</tr>,
                    th: ({ children }) => (
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => <td className="px-3 py-2 whitespace-nowrap text-gray-500">{children}</td>,

                    // Horizontal Rule
                    hr: () => <hr className="my-4 border-gray-200" />,

                    // Images (limit size)
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-[300px] rounded-lg my-2 object-contain bg-gray-50 border border-gray-200"
                            loading="lazy"
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
