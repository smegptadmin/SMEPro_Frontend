
import React, { useState, useEffect, useMemo } from 'react';
import { SmeConfig } from '../types';
import { SubscriptionPlan } from '../App';

interface AddSmeModalProps {
  plan: SubscriptionPlan;
  existingSmes: SmeConfig[];
  searchQuery?: string;
  onClose: () => void;
  onAddSme: (config: SmeConfig) => void;
}

const AddSmeModal: React.FC<AddSmeModalProps> = ({ plan, existingSmes, searchQuery, onClose, onAddSme }) => {
  const [level1, setLevel1] = useState('');
  const [level2, setLevel2] = useState('');
  const [level3, setLevel3] = useState('');
  const [search, setSearch] = useState(searchQuery || '');
  
  const [schema, setSchema] = useState<any>(null);
  const [allSmes, setAllSmes] = useState<SmeConfig[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  useEffect(() => {
    const schemaPath = plan === 'business' 
      ? '/schemas/business_categories.json' 
      : '/schemas/solo_categories.json';
      
    setIsLoadingSchema(true);
    fetch(schemaPath)
      .then(res => res.json())
      .then(data => {
        setSchema(data);
        setIsLoadingSchema(false);
      })
      .catch(err => {
        console.error(`Failed to load ${plan} schema`, err);
        setIsLoadingSchema(false);
      });
  }, [plan]);

  useEffect(() => {
    if (!schema) return;

    const generatedSmes: SmeConfig[] = [];
    const isBusiness = plan === 'business';
    const level1Prop = isBusiness ? 'industry' : 'category';
    const level2Prop = isBusiness ? 'subType' : 'subCategory';
    const level3Prop = isBusiness ? 'organizationalSegment' : 'specificOption';

    const industries = schema.properties[level1Prop]?.enum || [];
    const segments = isBusiness ? (schema.properties[level3Prop]?.enum || []) : [];

    for (const industry of industries) {
        const subTypeRule = schema.allOf.find((r: any) => r.if.properties?.[level1Prop]?.const === industry);
        const subTypes = subTypeRule?.then.properties[level2Prop]?.enum || [];

        if (isBusiness) {
            for (const subType of subTypes) {
                for (const segment of segments) {
                    generatedSmes.push({ industry, subType, segment });
                }
            }
        } else { // Solo plan
            for (const subType of subTypes) {
                const segmentRule = schema.allOf.find((r: any) => r.if.properties?.[level2Prop]?.const === subType);
                const specificOptions = segmentRule?.then.properties[level3Prop]?.enum || [];
                for (const segment of specificOptions) {
                    generatedSmes.push({ industry: industry, subType: subType, segment: segment });
                }
            }
        }
    }
    setAllSmes(generatedSmes);
  }, [schema, plan]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const lowerCaseSearch = search.toLowerCase();
    return allSmes.filter(sme => 
        sme.industry.toLowerCase().includes(lowerCaseSearch) ||
        sme.subType.toLowerCase().includes(lowerCaseSearch) ||
        sme.segment.toLowerCase().includes(lowerCaseSearch)
    );
  }, [search, allSmes]);

  useEffect(() => { setLevel2(''); setLevel3(''); }, [level1]);
  useEffect(() => { setLevel3(''); }, [level2]);

  const isBusiness = plan === 'business';
  const level1Prop = isBusiness ? 'industry' : 'category';
  const level2Prop = isBusiness ? 'subType' : 'subCategory';
  const level3Prop = isBusiness ? 'organizationalSegment' : 'specificOption';

  const level1Options = useMemo(() => schema?.properties[level1Prop]?.enum || [], [schema, level1Prop]);
  const level2Options = useMemo(() => {
    if (!level1 || !schema) return [];
    const rule = schema.allOf.find((r: any) => r.if.properties?.[level1Prop]?.const === level1);
    return rule?.then.properties[level2Prop]?.enum || [];
  }, [schema, level1, level1Prop, level2Prop]);
  const level3Options = useMemo(() => {
    if (!schema) return [];
    if (isBusiness) return schema.properties[level3Prop]?.enum || [];
    if (!level2) return [];
    const rule = schema.allOf.find((r: any) => r.if.properties?.[level2Prop]?.const === level2);
    return rule?.then.properties[level3Prop]?.enum || [];
  }, [schema, isBusiness, level2, level2Prop, level3Prop]);

  const isSmeDuplicate = (sme: SmeConfig) => {
    return existingSmes.some(existing => 
        existing.industry === sme.industry &&
        existing.subType === sme.subType &&
        existing.segment === sme.segment
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig = { industry: level1, subType: level2, segment: level3 };
    if (level1 && level2 && level3 && !isSmeDuplicate(newConfig)) {
      onAddSme(newConfig);
    }
  };
  
  const isFormComplete = level1 && level2 && level3;
  const selectStyles = "w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10 w-full max-w-lg p-6 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-white">Add an Expert</h2>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
            </button>
        </div>
        <p className="text-slate-300 mb-4 text-sm flex-shrink-0">Search for an expert or use the dropdowns to specify.</p>
        
        <div className="relative mb-4 flex-shrink-0">
            <input
                type="text"
                placeholder="Search by industry, role, or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 pl-10 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" /></svg>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 -mr-4">
        {search.trim() ? (
            <div className="space-y-2">
                {isLoadingSchema ? <p className="text-slate-400 text-center">Loading...</p> :
                searchResults.length > 0 ? searchResults.map((sme, index) => {
                    const isDuplicate = isSmeDuplicate(sme);
                    return (
                        <button 
                            key={index} 
                            onClick={() => onAddSme(sme)}
                            disabled={isDuplicate}
                            className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700/50 transition-colors"
                        >
                            <p className="font-semibold text-white">{sme.segment}</p>
                            <p className="text-sm text-slate-400">{sme.industry} / {sme.subType}</p>
                            {isDuplicate && <p className="text-xs text-amber-400 mt-1">Already in session</p>}
                        </button>
                    )
                }) : <p className="text-slate-400 text-center py-4">No results found for "{search}".</p>
                }
            </div>
        ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
                <select value={level1} onChange={(e) => setLevel1(e.target.value)} className={selectStyles}>
                    <option value="" disabled>{isBusiness ? 'Choose an industry...' : 'Choose a category...'}</option>
                    {level1Options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div>
                <select value={level2} onChange={(e) => setLevel2(e.target.value)} className={selectStyles} disabled={!level1}>
                    <option value="" disabled>{isBusiness ? 'Choose a sub-type...' : 'Choose a sub-category...'}</option>
                    {level2Options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div>
                <select value={level3} onChange={(e) => setLevel3(e.target.value)} className={selectStyles} disabled={!level2}>
                    <option value="" disabled>{isBusiness ? 'Choose a segment...' : 'Choose a specific option...'}</option>
                    {level3Options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-500">
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!isFormComplete || isSmeDuplicate({ industry: level1, subType: level2, segment: level3 })}
                    className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    Add Expert
                </button>
            </div>
            </form>
        )}
        </div>
      </div>
    </div>
  );
};

export default AddSmeModal;
