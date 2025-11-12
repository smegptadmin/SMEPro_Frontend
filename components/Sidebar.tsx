
import React, { useState, useEffect, useMemo } from 'react';
import { ChatSession, VaultItem } from '../types';
import { collaborationService } from '../services/collaboration_service';
import { backend } from '../services/backend';

interface SidebarProps {
  isOpen: boolean;
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentSessionId, onSelectSession, onNewChat, onDeleteSession }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [allSessions, allVaultItems] = await Promise.all([
        collaborationService.getAllSessions(),
        backend.fetchVaultItems()
      ]);
      setSessions(allSessions);
      setVaultItems(allVaultItems);
    };
    fetchData();
  }, [currentSessionId]); // Refetch when session changes to update list and vault items

  const sessionTree = useMemo(() => {
    const vaultItemsBySessionId = new Map<string, VaultItem[]>();
    vaultItems.forEach(item => {
        if (item.sourceSessionId) {
            if (!vaultItemsBySessionId.has(item.sourceSessionId)) {
                vaultItemsBySessionId.set(item.sourceSessionId, []);
            }
            vaultItemsBySessionId.get(item.sourceSessionId)!.push(item);
        }
    });

    vaultItemsBySessionId.forEach((items) => {
        items.sort((a, b) => a.savedAt - b.savedAt);
    });

    return sessions.map(session => ({
        ...session,
        vaultChildren: vaultItemsBySessionId.get(session.sessionId) || []
    }));
  }, [sessions, vaultItems]);
  
  const handleConfirmDelete = async () => {
    if (deletingSessionId) {
      await collaborationService.deleteSession(deletingSessionId);
      onDeleteSession(deletingSessionId);
      setSessions(sessions.filter(s => s.sessionId !== deletingSessionId));
      setDeletingSessionId(null);
    }
  };


  return (
    <aside className={`flex-shrink-0 bg-slate-900/50 border-r border-slate-700 flex flex-col p-3 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 p-0 overflow-hidden'}`}>
      <button
        onClick={onNewChat}
        className="w-full flex items-center justify-between text-left p-2.5 mb-4 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition-colors text-white font-semibold text-sm"
      >
        New Chat
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" /></svg>
      </button>

      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Recent Sessions</h2>
      <nav className="flex-grow overflow-y-auto -mr-1 pr-1">
        {sessionTree.map(session => (
            <div key={session.sessionId} className="space-y-1 py-1">
                <div className="group flex items-center justify-between">
                  <button
                    onClick={() => onSelectSession(session.sessionId)}
                    className={`flex-grow text-left p-2 rounded-md text-sm truncate transition-colors ${
                      session.sessionId === currentSessionId
                        ? 'bg-cyan-900/50 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={session.title || session.smeConfigs[0]?.segment}
                  >
                    {session.title || session.smeConfigs[0]?.segment}
                  </button>
                  {deletingSessionId === session.sessionId ? (
                    <div className="flex items-center flex-shrink-0 ml-1">
                        <button onClick={handleConfirmDelete} className="text-xs text-red-400 hover:underline">Delete?</button>
                        <span className="text-slate-600 mx-1">/</span>
                        <button onClick={() => setDeletingSessionId(null)} className="text-xs text-slate-400 hover:underline">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingSessionId(session.sessionId)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.71l.5 5a.75.75 0 1 1-1.474.14l-.5-5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .71.787l-.5 5a.75.75 0 1 1-1.474-.14l.5-5a.75.75 0 0 1 .764-.647Z" clipRule="evenodd" /></svg>
                    </button>
                  )}
                </div>
                {session.vaultChildren.length > 0 && (
                    <div className="pl-4 pt-1 pb-1 border-l-2 border-slate-700 ml-2">
                        <div className="space-y-1">
                            {session.vaultChildren.map(item => (
                                <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-md text-slate-400 hover:bg-slate-700/50 cursor-default" title={`Saved: ${item.smeConfig.segment}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-slate-500 flex-shrink-0"><path d="M3.75 2h8.5A1.75 1.75 0 0 1 14 3.75v9.5a.75.75 0 0 1-1.21.62L7.5 10.632 2.21 13.87a.75.75 0 0 1-1.21-.62V3.75C1 2.784 1.784 2 2.75 2H3c.414 0 .75.336.75.75v10.53l3.75-2.25 3.75 2.25V2.75a.75.75 0 0 0-.75-.75h-.5Z" /></svg>
                                    <span className="text-xs truncate">
                                        {item.smeConfig.segment}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        ))}
        {sessions.length === 0 && (
            <p className="text-xs text-slate-500 text-center px-2 py-4">No recent sessions found.</p>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
