"use client";

import { useState, useEffect } from "react";
import type { Vehicle, FuelPriceItem, FuelPriceResponse } from "@/lib/types";
import vehicles from "@/data/vehicles.json";
import { VehicleSelector } from "./vehicle-selector";
import { FuelCalculator } from "./fuel-calculator";
import { FuelPriceTable } from "./fuel-price-table";

export function XangMateCalculator() {
  const [fuelPrices, setFuelPrices] = useState<FuelPriceItem[]>([]);
  const [fuelDate, setFuelDate] = useState("");
  const [fuelSource, setFuelSource] = useState("");
  const [fuelLoading, setFuelLoading] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const res = await fetch("/api/fuel");
        const data: FuelPriceResponse = await res.json();
        setFuelPrices(data.prices);
        setFuelDate(data.date);
        setFuelSource(data.source);
      } catch {
        // intentionally empty fallback
      } finally {
        setFuelLoading(false);
      }
    }
    fetchPrices();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
      <div className="mb-10 space-y-3 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
          XangMate
        </h1>
        <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
          Tính toán chi phí đổ xăng và mô phỏng cột bơm trực tuyến
        </p>
      </div>

      <div className="mb-8">
        <FuelPriceTable
          prices={fuelPrices}
          date={fuelDate}
          source={fuelSource}
          loading={fuelLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-start">
        <div className="lg:sticky lg:top-6 z-10 space-y-4 shadow-sm bg-background">
          <FuelCalculator 
            selectedVehicle={selectedVehicle}
            fuelPrices={fuelPrices}
          />
        </div>

        <div className="space-y-8 pb-12">
          <VehicleSelector
            vehicles={vehicles as Vehicle[]}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
          />
        </div>
      </div>
    </div>
  );
}
