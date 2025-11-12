import React from 'react';
import { ActionTypeResponseData } from '../types';

interface ActionTypeResponseProps {
  data: ActionTypeResponseData;
  onItemClick: (prompt: string, title: string) => void;
}

const ActionTypeResponse: React.FC<ActionTypeResponseProps> = ({ data, onItemClick }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-300">Selected Topic: <span className="text-cyan-400">{data.topic}</span></h3>
        <p className="text-sm text-slate-400 mt-1">{data.introduction}</p>
      </div>
      <div className="space-y-2">
        {data.actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onItemClick(action.followUpPrompt, action.title)}
            className="text-left p-3 bg-slate-600/50 hover:bg-slate-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full"
            aria-label={`Select action: ${action.title}`}
          >
            <h4 className="font-bold text-cyan-400">{action.title}</h4>
            <p className="text-sm text-slate-300 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionTypeResponse;