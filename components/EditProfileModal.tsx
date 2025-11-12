

import React, { useState } from 'react';
import { UserProfile, ApiConnector, ApiProvider } from '../types';
import { PLAN_DETAILS } from '../constants';
import { apiSyncService } from '../services/api_sync_service';
import { backend } from '../services/backend';

interface EditProfileModalProps {
  currentUserProfile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onClose: () => void;
  onNavigateToPlans: () => void;
  onSyncComplete: () => void;
}

const PROVIDERS: ApiProvider[] = ['openai', 'grok', 'aws', 'gemini'];

const ConnectorRow: React.FC<{
    connector: ApiConnector;
    onUpdate: (updatedConnector: ApiConnector) => void;
}> = ({ connector, onUpdate }) => {
    const [apiKey, setApiKey] = useState(connector.apiKey);
    const [isEditing, setIsEditing] = useState(false);

    const handleSaveKey = () => {
        onUpdate({ ...connector, apiKey });
        setIsEditing(false);
    };

    const handleToggle = () => {
        if (!connector.apiKey) {
            alert(`Please add an API key for ${connector.provider.toUpperCase()} first.`);
            return;
        }
        onUpdate({ ...connector, isEnabled: !connector.isEnabled });
    };

    const providerName = connector.provider.charAt(0).toUpperCase() + connector.provider.slice(1);
    
    return (
        <div className="grid grid-cols-5 gap-3 items-center text-sm p-2 bg-slate-700/50 rounded-lg">
            <div className="col-span-1 font-semibold text-white">{providerName}</div>
            <div className="col-span-2">
                {isEditing ? (
                     <input
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder={`Enter ${providerName} API Key...`}
                        className="w-full text-xs p-1 bg-slate-600 border border-slate-500 rounded focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                ) : (
                    <input
                        type="password"
                        value={apiKey}
                        readOnly
                        placeholder="API Key not set"
                        className="w-full text-xs p-1 bg-slate-800 border border-slate-700 rounded outline-none"
                    />
                )}
            </div>
            <div className="col-span-1 flex items-center gap-2">
                 {isEditing ? (
                    <button onClick={handleSaveKey} className="text-xs text-cyan-400 hover:underline">Save</button>
                 ) : (
                    <button onClick={() => setIsEditing(true)} className="text-xs text-slate-400 hover:underline">Edit</button>
                 )}
            </div>
            <div className="col-span-1 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={handleToggle}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${connector.isEnabled ? 'bg-cyan-600' : 'bg-slate-600'}`}
                        role="switch"
                        aria-checked={connector.isEnabled}
                        disabled={connector.syncStatus === 'syncing'}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${connector.isEnabled ? 'translate-x-4' : 'translate-x-0'}`}/>
                    </button>
                    {connector.syncStatus === 'syncing' && <div className="ml-2 w-3 h-3 border-2 border-t-white border-transparent rounded-full animate-spin"></div>}
                </div>
                 <span className={`text-xs font-bold ${
                    connector.syncStatus === 'synced' ? 'text-green-400' : 
                    connector.syncStatus === 'error' ? 'text-red-400' : 'text-slate-500'
                 }`}>{connector.syncStatus}</span>
            </div>
        </div>
    );
};


const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentUserProfile, onSave, onClose, onNavigateToPlans, onSyncComplete }) => {
  const [name, setName] = useState(currentUserProfile.name);
  const [email, setEmail] = useState(currentUserProfile.email);
  const [emailError, setEmailError] = useState('');
  const [connectors, setConnectors] = useState<ApiConnector[]>(() => {
    const existing = currentUserProfile.apiConnectors || [];
    const existingProviders = new Set(existing.map(c => c.provider));
    for (const provider of PROVIDERS) {
        if (!existingProviders.has(provider)) {
            existing.push({ provider, apiKey: '', isEnabled: false, syncStatus: 'idle' });
        }
    }
    return existing;
  });

  const handleConnectorUpdate = (updatedConnector: ApiConnector) => {
    const updatedConnectors = connectors.map(c => c.provider === updatedConnector.provider ? updatedConnector : c);
    setConnectors(updatedConnectors);
  };
  
  const handleSync = async (connector: ApiConnector) => {
    handleConnectorUpdate({ ...connector, syncStatus: 'syncing' });
    try {
        const newItems = await apiSyncService.sync(connector.provider, connector.apiKey);
        if (newItems.length > 0) {
            await backend.saveVaultItems(newItems);
        }
        handleConnectorUpdate({ ...connector, syncStatus: 'synced', lastSynced: Date.now(), isEnabled: true });
        onSyncComplete(); // Notify App to reload vault
    } catch (e) {
        console.error(`Sync failed for ${connector.provider}`, e);
        handleConnectorUpdate({ ...connector, syncStatus: 'error', isEnabled: false });
    }
  };

  const handleToggleSync = (updatedConnector: ApiConnector) => {
      // Logic for when a user toggles the switch
      if (updatedConnector.isEnabled) {
          // User is enabling the sync
          if (updatedConnector.syncStatus !== 'synced') {
              handleSync(updatedConnector);
          } else {
              handleConnectorUpdate(updatedConnector);
          }
      } else {
          // User is disabling the sync
          if (confirm(`This will remove all imported data from ${updatedConnector.provider.toUpperCase()} from your Vault. Are you sure?`)) {
              backend.deleteVaultItemsByOrigin(updatedConnector.provider).then(() => {
                   handleConnectorUpdate({ ...updatedConnector, isEnabled: false, syncStatus: 'idle' });
                   onSyncComplete();
              });
          }
      }
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && !emailError) {
      const updatedProfile: UserProfile = { 
        ...currentUserProfile, 
        name: name.trim(), 
        email: email.trim(),
        apiConnectors: connectors,
      };
      await onSave(updatedProfile);
    }
  };
  
  const isSyncing = connectors.some(c => c.syncStatus === 'syncing');
  const planDetails = PLAN_DETAILS[currentUserProfile.accountType];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-2xl p-8 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-white">Manage Profile</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
          </button>
        </div>
        <form onSubmit={handleSave} className="flex-grow overflow-y-auto pr-2 -mr-4">
          <h3 className="text-lg font-semibold text-white mb-4">Subscription & Billing</h3>
          <div className="bg-slate-700/50 p-4 rounded-lg flex justify-between items-center">
              <div>
                  <p className="text-white font-semibold">{planDetails.name} ({currentUserProfile.billingCycle === 'annual' ? 'Annual' : 'Monthly'})</p>
                  <p className="text-sm text-slate-400">{currentUserProfile.email}</p>
              </div>
              <button type="button" onClick={onNavigateToPlans} className="text-sm bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-500">
                  Change Plan
              </button>
          </div>
          
          <div className="border-t border-slate-700 my-6"></div>
          
          <h3 className="text-lg font-semibold text-white mb-4">API Connectors</h3>
          <p className="text-sm text-slate-400 mb-4">Connect your other AI service accounts. Enabling a connector will sync your conversation history into your SMEPro Vault.</p>
          <div className="space-y-3">
            {connectors.map(c => (
                <ConnectorRow key={c.provider} connector={c} onUpdate={handleToggleSync} />
            ))}
          </div>

        </form>
         <div className="flex-shrink-0 flex gap-4 pt-6 mt-6 border-t border-slate-700">
            <button
                type="button"
                onClick={onClose}
                className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500"
            >
                Cancel
            </button>
            <button
              type="submit"
              onClick={handleSave}
              disabled={isSyncing}
              className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              {isSyncing ? 'Syncing...' : 'Save & Close'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default EditProfileModal;