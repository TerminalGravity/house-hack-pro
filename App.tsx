
import React, { useState } from 'react';
import { Property, PropertyStatus, Workspace } from './types';
import { Dashboard } from './components/Dashboard';
import { PropertyDetail } from './components/PropertyDetail';
import { Layout, Building2 } from 'lucide-react';

// Mock Initial Data
const MOCK_WORKSPACES: Workspace[] = [
  { id: 'ws1', name: 'Lake Havasu', locationString: 'Lake Havasu City, AZ' },
  { id: 'ws2', name: 'Phoenix Metro', locationString: 'Phoenix, AZ' }
];

const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    workspaceId: 'ws1',
    address: '2444 Hummingbird Ln',
    city: 'Lake Havasu City',
    state: 'AZ',
    zip: '86403',
    price: 525000,
    units: [
      { id: 'u1', name: 'Unit A', bedrooms: 3, bathrooms: 2, estimatedRent: 1800, isOwnerOccupied: true },
      { id: 'u2', name: 'Unit B', bedrooms: 2, bathrooms: 1, estimatedRent: 1400, isOwnerOccupied: false },
      { id: 'u3', name: 'Unit C', bedrooms: 2, bathrooms: 1, estimatedRent: 1400, isOwnerOccupied: false },
    ],
    taxesYearly: 2400,
    insuranceYearly: 1200,
    status: PropertyStatus.Analyzing,
    notes: 'Great potential for self-sufficiency. Needs minor cosmetic work.',
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'detail'>('dashboard');
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>('ws1');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const handleSelectProperty = (property: Property) => {
    setSelectedPropertyId(property.id);
    setView('detail');
  };

  const handleNewProperty = () => {
    const activeWs = workspaces.find(w => w.id === selectedWorkspaceId);
    
    const newProp: Property = {
      id: Date.now().toString(),
      workspaceId: selectedWorkspaceId || undefined,
      address: 'New Property',
      city: activeWs ? activeWs.locationString.split(',')[0] : '',
      state: activeWs ? activeWs.locationString.split(',')[1]?.trim() : 'AZ',
      zip: '',
      price: 0,
      units: [
        { id: '1', name: 'Main', bedrooms: 3, bathrooms: 2, estimatedRent: 0, isOwnerOccupied: true }
      ],
      taxesYearly: 0,
      insuranceYearly: 0,
      status: PropertyStatus.Lead,
      notes: ''
    };
    setProperties([newProp, ...properties]);
    setSelectedPropertyId(newProp.id);
    setView('detail');
  };

  const handleAddProperty = (property: Property) => {
    setProperties([property, ...properties]);
    // Optionally switch to detail view immediately:
    // setSelectedPropertyId(property.id);
    // setView('detail');
  };

  const handleSaveProperty = (updatedProperty: Property) => {
    setProperties(properties.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  };

  const handleAddWorkspace = (workspace: Workspace) => {
    setWorkspaces([...workspaces, workspace]);
    setSelectedWorkspaceId(workspace.id);
  };

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaces(workspaces.filter(w => w.id !== id));
    if (selectedWorkspaceId === id) setSelectedWorkspaceId(null);
  };

  const activeProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="bg-brand-600 p-1.5 rounded-lg mr-3">
                <Building2 className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">HouseHack<span className="text-brand-600">Pro</span></span>
            </div>
            <div className="flex items-center gap-4">
               <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                 Beta
               </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && (
          <Dashboard 
            properties={properties}
            workspaces={workspaces}
            currentWorkspaceId={selectedWorkspaceId}
            onSelectProperty={handleSelectProperty} 
            onNewProperty={handleNewProperty}
            onAddProperty={handleAddProperty}
            onSelectWorkspace={setSelectedWorkspaceId}
            onAddWorkspace={handleAddWorkspace}
            onDeleteWorkspace={handleDeleteWorkspace}
          />
        )}

        {view === 'detail' && activeProperty && (
          <PropertyDetail 
            property={activeProperty} 
            onBack={() => setView('dashboard')}
            onSave={handleSaveProperty}
          />
        )}
      </main>
    </div>
  );
};

export default App;
