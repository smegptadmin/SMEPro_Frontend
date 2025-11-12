import React, { useEffect } from 'react';
import { Citation } from '../types';

interface CitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  citations: Citation[];
}

const CitationsModal: React.FC<CitationsModalProps> = ({ isOpen, onClose, citations }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-2xl p-6 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">All Sources</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 transition-colors" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto space-y-3 pr-2 -mr-2">
            {citations.map((citation, index) => (
                <a
                    key={index}
                    href={citation.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold text-slate-400 mt-0.5">{index + 1}.</span>
                        <div className="flex-grow">
                            <p className="font-semibold text-cyan-400 break-words">{citation.title}</p>
                            <p className="text-xs text-slate-500 mt-1 truncate">{citation.uri}</p>
                        </div>
                    </div>
                </a>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CitationsModal;
