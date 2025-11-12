
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface ContextPopoverProps {
  term: string;
  targetElement: HTMLElement;
  onClose: () => void;
  onSave: (term: string, definition: string) => Promise<void>;
}

const ContextPopover: React.FC<ContextPopoverProps> = ({ term, targetElement, onClose, onSave }) => {
  const [definition, setDefinition] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch definition on mount
  useEffect(() => {
    const fetchDefinition = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!process.env.API_KEY) throw new Error("API_KEY not set.");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Provide a concise, expert-level definition for the term: "${term}". The definition should be a single paragraph suitable for a professional audience.`,
        });

        setDefinition(response.text);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(`Could not fetch definition: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDefinition();
  }, [term]);
  
  // Calculate position
  useEffect(() => {
    if (!popoverRef.current || !targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const margin = 10;

    let top = targetRect.bottom + margin;
    let left = targetRect.left;

    // Adjust if it overflows bottom
    if (top + popoverRect.height > viewport.height) {
      top = targetRect.top - popoverRect.height - margin;
    }
    
    // Adjust if it overflows right
    if (left + popoverRect.width > viewport.width) {
      left = viewport.width - popoverRect.width - margin;
    }

    // Adjust if it overflows left
    if (left < margin) {
      left = margin;
    }

    setPosition({ top, left });
  }, [targetElement, isLoading]); // Rerun if loading state changes (content size changes)


  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && event.target !== targetElement) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, targetElement]);
  
  const handleSave = async () => {
    if (isSaving || !definition) return;
    setIsSaving(true);
    await onSave(term, definition);
    setIsSaving(false);
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 w-full max-w-sm p-4 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl shadow-cyan-500/10"
      style={{ top: position.top, left: position.left, opacity: position.top === 0 ? 0 : 1 }} // Hide until positioned
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-white text-lg">{term}</h3>
        <button onClick={onClose} className="p-1 -mr-2 -mt-2 rounded-full text-slate-400 hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-4 h-4 border-2 border-t-cyan-500 border-slate-600 rounded-full animate-spin"></div>
          <span>Fetching definition...</span>
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : (
        <p className="text-slate-300 text-sm">{definition}</p>
      )}

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={isLoading || isSaving || !!error}
          className="flex items-center gap-2 bg-cyan-600 text-white font-bold text-xs py-1.5 px-3 rounded-lg hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isSaving && <div className="w-3 h-3 border-2 border-t-white border-transparent rounded-full animate-spin"></div>}
          {isSaving ? 'Saving...' : 'Save to Vault'}
        </button>
      </div>
    </div>
  );
};

export default ContextPopover;
