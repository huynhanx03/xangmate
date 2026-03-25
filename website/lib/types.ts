export interface Vehicle {
  id: string;
  name: string;
  type: "motorbike" | "car";
  brand: string;
  image: string;
  tank_capacity: number;
  fuel_consumption: number;
  recommended_fuel: string;
}

export interface FuelPriceItem {
  name: string;
  price: number;
}

export interface FuelPriceResponse {
  date: string;
  prices: FuelPriceItem[];
  source: string;
}

export interface CalculationResult {
  vehicle: Vehicle;
  distance: number;
  fuelNeeded: number;
  fuelPrice: number;
  totalCost: number;
  fuelType: string;
}
