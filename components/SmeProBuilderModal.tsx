import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';

interface SmeProBuilderModalProps {
  context: string;
  onClose: () => void;
  onSaveToVault: (content: string, title: string) => Promise<void>;
}

type BuildType = 'plan' | 'document' | 'outline' | 'email' | 'requirements' | 'checklist' | 'code';

const allBuildOptions: { type: BuildType, label: string, prompt: string }[] = [
    { type: 'plan', label: 'Create Project Plan', prompt: 'Create a detailed, actionable project plan based on the following objective. Use markdown for structure, including sections for goals, phases, key tasks, and timelines.' },
    { type: 'document', label: 'Draft Strategy Document', prompt: 'Draft a professional strategy document based on the following concept. Use clear headings, bullet points, and a formal tone.' },
    { type: 'outline', label: 'Generate Presentation Outline', prompt: 'Generate a presentation outline for the following topic. Create a list of slides with a title and key bullet points for each.' },
    { type: 'email', label: 'Draft an Email', prompt: 'Draft a professional email to stakeholders regarding the following subject. Include a clear subject line, introduction, key points, and a call to action.' },
    { type: 'requirements', label: 'Create Requirements', prompt: 'Generate a formal list of requirements (functional and non-functional) for the following project/feature. Use a structured format like user stories or a numbered list.' },
    { type: 'checklist', label: 'Create Checklist', prompt: 'Create a simple, actionable checklist for the following task or process. Use markdown task list format (e.g., "- [ ] Item").' },
    { type: 'code', label: 'Generate Code', prompt: 'Generate a functional code snippet for the following technical requirement. Infer the programming language from the context if not specified. Include comments to explain the code and wrap the code in a markdown code block.' },
];

const TECHNICAL_KEYWORDS = ['application', 'component', 'api', 'database', 'code', 'function', 'script', 'software', 'algorithm', 'backend', 'frontend', 'server', 'client', 'query', 'endpoint'];

const SmeProBuilderModal: React.FC<SmeProBuilderModalProps> = ({ context, onClose, onSaveToVault }) => {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeBuildType, setActiveBuildType] = useState<BuildType | null>(null);

  const availableBuildOptions = useMemo(() => {
    const isTechnical = TECHNICAL_KEYWORDS.some(keyword => context.toLowerCase().includes(keyword));
    if (isTechnical) {
        return allBuildOptions;
    }
    return allBuildOptions.filter(opt => opt.type !== 'code');
  }, [context]);

  const handleBuild = async (option: typeof allBuildOptions[0]) => {
    setIsLoading(true);
    setResult('');
    setError(null);
    setCopied(false);
    setActiveBuildType(option.type);

    try {
        if (!process.env.API_KEY) throw new Error("API_KEY not set.");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = {
            text: `${option.prompt}\n\nObjective/Topic: "${context}"`
        };

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [systemInstruction] }],
        });

        for await (const chunk of responseStream) {
            setResult(prev => prev + chunk.text);
        }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(`Build failed: ${errorMessage}`);
        setResult(`Sorry, an error occurred. ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(result).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleSave = async () => {
    if (!result || isLoading || isSaving) return;
    setIsSaving(true);
    try {
      await onSaveToVault(result, context);
    } catch (e) {
      console.error("Save to vault failed from modal", e);
      setError("Failed to save to Vault.");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-3xl p-6 flex flex-col max-h-[90vh]">
        <header className="flex-shrink-0 mb-4">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-white">SMEPro Builder</h2>
                <p className="text-slate-400 text-sm mt-1">
                    Building from: <span className="font-semibold text-cyan-400">"{context}"</span>
                </p>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {availableBuildOptions.map(opt => (
                <button 
                  key={opt.type} 
                  onClick={() => handleBuild(opt)} 
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    ${activeBuildType === opt.type 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                    }
                  `}
                  disabled={isLoading || isSaving}
                >
                    {opt.label}
                </button>
            ))}
          </div>
        </header>
        
        <main className="flex-grow overflow-y-auto bg-slate-900/50 rounded-lg p-4 my-4 relative min-h-[200px]">
            {isLoading && !result && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <div className="w-8 h-8 border-4 border-t-cyan-500 border-slate-600 rounded-full animate-spin mx-auto mb-3"></div>
                        <p>Building...</p>
                    </div>
                </div>
            )}
            {!activeBuildType && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-500">Select a build option above to begin.</p>
              </div>
            )}
            <div className="prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3" dangerouslySetInnerHTML={{ __html: marked(result + (isLoading ? ' <span class="blinking-cursor">|</span>' : '')) as string }} />
        </main>
        
        <footer className="flex-shrink-0 flex justify-end items-center gap-4">
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
                onClick={handleSave}
                disabled={!result || isLoading || isSaving}
                className="bg-green-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-slate-600 flex items-center gap-2"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-t-white border-transparent rounded-full animate-spin"></div>}
              {isSaving ? 'Saving...' : 'Save to Vault'}
            </button>
            <button
                onClick={handleCopyToClipboard}
                disabled={!result || isLoading || isSaving}
                className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-slate-600"
            >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default SmeProBuilderModal;