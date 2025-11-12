import React, { useState } from 'react';
import { SmeSuggestionData, SmeConfig } from '../types';

interface SmeSuggestionProps {
  data: SmeSuggestionData;
  onActivate: (config: SmeConfig) => void;
}

const SmeSuggestion: React.FC<SmeSuggestionProps> = ({ data, onActivate }) => {
  const [choice, setChoice] = useState<'pending' | 'yes' | 'no'>('pending');

  const handleYes = () => {
    onActivate(data.suggestedSme);
    setChoice('yes');
  };

  const handleNo = () => {
    setChoice('no');
  };

  const renderActionArea = () => {
    if (choice === 'yes') {
      return <p className="text-sm text-center font-semibold text-green-400 mt-4">Expert added to the session.</p>;
    }
    if (choice === 'no') {
      return <p className="text-sm text-center font-semibold text-slate-400 mt-4">Suggestion dismissed.</p>;
    }
    return (
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleNo}
          className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500 transition-colors"
        >
          No, Thanks
        </button>
        <button
          onClick={handleYes}
          className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 transition-colors"
        >
          Yes, Add Expert
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 bg-slate-600/50 border border-cyan-700/50 rounded-lg">
      <p className="text-sm text-white font-semibold">
        Would you like me to add the recommended SME to this session?
      </p>
      <div className="mt-3 p-3 bg-slate-700/50 rounded-md border border-slate-600">
          <p className="text-xs text-slate-400 font-semibold uppercase">Recommendation</p>
          <p className="font-semibold text-cyan-400 mt-1">{data.suggestedSme.segment}</p>
          <p className="text-sm text-slate-300 mt-2">
              <span className="font-semibold">Reasoning:</span> {data.reasoning}
          </p>
      </div>
      {renderActionArea()}
    </div>
  );
};

export default SmeSuggestion;