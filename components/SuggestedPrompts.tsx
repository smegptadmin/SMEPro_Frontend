import React from 'react';

interface SuggestedPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ prompts, onPromptClick }) => {
  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2 ml-11">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onPromptClick(prompt)}
          className="text-sm px-3 py-1.5 bg-slate-600/50 hover:bg-slate-600 rounded-full text-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default SuggestedPrompts;