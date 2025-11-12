import React from 'react';
import { GuidedSessionData, Step } from '../types';

interface GuidedSessionProps {
  data: GuidedSessionData;
  messageIndex: number;
  onStepSelect: (messageIndex: number, stepIndex: number) => void;
  onStepComplete: (messageIndex: number, stepIndex: number) => void;
}

const statusStyles = {
    pending: {
        ring: 'ring-slate-500',
        text: 'text-slate-300',
        iconBg: 'bg-slate-500',
        line: 'border-slate-600',
    },
    active: {
        ring: 'ring-cyan-500',
        text: 'text-white',
        iconBg: 'bg-cyan-500',
        line: 'border-slate-600',
    },
    complete: {
        ring: 'ring-green-500',
        text: 'text-slate-400 line-through',
        iconBg: 'bg-green-500',
        line: 'border-green-600',
    }
}

const StepIcon: React.FC<{ status: Step['status'], index: number }> = ({ status, index }) => {
    const styles = statusStyles[status];
    return (
        <div className={`relative w-8 h-8 ${styles.iconBg} rounded-full flex items-center justify-center ring-4 ${styles.ring} z-10`}>
            {status === 'complete' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-800">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
            ) : (
                <span className="font-bold text-sm text-slate-800">{index + 1}</span>
            )}
        </div>
    );
};


const GuidedSession: React.FC<GuidedSessionProps> = ({ data, messageIndex, onStepSelect, onStepComplete }) => {
  const completedSteps = data.steps.filter(step => step.status === 'complete').length;
  const totalSteps = data.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="space-y-4 p-2">
      <div>
        <h3 className="text-xl font-bold text-white">{data.title}</h3>
        <p className="text-sm text-slate-300 mt-1">{data.objective}</p>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-400">Progress</span>
            <span className="text-xs font-bold text-white">{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2">
            <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercentage}%` }}
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
                aria-label="Guided session progress"
            ></div>
        </div>
      </div>
      
      <div className="relative pt-4">
        {data.steps.map((step, index) => (
          <div key={index} className="relative flex items-start pb-8">
            {/* Vertical line */}
            {index < data.steps.length - 1 && (
                <div className={`absolute left-4 top-5 h-full w-0.5 ${statusStyles[data.steps[index+1].status === 'complete' ? 'complete' : 'pending'].line}`} />
            )}
            
            <div className="flex-shrink-0 mr-4">
                <StepIcon status={step.status} index={index} />
            </div>

            <div className="flex-grow pt-1">
                <button 
                    onClick={() => onStepSelect(messageIndex, index)}
                    className={`text-left w-full`}
                >
                    <h4 className={`font-semibold ${statusStyles[step.status].text}`}>
                        {step.title}
                    </h4>
                    <p className={`text-sm mt-1 ${step.status === 'complete' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {step.description}
                    </p>
                </button>
                {step.status === 'active' && (
                    <button 
                        onClick={() => onStepComplete(messageIndex, index)}
                        className="mt-3 text-xs font-semibold bg-slate-600 hover:bg-green-600 text-white py-1 px-3 rounded-full transition-colors flex items-center gap-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" /></svg>
                        Mark as Complete
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuidedSession;