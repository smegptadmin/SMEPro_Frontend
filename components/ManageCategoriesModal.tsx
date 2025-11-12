
import React, { useState, useEffect } from 'react';
import { backend } from '../services/backend';

interface ManageCategoriesModalProps {
  onClose: () => void;
}

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
        const backendCategories = await backend.fetchCategories();
        setCategories(backendCategories);
    }
    loadData();
  }, []);
  
  const handleSaveChanges = async (updatedCategories: string[]) => {
      setIsSaving(true);
      try {
          await backend.saveCategories(updatedCategories);
          setCategories(updatedCategories);
      } catch (e) {
          console.error("Failed to save categories to backend", e);
          // Optionally, show an error to the user
      } finally {
          setIsSaving(false);
      }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      handleSaveChanges(updatedCategories);
      setNewCategory('');
    }
  };

  const handleStartEditing = (index: number) => {
    setEditingIndex(index);
    setEditingText(categories[index]);
  };

  const handleUpdateCategory = () => {
    if (editingIndex !== null && editingText.trim() && !categories.includes(editingText.trim())) {
      const updatedCategories = [...categories];
      updatedCategories[editingIndex] = editingText.trim();
      handleSaveChanges(updatedCategories);
      setEditingIndex(null);
      setEditingText('');
    } else {
      setEditingIndex(null);
      setEditingText('');
    }
  };

  const handleDeleteCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    handleSaveChanges(updatedCategories);
    setDeletingIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-lg p-6 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Manage Vault Categories</h2>
            {isSaving && <div className="w-5 h-5 border-2 border-t-cyan-500 border-slate-600 rounded-full animate-spin"></div>}
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-2">
          {categories.map((cat, index) => (
            <div key={index} className="category-item flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={handleUpdateCategory}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                  className="bg-slate-600 text-white rounded px-2 py-1 flex-grow"
                  autoFocus
                />
              ) : (
                <span className="text-white">{cat}</span>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => handleStartEditing(index)} className="p-1 text-slate-400 hover:text-cyan-400" title="Edit" disabled={isSaving}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M11.354 1.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.354.146H2.5a.5.5 0 0 1-.5-.5v-1.146a.5.5 0 0 1 .146-.354l10-10Z" /><path d="M10.5 2.5a.5.5 0 0 0-.5-.5H3a.5.5 0 0 0-.5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5V7h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h1.146l-2-2Z" /></svg>
                </button>
                <button onClick={() => setDeletingIndex(index)} className="p-1 text-slate-400 hover:text-red-500" title="Delete" disabled={isSaving}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.71l.5 5a.75.75 0 1 1-1.474.14l-.5-5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .71.787l-.5 5a.75.75 0 1 1-1.474-.14l.5-5a.75.75 0 0 1 .764-.647Z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex-shrink-0 pt-4 mt-4 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add new category..."
              className="w-full p-2 bg-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              disabled={isSaving}
            />
            <button onClick={handleAddCategory} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg disabled:bg-slate-600" disabled={isSaving}>
              Add
            </button>
          </div>
        </div>

        {deletingIndex !== null && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-600">
              <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
              <p className="text-slate-300 mt-2">Are you sure you want to delete the category "{categories[deletingIndex]}"?</p>
              <div className="flex justify-end gap-4 mt-6">
                <button onClick={() => setDeletingIndex(null)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button onClick={() => handleDeleteCategory(deletingIndex)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageCategoriesModal;
