import React, { useEffect, useRef } from 'react';

interface SafeAiPageProps {
  onGetStarted: () => void;
}

const FeaturePillar: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-700">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    <p className="text-slate-400 text-sm leading-relaxed mt-4">{children}</p>
  </div>
);

const SafeAiPage: React.FC<SafeAiPageProps> = ({ onGetStarted }) => {
    const sectionsRef = useRef<Array<HTMLElement | null>>([]);
    
    useEffect(() => {
        window.scrollTo(0, 0);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const currentSections = sectionsRef.current.filter(Boolean);
        currentSections.forEach((section) => { if (section) observer.observe(section); });
        
        return () => { currentSections.forEach((section) => { if (section) observer.unobserve(section); }); };
    }, []);

    return (
        <div className="min-h-screen pt-20 text-white bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header ref={el => { sectionsRef.current[0] = el; }} className="text-center py-20 scroll-fade-in-section">
                    <div className="inline-flex items-center gap-3 bg-cyan-900/50 text-cyan-300 font-semibold px-4 py-2 rounded-full border border-cyan-800">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM8.5 4.134a.75.75 0 0 1 .866-.5A6.5 6.5 0 0 1 18.366 12a.75.75 0 0 1-1.498.088 5 5 0 0 0-9.736-2.22.75.75 0 0 1 .434-1.392Z" clipRule="evenodd" /><path d="M3.293 4.293a.75.75 0 0 1 1.06 0l10 10a.75.75 0 0 1-1.06 1.06l-10-10a.75.75 0 0 1 0-1.06Z" /></svg>
                        SMEPro SAFE AI
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mt-4">
                       Intelligence with Integrity
                    </h1>
                    <p className="mt-6 text-lg max-w-3xl mx-auto text-slate-300">
                        The power of expert AI demands a new standard of safety. SMEPro integrates a multi-layered, AI-augmented safety system to ensure every interaction is responsible, productive, and secure.
                    </p>
                </header>

                <section ref={el => { sectionsRef.current[1] = el; }} className="py-12 scroll-fade-in-section">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl">The Problem with Unchecked AI</h2>
                        <p className="mt-4 text-slate-300">Recent events have shown that even the most advanced AI models can be manipulated or generate harmful content. Relying on generic safety filters is not enough when dealing with expert-level knowledge that could be misused.</p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="bg-slate-800/50 p-6 rounded-xl border border-red-700">
                            <h3 className="text-lg font-bold text-red-400">The Generic Risk</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mt-2">Generic models can inadvertently provide instructions for dangerous activities, generate biased or misleading information, or be tricked into bypassing their own safety protocols through clever "prompt injection" attacks.</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-cyan-700">
                            <h3 className="text-lg font-bold text-cyan-400">The SMEPro Approach</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mt-2">SMEPro's SAFE AI doesn't just filter; it understands context. It uses AI to analyze intent, detect subtle patterns of misuse, and actively guides users away from harmful paths toward productive outcomes.</p>
                        </div>
                    </div>
                </section>

                <section ref={el => { sectionsRef.current[2] = el; }} className="py-12 scroll-fade-in-section">
                     <h2 className="text-3xl font-bold text-center mb-12">Our Multi-Layered Safety System</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeaturePillar
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-cyan-400"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" /></svg>}
                            title="AI-Augmented Detection"
                        >
                            Our system uses a dedicated Gemini model to analyze the *intent* behind a prompt, not just keywords. It identifies potential misuse, manipulation, and harmful requests with a high degree of contextual accuracy.
                        </FeaturePillar>
                        <FeaturePillar
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-cyan-400"><path d="M10 2a.75.75 0 0 1 .75.75v.518a9 9 0 0 1 6.368 6.368h.518a.75.75 0 0 1 0 1.5h-.518a9 9 0 0 1-6.368 6.368v.518a.75.75 0 0 1-1.5 0v-.518a9 9 0 0 1-6.368-6.368H2a.75.75 0 0 1 0-1.5h.518A9 9 0 0 1 8.886 3.268V2.75A.75.75 0 0 1 10 2ZM11.5 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>}
                            title="Intelligent User Guidance"
                        >
                            When a potential issue is detected, we don't just block it. SMEPro provides immediate feedback, explains the concern, and offers safe, productive alternatives, pivoting the user away from harmful territory.
                        </FeaturePillar>
                        <FeaturePillar
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-cyan-400"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" /></svg>}
                            title="Proactive Escalation"
                        >
                            Our system is designed to prevent repeated attempts at misuse. After an initial warning, continued violations trigger a temporary account lockout, ensuring the integrity of the platform and the safety of its users. All events are logged for auditing.
                        </FeaturePillar>
                    </div>
                </section>
                
                <section ref={el => { sectionsRef.current[3] = el; }} className="text-center py-20 scroll-fade-in-section">
                    <h2 className="text-4xl font-bold">Safe, Responsible, Effective.</h2>
                    <p className="text-slate-400 max-w-xl mx-auto mt-4">Experience the power of expert-level AI within a framework you can trust.</p>
                    <button
                        onClick={onGetStarted}
                        className="mt-8 bg-cyan-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 text-lg transform hover:scale-105"
                    >
                        Get Started with SMEPro
                    </button>
                </section>
            </div>
        </div>
    );
};

export default SafeAiPage;