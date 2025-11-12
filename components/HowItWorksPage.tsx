import React, { useEffect, useRef } from 'react';

interface HowItWorksPageProps {
  onGetStarted: () => void;
}

const InfoCard: React.FC<{ title: string, children: React.ReactNode, icon: React.ReactElement }> = ({ title, children, icon }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-slate-700 border border-slate-600">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mt-4">{children}</p>
    </div>
);


const PlanDetailCard: React.FC<{ title: string, description: string, useCases: string[] }> = ({ title, description, useCases }) => (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 h-full flex flex-col">
        <h3 className={`text-2xl font-bold ${title.includes('Solo') ? 'text-cyan-400' : 'text-indigo-400'}`}>{title}</h3>
        <p className="text-slate-300 mt-2">{description}</p>
        <div className="border-t border-slate-700 my-6"></div>
        <p className="text-sm font-semibold text-slate-400 uppercase mb-3">Perfect For...</p>
        <ul className="space-y-2 text-sm text-slate-300">
            {useCases.map((item, index) => (
                <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-px"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onGetStarted }) => {
    const sectionsRef = useRef<Array<HTMLElement | null>>([]);
    
    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on page change
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
                       From Information Overload to Actionable Insight
                    </h1>
                    <p className="mt-6 text-lg max-w-3xl mx-auto text-slate-300">
                        Generic AI gives you pages of text. SMEPro gives you a plan. We designed a system to bridge the gap between knowing something and knowing what to do with it.
                    </p>
                </header>

                {/* The Problem Section */}
                <section ref={el => { sectionsRef.current[1] = el; }} className="py-12 scroll-fade-in-section">
                     <h2 className="text-3xl font-bold text-center mb-12">The SMEPro Difference</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InfoCard 
                            title="The Problem with Generic AI"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-400"><path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm14.25 6a.75.75 0 0 1-.22.53l-2.25 2.25a.75.75 0 1 1-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 1 1 1.06-1.06l2.25 2.25c.141.14.22.331.22.53Zm-10.5 0a.75.75 0 0 1-.22.53l-2.25 2.25a.75.75 0 0 1-1.06-1.06L5.44 12 3.72 10.28a.75.75 0 0 1 1.06-1.06l2.25 2.25c.141.14.22.331.22.53Z" clipRule="evenodd" /></svg>}
                        >
                            Standard AI tools are impressive, but they often leave you with a wall of text, forcing you to do the hard work of extracting key information, creating a plan, and deciding on next steps. This leads to "AI fatigue" and inaction.
                        </InfoCard>
                         <InfoCard 
                            title="The SMEPro Solution"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-cyan-400"><path fillRule="evenodd" d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06L7.69 11.5l-1.47-1.47a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 0 0 1.06l1.47 1.47-1.47 1.47a.75.75 0 1 0 1.06 1.06l2.25-2.25a.75.75 0 0 0 0-1.06l-2.25-2.25a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" /></svg>}
                        >
                            SMEPro is built around action. By understanding your specific industry and role, it provides structured outputs like guided project plans, interactive strategy options, and curated data, moving you directly from question to execution.
                        </InfoCard>
                    </div>
                </section>

                {/* Plans Section */}
                <section id="plans" ref={el => { sectionsRef.current[2] = el; }} className="py-12 scroll-fade-in-section">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">Two Paths to Expertise</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto mt-4">Whether you're building a brand or running a business unit, SMEPro has a plan tailored to your world.</p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PlanDetailCard 
                            title="SMEPro Solo"
                            description="For the individual professional, creator, or entrepreneur. Get an expert co-pilot for your personal and professional projects."
                            useCases={[
                                "Developing a business plan for a new startup.",
                                "Outlining and writing an online course.",
                                "Creating a content strategy for a YouTube channel.",
                                "Navigating music licensing and distribution.",
                                "Building a personal brand as a freelancer."
                            ]}
                        />
                        <PlanDetailCard 
                            title="SMEPro Business"
                            description="For teams and organizations. Embed specialized knowledge into your workflows and enhance collaboration."
                            useCases={[
                                "Onboarding new hires with role-specific guides.",
                                "Drafting a Q3 marketing strategy with the sales team.",
                                "Generating a compliance checklist for a new product.",
                                "Creating R&D project plans and timelines.",
                                "Analyzing financial data for a board presentation."
                            ]}
                        />
                    </div>
                </section>

                {/* Final CTA */}
                <section ref={el => { sectionsRef.current[3] = el; }} className="text-center py-20 scroll-fade-in-section">
                    <h2 className="text-4xl font-bold">Ready to Build With an Expert?</h2>
                    <p className="text-slate-400 max-w-xl mx-auto mt-4">Choose your path and let SMEPro help you build, create, and solve with precision.</p>
                    <button
                        onClick={onGetStarted}
                        className="mt-8 bg-cyan-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 text-lg transform hover:scale-105"
                    >
                        Get Started
                    </button>
                </section>
            </div>
        </div>
    );
};

export default HowItWorksPage;
