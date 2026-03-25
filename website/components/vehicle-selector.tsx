"use client";

import { useState, useMemo } from "react";
import { VehicleCard } from "./vehicle-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Vehicle } from "@/lib/types";
import { Search } from "lucide-react";

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function VehicleSelector({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
}: VehicleSelectorProps) {
  const [activeTab, setActiveTab] = useState<"motorbike" | "car">("motorbike");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesType = v.type === activeTab;
      const matchesBrand = selectedBrand ? v.brand === selectedBrand : true;
      const matchesSearch =
        searchQuery === "" ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesBrand && matchesSearch;
    });
  }, [vehicles, activeTab, selectedBrand, searchQuery]);

  const brands = useMemo(() => {
    const typeVehicles = vehicles.filter((v) => v.type === activeTab);
    const uniqueBrands = Array.from(new Set(typeVehicles.map((v) => v.brand)));
    return uniqueBrands.sort();
  }, [vehicles, activeTab]);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Chọn phương tiện
        </h2>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm mẫu xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as "motorbike" | "car");
            setSelectedBrand(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="motorbike">Xe máy</TabsTrigger>
            <TabsTrigger value="car">Ô tô</TabsTrigger>
          </TabsList>
        </Tabs>

        {brands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedBrand === null ? "default" : "secondary"}
              className="cursor-pointer transition-colors"
              onClick={() => setSelectedBrand(null)}
            >
              Tất cả
            </Badge>
            {brands.map((brand) => (
              <Badge
                key={brand}
                variant={selectedBrand === brand ? "default" : "secondary"}
                className="cursor-pointer transition-colors"
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {filteredVehicles.map((v) => (
          <VehicleCard
            key={v.id}
            vehicle={v}
            isSelected={selectedVehicle?.id === v.id}
            onSelect={onSelectVehicle}
          />
        ))}
        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
            Không tìm thấy xe phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}
