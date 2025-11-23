
import React, { useState, useEffect } from 'react';
import { Property, Unit, LoanScenario, PropertyStatus } from '../types';
import { FHACalculator } from './FHACalculator';
import { estimateMarketRent, analyzeDealWithAI } from '../services/geminiService';
import { Card } from './ui/Card';
import { ArrowLeft, Save, Wand2, Loader2, FileText, CheckSquare, XCircle } from 'lucide-react';

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onSave: (property: Property) => void;
}

const DEFAULT_SCENARIO: LoanScenario = {
  downPaymentPercent: 3.5, // Standard FHA
  interestRate: 6.5,
  loanTermYears: 30,
  mipRate: 0.85
};

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ property: initialProperty, onBack, onSave }) => {
  const [property, setProperty] = useState<Property>(initialProperty);
  const [scenario, setScenario] = useState<LoanScenario>(DEFAULT_SCENARIO);
  const [loadingAI, setLoadingAI] = useState<string | null>(null); // id of unit being estimated
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  const updateUnit = (index: number, field: keyof Unit, value: any) => {
    const newUnits = [...property.units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setProperty({ ...property, units: newUnits });
  };

  const addUnit = () => {
    const newUnit: Unit = {
      id: Date.now().toString(),
      name: `Unit ${property.units.length + 1}`,
      bedrooms: 2,
      bathrooms: 1,
      estimatedRent: 0,
      isOwnerOccupied: false
    };
    setProperty({ ...property, units: [...property.units, newUnit] });
  };

  const removeUnit = (index: number) => {
    const newUnits = property.units.filter((_, i) => i !== index);
    setProperty({ ...property, units: newUnits });
  };

  const handleEstimateRent = async (index: number) => {
    const unit = property.units[index];
    setLoadingAI(unit.id);
    const result = await estimateMarketRent(property.address, unit.bedrooms, unit.bathrooms);
    updateUnit(index, 'estimatedRent', result.estimatedRent);
    setLoadingAI(null);
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    const financialSummary = `Price: ${property.price}, Taxes: ${property.taxesYearly}, Units: ${property.units.length}, Total Rent: ${property.units.reduce((a,b) => a + b.estimatedRent, 0)}`;
    const analysis = await analyzeDealWithAI(`${property.address} (${property.units.length} units)`, financialSummary);
    setAiAnalysis(analysis);
    setAnalyzing(false);
  };

  // Auto-save simulation
  useEffect(() => {
     // In a real app, debounce save
  }, [property]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleRunAnalysis}
             disabled={analyzing}
             className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
           >
             {analyzing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
             AI Deal Analysis
           </button>
           <button 
             onClick={() => onSave(property)}
             className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
           >
             <Save size={18} /> Save Changes
           </button>
        </div>
      </div>

      {/* Property Basics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Property Details">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-2">
                 <label className="label-text">Address</label>
                 <input 
                   className="input-field" 
                   value={property.address} 
                   onChange={(e) => setProperty({...property, address: e.target.value})} 
                 />
               </div>
               <div>
                 <label className="label-text">City</label>
                 <input className="input-field" value={property.city} onChange={(e) => setProperty({...property, city: e.target.value})} />
               </div>
               <div>
                 <label className="label-text">State</label>
                 <input className="input-field" value={property.state} onChange={(e) => setProperty({...property, state: e.target.value})} />
               </div>
               <div>
                 <label className="label-text">Price ($)</label>
                 <input type="number" className="input-field" value={property.price} onChange={(e) => setProperty({...property, price: parseFloat(e.target.value)})} />
               </div>
               <div>
                 <label className="label-text">Status</label>
                 <select 
                   className="input-field"
                   value={property.status}
                   onChange={(e) => setProperty({...property, status: e.target.value as PropertyStatus})}
                 >
                   {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
               <div>
                 <label className="label-text">Yearly Taxes ($)</label>
                 <input type="number" className="input-field" value={property.taxesYearly} onChange={(e) => setProperty({...property, taxesYearly: parseFloat(e.target.value)})} />
               </div>
               <div>
                 <label className="label-text">Yearly Insurance ($)</label>
                 <input type="number" className="input-field" value={property.insuranceYearly} onChange={(e) => setProperty({...property, insuranceYearly: parseFloat(e.target.value)})} />
               </div>
             </div>
          </Card>

          {/* Units Configuration */}
          <Card title="Unit Breakdown" action={<button onClick={addUnit} className="text-sm text-brand-600 font-medium">+ Add Unit</button>}>
            <div className="space-y-4">
              {property.units.map((unit, idx) => (
                <div key={unit.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="text-xs font-medium text-slate-500">Unit Name</label>
                        <input type="text" value={unit.name} onChange={(e) => updateUnit(idx, 'name', e.target.value)} className="w-full p-2 border rounded text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                           <label className="text-xs font-medium text-slate-500">Beds</label>
                           <input type="number" value={unit.bedrooms} onChange={(e) => updateUnit(idx, 'bedrooms', parseFloat(e.target.value))} className="w-full p-2 border rounded text-sm" />
                        </div>
                        <div className="flex-1">
                           <label className="text-xs font-medium text-slate-500">Baths</label>
                           <input type="number" value={unit.bathrooms} onChange={(e) => updateUnit(idx, 'bathrooms', parseFloat(e.target.value))} className="w-full p-2 border rounded text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 flex justify-between">
                          Est. Rent 
                          <button onClick={() => handleEstimateRent(idx)} className="text-brand-600 hover:underline flex items-center gap-1">
                            {loadingAI === unit.id ? <Loader2 className="animate-spin" size={10} /> : <Wand2 size={10} />} AI
                          </button>
                        </label>
                        <div className="relative">
                           <span className="absolute left-2 top-2 text-slate-400 text-sm">$</span>
                           <input 
                             type="number" 
                             value={unit.estimatedRent} 
                             onChange={(e) => updateUnit(idx, 'estimatedRent', parseFloat(e.target.value))} 
                             className="w-full pl-6 p-2 border rounded text-sm border-emerald-200 bg-emerald-50/50 text-emerald-800 font-medium" 
                            />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pb-2">
                        <input 
                          type="checkbox" 
                          checked={unit.isOwnerOccupied} 
                          onChange={(e) => updateUnit(idx, 'isOwnerOccupied', e.target.checked)}
                          className="h-4 w-4 text-brand-600 rounded"
                        />
                        <span className="text-sm text-slate-600">Owner Live-in?</span>
                      </div>
                   </div>
                   {property.units.length > 1 && (
                      <button onClick={() => removeUnit(idx)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"><XCircle size={16} /></button>
                   )}
                </div>
              ))}
            </div>
          </Card>
          
          {/* FHA Calculator Section */}
          <FHACalculator property={property} scenario={scenario} onUpdateScenario={setScenario} />
          
        </div>

        {/* Right Sidebar: Analysis & Notes */}
        <div className="space-y-6">
           {/* AI Analysis Result */}
           {aiAnalysis && (
             <Card title="AI Underwriter Opinion" className="border-indigo-200 bg-indigo-50/30">
               <div className="prose prose-sm prose-indigo max-w-none">
                 <div className="whitespace-pre-wrap text-slate-700 text-sm">{aiAnalysis}</div>
               </div>
             </Card>
           )}

           <Card title="Quick Checklist">
              <ul className="space-y-3">
                {[
                  "Verify Zoning (Duplex/Triplex/4-plex)",
                  "Check County FHA Loan Limits",
                  "Confirm Separate Meters",
                  "Estimate Repair Costs",
                  "Check Flood Zone"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckSquare size={16} className="mt-0.5 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
           </Card>
           
           <Card title="Notes">
              <textarea 
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                placeholder="Lender notes, showing details, etc..."
                value={property.notes}
                onChange={(e) => setProperty({...property, notes: e.target.value})}
              ></textarea>
           </Card>
        </div>
      </div>
      
      <style>{`
        .label-text {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 0.25rem;
        }
        .input-field {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          outline: none;
        }
        .input-field:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 2px #e0f2fe;
        }
      `}</style>
    </div>
  );
};
