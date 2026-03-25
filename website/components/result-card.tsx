import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalculationResult } from "@/lib/types";

interface ResultCardProps {
  result: CalculationResult;
  formatVND: (value: number) => string;
}

/**
 * ResultCard displays the fuel cost calculation result in a prominent card
 * with breakdown of distance, fuel needed, fuel price, and total cost.
 */
export function ResultCard({ result, formatVND }: ResultCardProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-800">✅ Kết quả tính toán</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total cost highlight */}
        <div className="text-center">
          <p className="text-sm text-green-700">Tổng chi phí ước tính</p>
          <p className="text-4xl font-bold text-green-800 md:text-5xl">
            {formatVND(result.totalCost)}
          </p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-xs text-muted-foreground">Phương tiện</p>
            <p className="text-sm font-semibold">{result.vehicle.name}</p>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-xs text-muted-foreground">Quãng đường</p>
            <p className="text-sm font-semibold">{result.distance} km</p>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-xs text-muted-foreground">Xăng cần đổ</p>
            <p className="text-sm font-semibold">{result.fuelNeeded} lít</p>
          </div>
          <div className="rounded-lg bg-white p-3 text-center">
            <p className="text-xs text-muted-foreground">Đơn giá</p>
            <p className="text-sm font-semibold">
              {formatVND(result.fuelPrice)}/lít
            </p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-green-700">Loại nhiên liệu:</span>
          <Badge className="bg-green-700 text-white">{result.fuelType}</Badge>
        </div>

        {/* Tank fill info */}
        {result.vehicle.tank_capacity > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            💡 Bình xăng {result.vehicle.tank_capacity}L đổ đầy ≈{" "}
            {formatVND(result.vehicle.tank_capacity * result.fuelPrice)} | Đi
            được ≈{" "}
            {Math.round(
              (result.vehicle.tank_capacity /
                result.vehicle.fuel_consumption) *
                100
            )}{" "}
            km
          </p>
        )}
      </CardContent>
    </Card>
  );
}
