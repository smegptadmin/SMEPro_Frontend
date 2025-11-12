import React from 'react';
import AiSafetySettings from './AiSafetySettings';

interface SafeAiModalProps {
  onClose: () => void;
}

const SafeAiModal: React.FC<SafeAiModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-4xl p-6 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-cyan-400"><path fillRule="evenodd" d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM8.5 4.134a.75.75 0 0 1 .866-.5A6.5 6.5 0 0 1 18.366 12a.75.75 0 0 1-1.498.088 5 5 0 0 0-9.736-2.22.75.75 0 0 1 .434-1.392Z" clipRule="evenodd" /><path d="M3.293 4.293a.75.75 0 0 1 1.06 0l10 10a.75.75 0 0 1-1.06 1.06l-10-10a.75.75 0 0 1 0-1.06Z" /></svg>
            <h2 className="text-2xl font-bold text-white">SAFE AI Monitoring</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 -mr-4">
          <AiSafetySettings />
        </div>
      </div>
    </div>
  );
};

export default SafeAiModal;