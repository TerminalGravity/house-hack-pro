
import React, { useState } from 'react';
import { Property, PropertyStatus, Workspace } from '../types';
import { Card } from './ui/Card';
import { DealFinder } from './DealFinder';
import { Plus, Home, DollarSign, Activity, ArrowRight, MapPin, Search, LayoutGrid, FolderPlus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  properties: Property[];
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  onSelectProperty: (property: Property) => void;
  onNewProperty: () => void;
  onAddProperty: (property: Property) => void;
  onSelectWorkspace: (id: string | null) => void;
  onAddWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  properties, 
  workspaces,
  currentWorkspaceId,
  onSelectProperty, 
  onNewProperty,
  onAddProperty,
  onSelectWorkspace,
  onAddWorkspace,
  onDeleteWorkspace
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'finder'>('overview');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);

  const filteredProperties = currentWorkspaceId 
    ? properties.filter(p => p.workspaceId === currentWorkspaceId)
    : properties;

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId);

  const stats = {
    total: filteredProperties.length,
    analyzing: filteredProperties.filter(p => p.status === PropertyStatus.Analyzing).length,
    offers: filteredProperties.filter(p => p.status === PropertyStatus.OfferMade).length,
  };

  const chartData = filteredProperties.map(p => ({
    name: p.address.split(',')[0],
    price: p.price,
    units: p.units.length
  }));

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    const newWs: Workspace = {
      id: Date.now().toString(),
      name: newWorkspaceName,
      locationString: newWorkspaceName 
    };
    onAddWorkspace(newWs);
    setNewWorkspaceName('');
    setIsAddingWorkspace(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-100px)]">
      {/* Sidebar - Workspaces */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Workspaces</h3>
           <div className="space-y-1">
             <button
               onClick={() => { onSelectWorkspace(null); setActiveTab('overview'); }}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${!currentWorkspaceId ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               <LayoutGrid size={16} /> All Properties
             </button>
             {workspaces.map(ws => (
               <div key={ws.id} className="group relative">
                  <button
                    onClick={() => { onSelectWorkspace(ws.id); setActiveTab('overview'); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${currentWorkspaceId === ws.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <MapPin size={16} /> {ws.name}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteWorkspace(ws.id); }}
                    className="absolute right-2 top-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
               </div>
             ))}
           </div>
           
           {isAddingWorkspace ? (
             <form onSubmit={handleCreateWorkspace} className="mt-4 px-2">
               <input 
                 autoFocus
                 className="w-full text-sm border border-slate-300 rounded p-1.5 mb-2 focus:border-brand-500 focus:outline-none"
                 placeholder="City, State"
                 value={newWorkspaceName}
                 onChange={(e) => setNewWorkspaceName(e.target.value)}
               />
               <div className="flex gap-2">
                 <button type="submit" className="text-xs bg-slate-900 text-white px-2 py-1 rounded">Save</button>
                 <button type="button" onClick={() => setIsAddingWorkspace(false)} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Cancel</button>
               </div>
             </form>
           ) : (
             <button 
               onClick={() => setIsAddingWorkspace(true)}
               className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-brand-600 border border-dashed border-slate-300 hover:border-brand-300 rounded-lg p-2 transition-colors"
             >
               <FolderPlus size={16} /> Add Market
             </button>
           )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Workspace Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {currentWorkspace ? currentWorkspace.name : 'All Properties'}
              {currentWorkspace && <span className="text-xs font-normal bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Workspace</span>}
            </h1>
            <p className="text-slate-500">{currentWorkspace ? `Manage properties and find deals in ${currentWorkspace.locationString}` : 'Portfolio Overview'}</p>
          </div>
          <div className="flex gap-2">
             {currentWorkspace && (
               <div className="bg-white p-1 rounded-lg border border-slate-200 flex">
                 <button 
                   onClick={() => setActiveTab('overview')}
                   className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Overview
                 </button>
                 <button 
                   onClick={() => setActiveTab('finder')}
                   className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'finder' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   <Search size={14} /> Find Deals
                 </button>
               </div>
             )}
             {activeTab === 'overview' && (
              <button 
                onClick={onNewProperty}
                className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus size={18} />
                Add Property
              </button>
             )}
          </div>
        </header>

        {activeTab === 'finder' && currentWorkspace ? (
          <DealFinder workspace={currentWorkspace} onAddProperty={onAddProperty} />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-brand-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-50 rounded-full text-brand-600">
                    <Home size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Total Tracked</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                </div>
              </Card>
              <Card className="border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Analyzing</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.analyzing}</p>
                  </div>
                </div>
              </Card>
              <Card className="border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Offers Made</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.offers}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Property List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Properties</h2>
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No properties in this view.</p>
                    {currentWorkspace && (
                      <button onClick={() => setActiveTab('finder')} className="text-brand-600 font-medium hover:underline mt-2">
                        Find deals in {currentWorkspace.name} &rarr;
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredProperties.map(property => (
                      <div 
                        key={property.id}
                        onClick={() => onSelectProperty(property)}
                        className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row justify-between md:items-center gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={property.images?.[0] || `https://picsum.photos/seed/${property.id}/100/100`} 
                              alt="Property" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{property.address}</h3>
                            <p className="text-slate-500 text-sm">{property.city}, {property.state}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                                {property.units.length} Units
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                                property.status === PropertyStatus.Analyzing ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                property.status === PropertyStatus.OfferMade ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-slate-50 text-slate-700 border-slate-100'
                              }`}>
                                {property.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                          <div className="text-right">
                            <p className="text-sm text-slate-500">List Price</p>
                            <p className="font-bold text-slate-900">${property.price.toLocaleString()}</p>
                          </div>
                          <ArrowRight size={20} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Chart */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Price Compare</h2>
                <Card className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" hide />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
                        />
                        <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0ea5e9' : '#6366f1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
