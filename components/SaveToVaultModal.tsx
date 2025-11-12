import React, { useState, useEffect } from 'react';
import { VaultItem, SmeConfig, Message } from '../types';
import { backend } from '../services/backend';

interface SaveToVaultModalProps {
  messageToSave: Message;
  smeConfig: SmeConfig;
  onClose: () => void;
  onSuccess: () => void; // To switch to the Vault view
  sessionTitle?: string;
  defaultCategory?: string;
}

const LOCAL_VAULT_KEY = 'smeProVault';

const SaveToVaultModal: React.FC<SaveToVaultModalProps> = ({ messageToSave, smeConfig, onClose, onSuccess, sessionTitle, defaultCategory }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  useEffect(() => {
    const loadCategories = async () => {
        try {
            const backendCategories = await backend.fetchCategories();
            setCategories(backendCategories);
            if (!defaultCategory) {
              setSelectedCategory(backendCategories[backendCategories.length - 1] || '');
            }
        } catch(err) {
            console.error("Failed to load vault categories from backend", err);
        }
    };
    loadCategories();
  }, [defaultCategory]);
  
  const handleSave = async () => {
    if (!selectedCategory) return;
    setStatus('saving');

    const newItem: VaultItem = {
      id: `vault_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      smeConfig,
      message: messageToSave,
      savedAt: Date.now(),
      category: selectedCategory,
      syncStatus: 'pending',
      sessionTitle,
      origin: 'smepro',
    };

    // Optimistic UI update: save to local storage immediately
    try {
      const existingVaultRaw = localStorage.getItem(LOCAL_VAULT_KEY);
      const existingVault: VaultItem[] = existingVaultRaw ? JSON.parse(existingVaultRaw) : [];
      const updatedVault = [...existingVault, newItem];
      localStorage.setItem(LOCAL_VAULT_KEY, JSON.stringify(updatedVault));
    } catch (e) {
      console.error("Failed to save to local vault", e);
      setStatus('idle');
      return;
    }

    // --- Backend Sync ---
    try {
        await backend.saveVaultItem(newItem);
        // If successful, update the sync status
        const updatedItem = { ...newItem, syncStatus: 'synced' as const };
        await backend.saveVaultItem(updatedItem);

    } catch(err) {
        console.error("Backend sync failed", err);
        // If failed, mark as error
        const updatedItem = { ...newItem, syncStatus: 'error' as const };
        await backend.saveVaultItem(updatedItem);
    }
    
    setStatus('success');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSuccess();
    onClose();
  };

  const renderContent = () => {
    if (status === 'saving' || status === 'success') {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          {status === 'saving' ? (
            <>
              <div className="w-10 h-10 border-4 border-t-cyan-500 border-slate-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-300">Saving & Syncing...</p>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-green-500"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.25 3.25-1.5-1.5a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.75-3.75Z" clipRule="evenodd" /></svg>
              <h3 className="mt-4 text-xl font-bold text-white">Saved!</h3>
              <p className="mt-1 text-slate-300">{defaultCategory ? 'Action item saved.' : 'Redirecting to your Vault...'}</p>
            </>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Save Insight to Vault</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">Select a Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              {categories.length === 0 ? (
                <option>Loading categories...</option>
              ) : (
                categories.map(cat => <option key={cat} value={cat}>{cat}</option>)
              )}
            </select>
          </div>
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={!selectedCategory || status !== 'idle'}
              className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 disabled:bg-slate-600"
            >
              Save to Vault
            </button>
          </div>
        </div>
      </>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-md p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default SaveToVaultModal;