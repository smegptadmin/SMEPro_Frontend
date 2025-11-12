import React, { useEffect, useRef } from 'react';

interface FeaturesPageProps {
  onGetStarted: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-cyan-500 hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-slate-700 border border-slate-600 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{children}</p>
  </div>
);

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onGetStarted }) => {
    const sectionsRef = useRef<Array<HTMLElement | null>>([]);
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const currentSections = sectionsRef.current.filter(Boolean);
        currentSections.forEach((section) => {
            if (section) observer.observe(section);
        });
        
        return () => {
            currentSections.forEach((section) => {
                if (section) observer.unobserve(section);
            });
        };
    }, []);

    return (
        <div className="min-h-screen pt-20 text-white bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <header ref={el => { sectionsRef.current[0] = el; }} className="text-center py-20 scroll-fade-in-section">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                        A Toolset for <span className="text-cyan-400">Clarity and Action</span>
                    </h1>
                    <p className="mt-6 text-lg max-w-2xl mx-auto text-slate-300">
                        SMEPro is more than just a chatbot. It's an integrated workspace designed to turn your complex challenges into structured, actionable solutions.
                    </p>
                </header>

                {/* Features Grid */}
                <section ref={el => { sectionsRef.current[1] = el; }} className="py-12 scroll-fade-in-section">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400"><path fillRule="evenodd" d="M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L18.88 8.25H15a.75.75 0 0 1 0-1.5h3.88l-2.91-2.91a.75.75 0 0 1 0-1.06ZM8.03 12.53a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 1 1 1.06 1.06L5.12 6.75H9a.75.75 0 0 1 0 1.5H5.12l2.91 2.91a.75.75 0 0 1 0 1.06Zm-.53 8.47a.75.75 0 0 1 0-1.06l2.91-2.91H6a.75.75 0 0 1 0-1.5h3.88l-2.91-2.91a.75.75 0 1 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0Zm9.97-1.06a.75.75 0 1 1-1.06 1.06l-2.91-2.91H15a.75.75 0 0 1 0 1.5h-3.88l2.91 2.91a.75.75 0 0 1 1.06 1.06Z" clipRule="evenodd" /></svg>}
                            title="Guided Sessions"
                        >
                            Transform broad questions into step-by-step plans. The SME acts as a mentor, guiding you through tasks, projects, and strategies to ensure you reach a concrete outcome.
                        </FeatureCard>
                        <FeatureCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400"><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a.375.375 0 0 1-.375-.375V6.75A3.75 3.75 0 0 0 10.5 3H5.625Z" /><path d="M12.971 1.816A5.23 5.23 0 0 1 15.75 3v3.75a2.25 2.25 0 0 1-2.25 2.25h-1.5a.75.75 0 0 1-.75-.75V3a.75.75 0 0 1 .75-.75h1.5c.355 0 .694.085.99.233.15.076.312.14.471.192Z" /></svg>}
                            title="SMEPro Vault & Analysis"
                        >
                            Save key insights, plans, and data to your personal knowledge base. Our SME can then analyze your curated Vault to synthesize new strategies and find connections you might have missed.
                        </FeatureCard>
                        <FeatureCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400"><path d="M4.5 6.375a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75ZM4.5 12.375a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75ZM4.5 18.375a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Z" /><path fillRule="evenodd" d="M18.685 6.166a.75.75 0 0 1 .633-.033l1.5  .833a.75.75 0 0 1 0 1.301l-1.5 .834a.75.75 0 0 1-.633-.033V6.166Zm-1.87-1.039a.75.75 0 0 1 .316-.634l1.5-1a.75.75 0 0 1 .949.535l.25 1.001a.75.75 0 0 1-.316.634v0l-1.5 1a.75.75 0 0 1-.949-.535l-.25-1.001Zm1.87 11.039a.75.75 0 0 1-.316.634l-1.5 1a.75.75 0 0 1-.949-.535l-.25-1.001a.75.75 0 0 1 .316-.634v0l1.5-1a.75.75 0 0 1 .949.535l.25 1.001Z" clipRule="evenodd" /></svg>}
                            title="Collaborative Workspace"
                        >
                            Share a session with a unique link. Team members can join, chat with the AI, and contribute to the solution in real-time, creating a single source of truth for your projects.
                        </FeatureCard>
                        <FeatureCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>}
                            title="Narrowly-Trained Experts"
                        >
                            Choose from dozens of specialized industries and organizational roles. You're not talking to a generic AI; you're conversing with an expert trained on your specific context.
                        </FeatureCard>
                         <FeatureCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400"><path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v1.286a.75.75 0 0 0 .75.75h2.25a.75.75 0 0 0 .75-.75V5.25a7.23 7.23 0 0 1 5.25-2.22.75.75 0 0 0-.75-.5ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v1.286a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1-.75-.75V5.25a7.23 7.23 0 0 0-5.25-2.22.75.75 0 0 1 .75-.5Z" /><path fillRule="evenodd" d="M12 21a8.25 8.25 0 0 0 8.25-8.25c0-4.405-3.13-8.02-7.247-8.241a.75.75 0 0 0-.503.74V15.75a.75.75 0 0 0 .75.75h3a.75.75 0 0 0 .75-.75V9.366a.75.75 0 0 0-1.42-.358l-1.03 2.06A.75.75 0 0 1 12 11.25H9.75a.75.75 0 0 1 0-1.5h1.564l1.03-2.06a.75.75 0 0 0-1.42-.358v0c-4.116.22-7.247 3.836-7.247 8.241A8.25 8.25 0 0 0 12 21Z" clipRule="evenodd" /></svg>}
                            title="Verified Sources Mode"
                        >
                           For research-heavy tasks, switch to Verified Sources mode. The SME uses Google Search to provide answers backed by citable, authoritative web sources, ensuring accuracy and reliability.
                        </FeatureCard>
                        <FeatureCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400"><path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" /><path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" /></svg>}
                            title="OpenAI Importer"
                        >
                            Don't lose your history. Import your existing ChatGPT conversations, and SMEPro will automatically analyze, summarize, and categorize them into your Vault for immediate use.
                        </FeatureCard>
                    </div>
                </section>
                
                {/* Final CTA */}
                <section ref={el => { sectionsRef.current[2] = el; }} className="text-center py-20 scroll-fade-in-section">
                    <h2 className="text-4xl font-bold">Ready to Empower Your Expertise?</h2>
                    <p className="text-slate-400 max-w-xl mx-auto mt-4">Stop searching and start solving. Your expert AI mentor is waiting.</p>
                    <button
                        onClick={onGetStarted}
                        className="mt-8 bg-cyan-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 text-lg transform hover:scale-105"
                    >
                        Start Your Free Trial
                    </button>
                </section>
            </div>
        </div>
    );
};

export default FeaturesPage;