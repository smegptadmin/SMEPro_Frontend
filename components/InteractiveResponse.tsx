import React from 'react';
import { marked } from 'marked';
import { InteractiveResponseData } from '../types';

interface InteractiveResponseProps {
  data: InteractiveResponseData;
  onItemClick: (prompt: string, title: string) => void;
}

const InteractiveResponse: React.FC<InteractiveResponseProps> = ({ data, onItemClick }) => {
  return (
    <div className="space-y-3">
      <div 
        className="prose prose-invert prose-sm max-w-none" 
        dangerouslySetInnerHTML={{ __html: marked(data.introduction) as string }} 
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.items.map((item, index) => (
          <button
            key={index}
            onClick={() => onItemClick(item.followUpPrompt, item.title)}
            className="text-left p-3 bg-slate-600/50 hover:bg-slate-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full"
            aria-label={`Learn more about ${item.title}`}
          >
            <h4 className="font-bold text-cyan-400">{item.title}</h4>
            <p className="text-sm text-slate-300 mt-1">{item.summary}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InteractiveResponse;