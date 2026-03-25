import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/format";
import type { FuelPriceItem } from "@/lib/types";

interface FuelPriceTableProps {
  prices: FuelPriceItem[];
  date: string;
  source: string;
  loading: boolean;
}

export function FuelPriceTable({
  prices,
  date,
  source,
  loading,
}: FuelPriceTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Giá xăng dầu hôm nay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[4.5rem] animate-pulse rounded-xl bg-muted/60"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (prices.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-base font-semibold">Giá xăng dầu hôm nay</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground p-4">
            Dữ liệu tạm thời không khả dụng. Bạn có thể tự nhập giá thủ công để tính toán.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">Bảng giá nhiên liệu</CardTitle>
          <div className="flex items-center gap-2">
            {date && (
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{date}</span>
            )}
            <Badge variant="outline" className="text-[10px] font-medium border-primary/20 bg-primary/5 text-primary">
              {source}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {prices.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
            >
              <p className="text-xs font-medium text-muted-foreground text-center mb-1">{item.name}</p>
              <p className="text-base md:text-lg font-bold text-foreground tabular-nums">
                {formatVND(item.price)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
