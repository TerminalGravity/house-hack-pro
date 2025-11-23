
export enum PropertyStatus {
  Lead = 'Lead',
  Analyzing = 'Analyzing',
  OfferMade = 'Offer Made',
  UnderContract = 'Under Contract',
  Owned = 'Owned'
}

export interface Unit {
  id: string;
  name: string; // e.g., "Unit A"
  bedrooms: number;
  bathrooms: number;
  estimatedRent: number;
  isOwnerOccupied: boolean;
}

export interface Property {
  id: string;
  workspaceId?: string; // Optional for backward compatibility
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  units: Unit[];
  taxesYearly: number;
  insuranceYearly: number;
  status: PropertyStatus;
  notes: string;
  images?: string[];
}

export interface Workspace {
  id: string;
  name: string; // e.g., "Austin Market"
  locationString: string; // e.g., "Austin, TX"
}

export interface LoanScenario {
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  mipRate: number; // FHA Mortgage Insurance Premium (usually 0.85% or 0.55%)
}

export interface CalculationResult {
  loanAmount: number;
  monthlyPrincipalInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyMIP: number;
  totalPITI: number;
  grossRentalIncome: number;
  netRentalIncome: number; // Adjusted by vacancy factor (usually 75% for FHA self-sufficiency)
  cashFlow: number;
  selfSufficiencyPass: boolean; // Specific to 3-4 units
  dscr?: number;
}

export interface FHALimit {
  county: string;
  oneUnit: number;
  twoUnit: number;
  threeUnit: number;
  fourUnit: number;
}
