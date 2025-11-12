import React from 'react';
import { FlaggedPrompt } from '../types';

interface HarmfulContentWarningModalProps {
  details: Omit<FlaggedPrompt, 'id' | 'timestamp' | 'userId' | 'actionTaken'>;
  onClose: () => void;
  onNewRequest: () => void;
  onClearSession: () => void;
}

const HarmfulContentWarningModal: React.FC<HarmfulContentWarningModalProps> = ({ details, onClose, onNewRequest, onClearSession }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-red-500 shadow-2xl shadow-red-500/20 w-full max-w-lg p-8">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-400"><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">Warning: Content Flagged</h2>
                <p className="text-slate-300 mt-2">
                    Your recent prompt has been flagged by our SAFE AI system for potentially violating our acceptable use policy.
                </p>
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-400"><strong>Detection Method:</strong> <span className="font-mono">{details.detectionMethod}</span></p>
                    <p className="text-sm text-slate-400 mt-1"><strong>Details:</strong> <span className="text-red-400">{details.details}</span></p>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                    Please refrain from submitting similar content. Repeated violations will result in a temporary suspension of your account.
                </p>
            </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onNewRequest} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500">
            New Request
          </button>
          <button onClick={onClearSession} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-500">
            Clear Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default HarmfulContentWarningModal;