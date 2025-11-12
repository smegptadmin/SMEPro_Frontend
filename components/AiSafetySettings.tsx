import React, { useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { FlaggedPrompt } from '../types';

const AiSafetySettings: React.FC = () => {
    const [keywords, setKeywords] = useState<string[]>([]);
    const [flaggedPrompts, setFlaggedPrompts] = useState<FlaggedPrompt[]>([]);
    const [newKeyword, setNewKeyword] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        const [fetchedKeywords, fetchedPrompts] = await Promise.all([
            backend.fetchSafetyKeywords(),
            backend.fetchFlaggedPrompts()
        ]);
        setKeywords(fetchedKeywords);
        setFlaggedPrompts(fetchedPrompts.sort((a, b) => b.timestamp - a.timestamp));
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddKeyword = async () => {
        if (newKeyword.trim() && !keywords.map(k => k.toLowerCase()).includes(newKeyword.trim().toLowerCase())) {
            const updatedKeywords = [...keywords, newKeyword.trim()];
            await backend.saveSafetyKeywords(updatedKeywords);
            setKeywords(updatedKeywords);
            setNewKeyword('');
        }
    };
    
    const handleDeleteKeyword = async (keywordToDelete: string) => {
        const updatedKeywords = keywords.filter(k => k !== keywordToDelete);
        await backend.saveSafetyKeywords(updatedKeywords);
        setKeywords(updatedKeywords);
    };

    const getActionColor = (action: 'warn' | 'lockout') => {
        return action === 'lockout' ? 'text-red-400' : 'text-amber-400';
    }

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl">
            <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 my-4 bg-slate-800 rounded-r-lg">
                <p className="text-slate-300 italic">"SMEPro responses are just as much accountable as they are actionable... Ensure that your intentions embrace SMEPro's core objective for providing SAFE, RESPONSIBLE, and EFFECTIVE Subject Matter Expertise."</p>
            </blockquote>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Monitored Keywords */}
                <div>
                    <h4 className="font-semibold text-slate-200 mb-3">Monitored Keywords</h4>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="Add a new keyword..."
                            className="w-full p-2 bg-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                        />
                        <button onClick={handleAddKeyword} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Add</button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {isLoading ? <p className="text-slate-400 text-sm">Loading keywords...</p> : 
                        keywords.map(kw => (
                            <div key={kw} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-md">
                                <span className="text-sm text-slate-300">{kw}</span>
                                <button onClick={() => handleDeleteKeyword(kw)} className="text-slate-500 hover:text-red-400">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Flagged Prompt History */}
                <div>
                    <h4 className="font-semibold text-slate-200 mb-3">Security Event Log</h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-2 border border-slate-700 rounded-lg p-2 bg-slate-900/50">
                        {isLoading ? <p className="text-slate-400 text-sm">Loading history...</p> :
                        flaggedPrompts.length > 0 ? flaggedPrompts.map(p => (
                            <div key={p.id} className="bg-slate-800/70 p-2 rounded-md">
                                <p className="text-sm text-slate-300 truncate" title={p.prompt}><span className="font-semibold">Prompt:</span> "{p.prompt}"</p>
                                <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                                    <span>Trigger: <span className={`font-semibold ${p.detectionMethod === 'ai' ? 'text-cyan-400' : 'text-amber-400'}`}>{p.detectionMethod === 'keyword' ? p.details : 'AI Analysis'}</span></span>
                                    <span className={`font-bold uppercase ${getActionColor(p.actionTaken)}`}>{p.actionTaken}</span>
                                    <span>{new Date(p.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm text-center py-4">No security events have been logged.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiSafetySettings;