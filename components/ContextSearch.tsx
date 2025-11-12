


import React, { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import { ChatSession } from '../types';
import { ContextualSearchState } from '../types';

interface ContextSearchProps extends ContextualSearchState {
  onClose: () => void;
  onAnalyze: (query: string, selectedSessions: ChatSession[]) => void;
}

type SortByType = 'timestamp' | 'context';
type ExtendedChatSession = ChatSession & { key: string };

const ContextSearch: React.FC<ContextSearchProps> = ({ onClose, onAnalyze, isLoading, result, query }) => {
    const [sessions, setSessions] = useState<ExtendedChatSession[]>([]);
    const [selectedSessionKeys, setSelectedSessionKeys] = useState<Set<string>>(new Set());
    const [localQuery, setLocalQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortByType>('timestamp');

    useEffect(() => {
        const loadedSessions: ExtendedChatSession[] = [];
        const chatKeyRegex = /^chatMessages_(.+)_(.+)_(.+)$/;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && chatKeyRegex.test(key)) {
                const sessionData = localStorage.getItem(key);
                if (sessionData) {
                    try {
                        const parsed = JSON.parse(sessionData) as ChatSession;
                        loadedSessions.push({ ...parsed, key });
                    } catch(e) { console.error('Failed to parse session from localStorage', e)}
                }
            }
        }
        setSessions(loadedSessions);
        setSelectedSessionKeys(new Set(loadedSessions.map(s => s.key)));
    }, []);

    const sortedSessions = useMemo(() => {
        return [...sessions].sort((a, b) => {
            if (sortBy === 'context') {
                const contextA = a.smeConfigs[0] ? `${a.smeConfigs[0].industry}${a.smeConfigs[0].subType}${a.smeConfigs[0].segment}` : '';
                const contextB = b.smeConfigs[0] ? `${b.smeConfigs[0].industry}${b.smeConfigs[0].subType}${b.smeConfigs[0].segment}` : '';
                return contextA.localeCompare(contextB);
            }
            return b.lastModified - a.lastModified; // Default 'timestamp'
        });
    }, [sessions, sortBy]);

    const handleToggleSession = (key: string) => {
        const newSelection = new Set(selectedSessionKeys);
        if (newSelection.has(key)) {
            newSelection.delete(key);
        } else {
            newSelection.add(key);
        }
        setSelectedSessionKeys(newSelection);
    };

    const handleSelectAll = (select: boolean) => {
        if (select) {
            setSelectedSessionKeys(new Set(sessions.map(s => s.key)));
        } else {
            setSelectedSessionKeys(new Set());
        }
    };

    const handleAnalyzeClick = (e: React.FormEvent) => {
        e.preventDefault();
        const selected = sessions.filter(s => selectedSessionKeys.has(s.key));
        onAnalyze(localQuery, selected);
    };

    const renderResult = () => {
        if (isLoading && !result) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-400">
                <div className="w-10 h-10 border-4 border-t-cyan-500 border-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-semibold">Analyzing your context...</p>
                <p className="text-sm">This may take a moment as the SME synthesizes insights.</p>
              </div>
            </div>
          );
        }
        if (!query && !isLoading) {
             return (
                 <div className="flex items-center justify-center h-full">
                    <div className="text-center text-slate-500 max-w-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto mb-4"><path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" /><path fillRule="evenodd" d="M9.344 3.071a49.488 49.488 0 0 0-3.527 1.212.75.75 0 0 0-.421 1.053l.853 1.512a18.026 18.026 0 0 1-1.112 3.585.75.75 0 0 0 .42 1.053l1.513.852a18.026 18.026 0 0 1 3.585-1.112.75.75 0 0 0 1.053-.421l1.212-3.527a49.488 49.488 0 0 0-1.212-3.527.75.75 0 0 0-1.053-.421Zm10.428 9.656a18.026 18.026 0 0 1-1.112 3.585.75.75 0 0 1-.42 1.053l-1.513.852a18.026 18.026 0 0 1 3.585-1.112.75.75 0 0 1 1.053-.421l1.212-3.527a49.488 49.488 0 0 1-1.212-3.527.75.75 0 0 1-1.053-.421l-3.527 1.212a49.488 49.488 0 0 1 3.527 1.212.75.75 0 0 1 .421 1.053l-.853 1.512Z" clipRule="evenodd" /></svg>
                        <h3 className="text-xl font-bold text-slate-300">Analysis Workbench</h3>
                        <p className="mt-2 text-sm">Select sessions from the left, ask a question, and the SME will analyze them to derive new insights and solutions for you.</p>
                    </div>
                </div>
             );
        }
        let html = marked(result) as string;
        if (isLoading && result) {
            const cursor = '<span class="blinking-cursor ml-1">|</span>';
            const trimmedHtml = html.trim();
            if (trimmedHtml.endsWith('</p>')) {
                const insertionPoint = html.lastIndexOf('</p>');
                html = html.substring(0, insertionPoint) + cursor + html.substring(insertionPoint);
            } else {
              html += cursor;
            }
        }
        return <div className="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3" dangerouslySetInnerHTML={{ __html: html }} />;
    };

    return (
        <div className="context-search-container flex h-full bg-slate-800">
            {/* Left Pane: Session Browser */}
            <div className="w-1/3 min-w-[300px] max-w-[400px] flex flex-col bg-slate-900/50 border-r border-slate-700 p-3">
                <header className="flex-shrink-0 mb-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">Select Context</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 transition-colors" aria-label="Close search">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">Sort by:</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortByType)} className="bg-slate-700 border border-slate-600 rounded-md px-2 py-0.5 text-xs text-white focus:ring-2 focus:ring-cyan-500 outline-none">
                                <option value="timestamp">Date</option>
                                <option value="context">SME Context</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => handleSelectAll(true)} className="text-cyan-500 hover:underline text-xs">All</button>
                             <button onClick={() => handleSelectAll(false)} className="text-cyan-500 hover:underline text-xs">None</button>
                        </div>
                    </div>
                </header>
                <div className="flex-grow overflow-y-auto space-y-2 pr-1 -mr-2">
                    {sortedSessions.map(session => (
                        <div key={session.key} onClick={() => handleToggleSession(session.key)} className={`p-2.5 rounded-lg cursor-pointer border transition-colors ${selectedSessionKeys.has(session.key) ? 'bg-cyan-900/50 border-cyan-700' : 'bg-slate-800 hover:bg-slate-700/50 border-slate-700'}`}>
                            <div className="flex items-start gap-2.5">
                                <input type="checkbox" checked={selectedSessionKeys.has(session.key)} readOnly className="mt-1 h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500"/>
                                <div className="flex-grow">
                                    <p className="font-semibold text-white text-sm leading-tight" title={session.title || session.smeConfigs[0]?.segment}>{session.title || session.smeConfigs[0]?.segment}</p>
                                    <p className="text-xs text-slate-400 truncate">{`${session.smeConfigs[0]?.industry} / ${session.smeConfigs[0]?.subType}`}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(session.lastModified).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Pane: Analysis Workbench */}
            <div className="flex-1 flex flex-col p-4 min-h-0">
                <div className="flex-grow flex flex-col bg-slate-700/30 rounded-lg">
                    <div className={`flex-grow overflow-y-auto p-4 ${query ? '' : 'flex'}`}>
                        {renderResult()}
                    </div>
                    <div className="flex-shrink-0 p-3 border-t border-slate-700">
                        <form onSubmit={handleAnalyzeClick} className="flex items-center gap-2">
                             <input
                                type="text"
                                value={localQuery}
                                onChange={(e) => setLocalQuery(e.target.value)}
                                placeholder="Ask about your selected sessions..."
                                className="w-full p-2 bg-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !localQuery.trim() || selectedSessionKeys.size === 0}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                Analyze
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContextSearch;