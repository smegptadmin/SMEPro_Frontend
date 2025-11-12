
import React, { useEffect } from 'react';
import { SearchResult } from '../types';

interface SearchResultsModalProps {
  query: string;
  results: SearchResult[];
  onClose: () => void;
}

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ query, results, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  const highlightMatches = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-2xl p-6 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Search Results for "{query}"</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 transition-colors" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto space-y-3 pr-2 -mr-2">
          {results.length > 0 ? (
            results.map((result, index) => (
              <div key={index} className="search-modal-result-item p-4 bg-slate-700/50 rounded-lg transition-colors">
                <h3 
                  className="font-semibold text-cyan-400"
                  dangerouslySetInnerHTML={{ __html: highlightMatches(result.title, query) }} 
                />
                <p 
                  className="text-sm text-slate-300 mt-1"
                  dangerouslySetInnerHTML={{ __html: highlightMatches(result.content, query) }} 
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">No results found for your query.</p>
              <p className="text-sm text-slate-500 mt-2">Try searching for terms like "resolution", "context", or "solo".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsModal;
