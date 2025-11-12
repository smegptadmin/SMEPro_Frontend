import React, { useState, useEffect } from 'react';

interface LockoutWarningModalProps {
  endTime: number;
}

const LockoutWarningModal: React.FC<LockoutWarningModalProps> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState(Math.round((endTime - Date.now()) / 1000));

    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeLeft = Math.round((endTime - Date.now()) / 1000);
            if (newTimeLeft > 0) {
                setTimeLeft(newTimeLeft);
            } else {
                setTimeLeft(0);
                clearInterval(interval);
                // Optionally, refresh the page to allow access again
                window.location.reload();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-red-500 shadow-2xl shadow-red-500/20 w-full max-w-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-red-400"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-white">Access Temporarily Suspended</h2>
                <p className="text-slate-300 mt-4">
                    Due to repeated violations of our acceptable use policy, your access to SMEPro has been locked for a brief period. This is a standard security measure to ensure a safe environment for all users.
                </p>
                <div className="mt-6">
                    <p className="text-slate-400">You can resume your session in:</p>
                    <p className="text-4xl font-mono font-bold text-cyan-400 mt-2">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LockoutWarningModal;