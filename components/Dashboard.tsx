import React, { useState, useEffect } from 'react';
import { ChatSession, VaultItem } from '../types';
import { backend } from '../services/backend';
import AiSafetySettings from './AiSafetySettings';

interface DashboardProps {
  onClose: () => void;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const COLORS = [
  '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
  '#0284c7', '#0369a1', '#075985', '#0c4a6e',
];

const BarChart: React.FC<{ title: string; data: ChartData[] }> = ({ title, data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {data.length > 0 ? data.map((item, index) => (
          <div key={index} className="flex items-center group">
            <div className="w-1/3 text-sm text-slate-300 truncate pr-2" title={item.label}>{item.label}</div>
            <div className="w-2/3 bg-slate-700 rounded-full h-6 relative chart-bar-wrapper">
              <div 
                className="chart-bar h-6 rounded-full flex items-center justify-end px-2"
                style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color }}
              >
                <span className="font-bold text-xs text-white drop-shadow-md">{item.value}</span>
              </div>
              <div className="bar-tooltip absolute left-0 bottom-full mb-2 w-auto p-2 text-xs text-white bg-slate-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {item.label}: {item.value}
              </div>
            </div>
          </div>
        )) : (
          <p className="text-sm text-slate-500 text-center py-4">No data available for this chart.</p>
        )}
      </div>
    </div>
  );
};

const RecentSessions: React.FC<{ sessions: ChatSession[] }> = ({ sessions }) => {
    const sortedSessions = [...sessions].sort((a, b) => b.lastModified - a.lastModified).slice(0, 5);

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Recent Sessions</h3>
            <div className="space-y-3">
                {sortedSessions.length > 0 ? sortedSessions.map((session, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-700/50 transition-colors">
                        <div className="truncate">
                            <p className="text-white font-medium truncate" title={session.title || session.smeConfigs[0]?.segment}>{session.title || session.smeConfigs[0]?.segment}</p>
                            <p className="text-slate-400 text-xs truncate">{session.smeConfigs[0]?.industry}</p>
                        </div>
                        <span className="text-slate-500 text-xs flex-shrink-0 ml-2">
                            {new Date(session.lastModified).toLocaleDateString()}
                        </span>
                    </div>
                )) : (
                    <p className="text-sm text-slate-500 text-center py-4">No recent sessions found.</p>
                )}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const [stats, setStats] = useState({ sessionCount: 0, vaultItemCount: 0 });
  const [vaultByCategory, setVaultByCategory] = useState<ChartData[]>([]);
  const [sessionsByIndustry, setSessionsByIndustry] = useState<ChartData[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Fetch Vault Items
      const vaultItems = await backend.fetchVaultItems();

      // Fetch Chat Sessions from LocalStorage
      const chatSessions: ChatSession[] = [];
      const chatKeyRegex = /^chatMessages_(.+)_(.+)_(.+)$/;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chatMessages_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const session = JSON.parse(raw);
              // Ensure it looks like a session object to avoid errors with other keys
              if (session.sessionId && session.messages) {
                chatSessions.push(session);
              }
            } catch (e) {
              console.error('Failed to parse session from localStorage', e);
            }
          }
        }
      }
      
      setSessions(chatSessions);

      setStats({
          sessionCount: chatSessions.length,
          vaultItemCount: vaultItems.length
      });

      // Process Vault Data
      const categoryCounts = vaultItems.reduce((acc, item) => {
          const category = item.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      setVaultByCategory(Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([label, value], index) => ({
            label,
            value,
            color: COLORS[index % COLORS.length]
        }))
      );
      
      // Process Session Data
      const industryCounts = chatSessions.reduce((acc, session) => {
          const industry = session.smeConfigs[0]?.industry || 'N/A';
          acc[industry] = (acc[industry] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      setSessionsByIndustry(Object.entries(industryCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([label, value], index) => ({
            label,
            value,
            color: COLORS[index % COLORS.length]
        }))
      );
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="h-full flex flex-col p-4 bg-slate-800 rounded-2xl">
      <header className="flex justify-between items-center mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </header>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
            <div className="w-10 h-10 border-4 border-t-cyan-500 border-slate-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="stat-card bg-slate-700/50 p-6 rounded-xl border border-slate-700 text-center">
              <h2 className="text-4xl font-bold text-cyan-400">{stats.sessionCount}</h2>
              <p className="text-slate-400 mt-1">Total Chat Sessions</p>
            </div>
            <div className="stat-card bg-slate-700/50 p-6 rounded-xl border border-slate-700 text-center">
              <h2 className="text-4xl font-bold text-cyan-400">{stats.vaultItemCount}</h2>
              <p className="text-slate-400 mt-1">Saved Vault Items</p>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <BarChart title="Vault Items by Category" data={vaultByCategory} />
            <RecentSessions sessions={sessions} />
          </div>
           <BarChart title="Sessions by Industry" data={sessionsByIndustry} />

           <div className="xl:col-span-2">
            <AiSafetySettings />
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;