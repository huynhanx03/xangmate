"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: (vehicle: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  isSelected,
  onSelect,
}: VehicleCardProps) {
  return (
    <button
      type="button"
      id={`vehicle-${vehicle.id}`}
      onClick={() => onSelect(vehicle)}
      className={cn(
        "group flex flex-col items-center gap-1.5 rounded-xl border p-3 text-left",
        "transition-colors duration-150",
        "hover:border-primary/40 hover:bg-primary/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "touch-action-manipulation",
        isSelected && "border-primary bg-primary/5 ring-1 ring-primary"
      )}
    >
      <div className="relative h-14 w-full sm:h-16">
        <Image
          src={vehicle.image || "/placeholder.svg"}
          alt={vehicle.name}
          fill
          className="object-contain transition-transform duration-150 group-hover:scale-105"
          sizes="120px"
          unoptimized
        />
      </div>
      <span className="w-full truncate text-center text-xs font-medium leading-tight">
        {vehicle.name}
      </span>
      <span className="text-[10px] tabular-nums text-muted-foreground">
        {vehicle.fuel_consumption > 0
          ? `${vehicle.fuel_consumption}L/100km`
          : "⚡ Điện"}
      </span>
    </button>
  );
}
