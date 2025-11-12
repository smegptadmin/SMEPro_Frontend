




import React, { useEffect, useRef, useState, useMemo } from 'react';
import { SearchResult } from '../types';
import SearchResultsModal from './SearchResultsModal';

interface HomePageProps {
  onGetStarted: () => void;
}

const SEARCHABLE_CONTENT: SearchResult[] = [
    { title: "End-to-End Resolution", content: "Tired of AI rabbit holes? SMEPro provides clear, A-to-B solution paths to keep you on task and achieve your goals.", keywords: ["resolution", "solution", "path", "goals", "task"] },
    { title: "Living Context & Search", content: "Your context is never lost. Our AI-augmented search understands your history to provide continuous, actionable insights.", keywords: ["context", "search", "history", "insights", "continuous"] },
    { title: "Precision, Not Overload", content: "Get curated, role-aware responses. We deliver the exact information you need, tailored to your specific workflow.", keywords: ["precision", "curated", "role-aware", "workflow", "tailored"] },
    { title: "SMEPro Solo", content: "Perfect for creators, entrepreneurs, and freelancers. Get expert guidance in areas like music licensing, channel growth, or startup fundraising.", keywords: ["solo", "creators", "entrepreneurs", "freelancers", "guidance"] },
    { title: "SMEPro Business", content: "Equip your organization with deep operational knowledge. Tailored expertise for segments like Finance, HR, R&D, and more.", keywords: ["business", "organization", "teams", "finance", "hr", "r&d"] },
];

const headlines = [
  { main: "The End of AI Guesswork.", highlight: "The Beginning of Actionable Intelligence." },
  { main: "Empowering with AI,", highlight: "Not Replacing." },
  { main: "AI Expertise,", highlight: "Tailored to Your World." },
  { main: "AI That Builds Solutions,", highlight: "Not Just Sentences." }
];

const ProblemCard: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
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

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const sectionsRef = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true); // Start fade out
      setTimeout(() => {
        setHeadlineIndex(prevIndex => (prevIndex + 1) % headlines.length);
        setIsFading(false); // Start fade in
      }, 1000); // Match CSS transition duration
    }, 7000); // Change every 7 seconds (6s visible + 1s transition)

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerCaseQuery = searchQuery.toLowerCase();
    return SEARCHABLE_CONTENT.filter(item => 
        item.title.toLowerCase().includes(lowerCaseQuery) ||
        item.content.toLowerCase().includes(lowerCaseQuery) ||
        item.keywords.some(kw => kw.toLowerCase().includes(lowerCaseQuery))
    );
  }, [searchQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchModalOpen(true);
    }
  };

  return (
    <>
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <header ref={el => { sectionsRef.current[0] = el; }} className="relative pt-40 pb-24 scroll-fade-in-section flex items-center min-h-[90vh]">
          <div className="absolute inset-0 overflow-hidden -z-10 hero-blobs">
            <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-cyan-600/20 rounded-full hero-blob-1"></div>
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-600/20 rounded-full hero-blob-2"></div>
          </div>
          <div className="w-full">
            <h1 className={`text-5xl font-extrabold tracking-tight text-white sm:text-7xl max-w-4xl transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
              {headlines[headlineIndex].main}
              <span className="block text-cyan-400 mt-2">{headlines[headlineIndex].highlight}</span>
            </h1>
            <p className="mt-6 text-lg max-w-2xl text-slate-300">
              SMEPro: The next-gen <span className="font-bold text-cyan-300">SAFE, RESPONSIBLE, and EFFECTIVE</span> Subject Matter Expertise the world has been calling for... It's here.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
               <button
                  onClick={onGetStarted}
                  className="bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 text-lg w-full sm:w-auto"
                >
                  Get Started
                </button>
                <form onSubmit={handleSearch} className="relative w-full sm:w-auto sm:max-w-xs">
                  <input 
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search features..."
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-3 pl-4 pr-10 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                  <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3" aria-label="Search">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-slate-400 hover:text-white"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" /></svg>
                  </button>
                </form>
            </div>
          </div>
        </header>
        
        {/* The Problem Section */}
        <section ref={el => { sectionsRef.current[1] = el; }} className="py-20 scroll-fade-in-section">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">Tired of AI That Just Talks?</h2>
                <p className="mt-4 text-slate-300">Generic AI is powerful, but it comes with critical flaws that hinder real productivity.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <ProblemCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-400"><path fillRule="evenodd" d="M15.312 11.342a1.25 1.25 0 1 1-2.204-1.378c.06-.097.113-.198.154-.308a.75.75 0 0 0-.8-.92c-.289.043-1.111.168-2.22.168-1.108 0-1.93-.125-2.22-.168a.75.75 0 0 0-.8.92c.04.11.094.21.154.308a1.25 1.25 0 1 1-2.204 1.379c-.32-.51-.49-1.099-.49-1.713C4.688 8.01 6.828 6 9.375 6s4.688 2.01 4.688 4.47c0 .613-.17 1.202-.49 1.712a.75.75 0 0 0-1.05-.623 6.63 6.63 0 0 1-1.3-1.428.75.75 0 0 0-1.06 0 6.63 6.63 0 0 1-1.3 1.428.75.75 0 0 0-1.05.623 8.243 8.243 0 0 1 0-1.558 8.243 8.243 0 0 1 0 1.558Z" clipRule="evenodd" /></svg>}
                    title="Endless Rabbit Holes"
                >
                    Generic AI provides oceans of information, leaving you to navigate the currents alone. You get stuck in a cycle of re-phrasing questions instead of moving forward.
                </ProblemCard>
                <ProblemCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-400"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>}
                    title="Inactionable Answers"
                >
                    A 10-page essay on 'marketing strategy' isn't a strategy. It's homework. You're left with raw data, not a clear, step-by-step plan to execute.
                </ProblemCard>
                <ProblemCard
                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-red-400"><path fillRule="evenodd" d="M8.5 3a.5.5 0 0 1 .5.5v2.213a4.502 4.502 0 0 1 2.213 6.587A.5.5 0 0 1 10.5 13H10v1H8.5a.5.5 0 0 1-.5-.5V3.5a.5.5 0 0 1 .5-.5ZM10 11.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" /><path d="M11.5 3.01a6.5 6.5 0 1 0 4.747 11.723.5.5 0 0 1 .746.444v.53a.5.5 0 0 1-.368.484A8 8 0 0 1 2.5 9.5a8 8 0 0 1 8.58-7.962.5.5 0 0 1 .42.472v.5Z" /></svg>}
                    title="Amnesiac AI"
                >
                    Each chat starts from zero. Your goals, past insights, and unique context are forgotten, forcing you to repeat yourself and waste valuable time.
                </ProblemCard>
            </div>
        </section>
        
        {/* The Solution Section */}
        <section ref={el => { sectionsRef.current[2] = el; }} className="py-20 scroll-fade-in-section">
             <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">From Contextual Response to Actionable Knowledge</h2>
                <p className="mt-4 text-slate-300">SMEPro is built on a new paradigm: Intelligence-based AI that provides responsible, accountable empowerment.</p>
            </div>
            <div className="mt-12 space-y-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-1/2">
                        <h3 className="text-2xl font-bold text-cyan-400">1. Accountable Empowerment</h3>
                        <p className="mt-4 text-slate-300">SMEPro's narrowly-trained experts provide responsible, precise guidance. Every response is a focused step towards a defined objective, not just a conversational tangent. This ensures your work is always aligned with a specific, actionable goal.</p>
                    </div>
                    <div className="md:w-1/2 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                        <p className="font-mono text-sm text-slate-400">// SME: Sales & Marketing / Online Retail</p>
                        <p className="mt-2 font-mono text-sm text-cyan-300">[User]: "How do I improve customer retention?"</p>
                        <p className="mt-2 font-mono text-sm text-white">[SMEPro]: "Let's build a Customer Retention Plan. We'll start with Step 1: Analyzing Churn Data..."</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                    <div className="md:w-1/2">
                        <h3 className="text-2xl font-bold text-cyan-400">2. Structured for Action</h3>
                        <p className="mt-4 text-slate-300">We transform conversations into interactive plans, guided sessions, and organized knowledge in your Vault. Information is automatically structured for execution, turning a simple chat into a project management tool.</p>
                    </div>
                    <div className="md:w-1/2 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                        <p className="font-semibold text-white">Guided Session: Q3 Marketing Campaign</p>
                        <p className="text-sm text-slate-300">Objective: Increase Q3 sales by 15%.</p>
                        <ul className="mt-2 space-y-1 text-sm">
                            <li className="text-green-400">[✓] Step 1: Define Target Audience</li>
                            <li className="text-cyan-400">[Active] Step 2: Set Campaign Budget</li>
                            <li className="text-slate-400">[ ] Step 3: Develop Creatives</li>
                        </ul>
                    </div>
                </div>
                 <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-1/2">
                        <h3 className="text-2xl font-bold text-cyan-400">3. Your Living Intelligence</h3>
                        <p className="mt-4 text-slate-300">Your Vault becomes a persistent, SME-augmented brain. SMEPro analyzes your curated knowledge to uncover new strategies and ensure every new session is smarter than the last. It's an SME that grows with you.</p>
                    </div>
                    <div className="md:w-1/2 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
                        <p className="font-mono text-sm text-slate-400">// Analyzing 15 items from your Vault...</p>
                        <p className="mt-2 font-mono text-sm text-white">[User]: "Find a new marketing angle based on my saved research."</p>
                        <p className="mt-2 font-mono text-sm text-cyan-300">[SMEPro]: "Insight: Your data on 'Gen Z' and 'Sustainability' strongly overlap. Proposing a new campaign: 'Eco-Conscious Gen Z Outreach'..."</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section ref={el => { sectionsRef.current[3] = el; }} className="text-center py-20 scroll-fade-in-section">
            <h2 className="text-4xl font-bold">Ready to Move from 'How' to 'Done'?</h2>
            <p className="text-slate-400 max-w-xl mx-auto mt-4">Stop searching and start solving. Your expert AI mentor is waiting.</p>
            <button
                onClick={onGetStarted}
                className="mt-8 bg-cyan-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 text-lg transform hover:scale-105"
            >
                Get Started
            </button>
        </section>

      </div>
    </div>
    {isSearchModalOpen && (
        <SearchResultsModal
            query={searchQuery}
            results={searchResults}
            onClose={() => setIsSearchModalOpen(false)}
        />
    )}
    </>
  );
};

export default HomePage;