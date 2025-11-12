
import React from 'react';
import { Message, SmeConfig } from '../types';

interface ChangeSmeModalProps {
  onClose: () => void;
  onStartFresh: () => void;
  onKeepAndSwitch: (messages: Message[]) => void;
  smeConfig?: SmeConfig; // Make optional
  isLegacyKeepOptionDisabled?: boolean;
}

const ChangeSmeModal: React.FC<ChangeSmeModalProps> = ({ onClose, onStartFresh, onKeepAndSwitch, smeConfig, isLegacyKeepOptionDisabled = false }) => {
    const handleKeep = () => {
        if (!smeConfig) {
            onClose();
            return;
        }
        const chatHistoryKey = `chatMessages_${smeConfig.industry}_${smeConfig.subType}_${smeConfig.segment}`;
        const savedSession = localStorage.getItem(chatHistoryKey);
        const messages: Message[] = savedSession ? JSON.parse(savedSession).messages : [];
        onKeepAndSwitch(messages);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-md p-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">New Chat Session</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
                    </button>
                </div>
                <p className="text-slate-300 mb-6">Are you sure you want to start a new collaborative chat? This will generate a new shareable link.</p>
                <div className="space-y-4">
                    <button
                        onClick={onStartFresh}
                        className="w-full text-left p-4 bg-cyan-600 hover:bg-cyan-500 rounded-lg border border-cyan-500 transition-colors"
                    >
                        <h3 className="font-bold text-white">Confirm & Start New Chat</h3>
                        <p className="text-sm text-cyan-200 mt-1">You will leave this session and create a new one.</p>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full text-left p-4 bg-slate-700 hover:bg-slate-600/50 rounded-lg border border-slate-600 transition-colors"
                    >
                        <h3 className="font-bold text-white">Cancel</h3>
                        <p className="text-sm text-slate-400 mt-1">Remain in the current session.</p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeSmeModal;
