import React, { useState, useEffect, useMemo } from 'react';
import { Property, LoanScenario, CalculationResult, Unit } from '../types';
import { Card } from './ui/Card';
import { Calculator, CheckCircle, AlertTriangle, XCircle, RefreshCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface FHACalculatorProps {
  property: Property;
  scenario: LoanScenario;
  onUpdateScenario: (scenario: LoanScenario) => void;
}

export const FHACalculator: React.FC<FHACalculatorProps> = ({ property, scenario, onUpdateScenario }) => {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'sufficiency'>('breakdown');

  // Calculation Logic
  const result: CalculationResult = useMemo(() => {
    const loanAmount = property.price * (1 - scenario.downPaymentPercent / 100);
    const monthlyRate = scenario.interestRate / 100 / 12;
    const numberOfPayments = scenario.loanTermYears * 12;
    
    // Standard Mortgage Formula
    const monthlyPrincipalInterest = 
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const monthlyTaxes = property.taxesYearly / 12;
    const monthlyInsurance = property.insuranceYearly / 12;
    
    // FHA MIP Calculation (Annual MIP / 12)
    const monthlyMIP = (loanAmount * (scenario.mipRate / 100)) / 12;

    const totalPITI = monthlyPrincipalInterest + monthlyTaxes + monthlyInsurance + monthlyMIP;

    // Rental Income Logic
    const grossRentalIncome = property.units.reduce((sum, unit) => sum + unit.estimatedRent, 0);
    
    // Self Sufficiency Test (Only for 3-4 units)
    // Rule: 75% of Gross Rents must be >= PITI
    const netRentalIncome = grossRentalIncome * 0.75;
    const selfSufficiencyPass = property.units.length >= 3 ? netRentalIncome >= totalPITI : true; 

    const cashFlow = grossRentalIncome - totalPITI; // Simple cashflow (doesn't account for CapEx/Repairs/Vacancy in this simple view)

    return {
      loanAmount,
      monthlyPrincipalInterest,
      monthlyTaxes,
      monthlyInsurance,
      monthlyMIP,
      totalPITI,
      grossRentalIncome,
      netRentalIncome,
      cashFlow,
      selfSufficiencyPass
    };
  }, [property, scenario]);

  const dataPITI = [
    { name: 'P&I', value: result.monthlyPrincipalInterest, color: '#3b82f6' },
    { name: 'Taxes', value: result.monthlyTaxes, color: '#f59e0b' },
    { name: 'Insurance', value: result.monthlyInsurance, color: '#10b981' },
    { name: 'MIP', value: result.monthlyMIP, color: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-5 space-y-6">
        <Card title="Loan Scenario" className="h-full">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Down Payment (%)</label>
              <input 
                type="number" 
                value={scenario.downPaymentPercent}
                onChange={(e) => onUpdateScenario({...scenario, downPaymentPercent: parseFloat(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <div className="text-xs text-slate-500 mt-1">
                Amount: ${((property.price * scenario.downPaymentPercent) / 100).toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
              <input 
                type="number" 
                step="0.125"
                value={scenario.interestRate}
                onChange={(e) => onUpdateScenario({...scenario, interestRate: parseFloat(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loan Term (Years)</label>
              <select 
                value={scenario.loanTermYears}
                onChange={(e) => onUpdateScenario({...scenario, loanTermYears: parseInt(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value={30}>30 Years</option>
                <option value={15}>15 Years</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">FHA MIP Rate (%)</label>
              <input 
                type="number" 
                step="0.01"
                value={scenario.mipRate}
                onChange={(e) => onUpdateScenario({...scenario, mipRate: parseFloat(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">Typically 0.55% or 0.85% for FHA loans.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column: Results */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="h-full">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
             <h2 className="text-xl font-bold text-slate-800">Monthly Breakdown</h2>
             <div className="text-right">
                <p className="text-sm text-slate-500">Total PITI</p>
                <p className="text-2xl font-bold text-slate-900">${Math.round(result.totalPITI).toLocaleString()}</p>
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Chart */}
            <div className="w-full md:w-1/2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={dataPITI} 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                  >
                    {dataPITI.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `$${Math.round(value)}`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="w-full md:w-1/2 space-y-3">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600">Principal & Interest</span>
                 <span className="font-medium">${Math.round(result.monthlyPrincipalInterest).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600">Property Taxes</span>
                 <span className="font-medium">${Math.round(result.monthlyTaxes).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600">Home Insurance</span>
                 <span className="font-medium">${Math.round(result.monthlyInsurance).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-600">Mortgage Insurance (MIP)</span>
                 <span className="font-medium">${Math.round(result.monthlyMIP).toLocaleString()}</span>
               </div>
               <hr className="border-slate-100" />
               <div className="flex justify-between text-sm font-semibold bg-slate-50 p-2 rounded">
                 <span className="text-slate-700">Gross Cash Flow</span>
                 <span className={result.cashFlow >= 0 ? "text-emerald-600" : "text-red-600"}>
                    {result.cashFlow >= 0 ? '+' : ''}${Math.round(result.cashFlow).toLocaleString()}
                 </span>
               </div>
            </div>
          </div>
          
          {/* Self Sufficiency Badge */}
          {property.units.length >= 3 && (
            <div className={`mt-6 p-4 rounded-lg border ${result.selfSufficiencyPass ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                 {result.selfSufficiencyPass ? <CheckCircle className="text-emerald-600 mt-0.5" /> : <XCircle className="text-red-600 mt-0.5" />}
                 <div>
                    <h3 className={`font-bold ${result.selfSufficiencyPass ? 'text-emerald-800' : 'text-red-800'}`}>
                      FHA Self-Sufficiency Test: {result.selfSufficiencyPass ? 'PASS' : 'FAIL'}
                    </h3>
                    <p className={`text-sm mt-1 ${result.selfSufficiencyPass ? 'text-emerald-700' : 'text-red-700'}`}>
                      Net Rental Income (75% of Gross: <b>${Math.round(result.netRentalIncome).toLocaleString()}</b>) 
                      {result.selfSufficiencyPass ? ' exceeds ' : ' is less than '} 
                      Total PITI (<b>${Math.round(result.totalPITI).toLocaleString()}</b>).
                    </p>
                 </div>
              </div>
            </div>
          )}

          {property.units.length < 3 && (
             <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-3">
                <CheckCircle className="text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-800">Exempt from Self-Sufficiency</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    This property has fewer than 3 units, so the FHA Self-Sufficiency test does not strictly apply, 
                    though positive cash flow is still recommended!
                  </p>
                </div>
             </div>
          )}
        </Card>
      </div>
    </div>
  );
};