
import React, { useState } from 'react';
import { Workspace, Property, PropertyStatus } from '../types';
import { findRealEstateDeals } from '../services/geminiService';
import { Card } from './ui/Card';
import { Search, Loader2, Plus, ExternalLink, MapPin } from 'lucide-react';

interface DealFinderProps {
  workspace: Workspace;
  onAddProperty: (property: Property) => void;
}

export const DealFinder: React.FC<DealFinderProps> = ({ workspace, onAddProperty }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ text: string; sources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Quick Add State
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropPrice, setNewPropPrice] = useState('');
  const [newPropUnits, setNewPropUnits] = useState('2');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults(null);
    const data = await findRealEstateDeals(workspace.locationString, query);
    setResults(data);
    setLoading(false);
  };

  const handleQuickAdd = () => {
    if (!newPropAddress) return;

    const unitCount = parseInt(newPropUnits);
    const units = Array.from({ length: unitCount }).map((_, i) => ({
      id: Date.now().toString() + i,
      name: `Unit ${i + 1}`,
      bedrooms: 2,
      bathrooms: 1,
      estimatedRent: 0,
      isOwnerOccupied: i === 0
    }));

    const property: Property = {
      id: Date.now().toString(),
      workspaceId: workspace.id,
      address: newPropAddress,
      city: workspace.locationString.split(',')[0].trim(),
      state: workspace.locationString.split(',')[1]?.trim() || '',
      zip: '',
      price: parseFloat(newPropPrice) || 0,
      units: units,
      taxesYearly: 0,
      insuranceYearly: 0,
      status: PropertyStatus.Lead,
      notes: 'Added from Deal Finder'
    };

    onAddProperty(property);
    setNewPropAddress('');
    setNewPropPrice('');
    setShowAddForm(false);
    // Optional: Toast notification here
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Find Deals in {workspace.name}</h2>
        <p className="text-indigo-100 mb-6">Use AI to scan the web for multi-family listings that match your criteria.</p>
        
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Duplex under $450k with fixer upper potential..."
            className="flex-1 px-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results Area */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mx-auto mb-4" />
              <p className="text-slate-500">Scanning real estate listings...</p>
            </div>
          )}

          {results && (
            <Card title="Search Results">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm mb-6">
                {results.text}
              </div>

              {results.sources.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sources</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {results.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 text-brand-600 text-xs transition-colors truncate border border-transparent hover:border-slate-200"
                      >
                        <ExternalLink size={12} className="flex-shrink-0" />
                        <span className="truncate">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Quick Add Sidebar */}
        <div className="space-y-4">
          <Card title="Quick Add Property" className="sticky top-24">
             <div className="space-y-4">
               <p className="text-sm text-slate-500">Found a good lead? Add it to your tracker quickly.</p>
               <div>
                 <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
                 <input 
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                    value={newPropAddress}
                    onChange={(e) => setNewPropAddress(e.target.value)}
                    placeholder="123 Main St"
                 />
               </div>
               <div className="flex gap-2">
                 <div className="flex-1">
                   <label className="block text-xs font-medium text-slate-700 mb-1">Price</label>
                   <input 
                      type="number"
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                      value={newPropPrice}
                      onChange={(e) => setNewPropPrice(e.target.value)}
                      placeholder="500000"
                   />
                 </div>
                 <div className="w-1/3">
                   <label className="block text-xs font-medium text-slate-700 mb-1">Units</label>
                   <select 
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                      value={newPropUnits}
                      onChange={(e) => setNewPropUnits(e.target.value)}
                   >
                     <option value="2">2</option>
                     <option value="3">3</option>
                     <option value="4">4</option>
                   </select>
                 </div>
               </div>
               <button 
                 onClick={handleQuickAdd}
                 className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
               >
                 <Plus size={16} /> Add Lead
               </button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
